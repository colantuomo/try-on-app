'use client'

import { useEffect, useMemo, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type HistoryItem = {
  url: string
  createdAt: string
}

type ImageInput = {
  type: 'url' | 'data'
  value: string
}

const HISTORY_KEY = 'tryon_history'
const SAVED_PERSON_KEY = 'tryon_saved_person'
const GEMINI_KEY_STORAGE = 'gemini_api_key'
const MAX_HISTORY = 20

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Validação de autenticação - redireciona se não estiver logado
  useEffect(() => {
    if (status === 'loading') return // Ainda carregando, aguarda

    if (status === 'unauthenticated' || !session) {
      router.replace('/login')
      return
    }
  }, [status, session, router])

  // Estado de carregamento da sessão
  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="mt-4 text-sm text-slate-600">Verificando autenticação...</p>
        </div>
      </main>
    )
  }

  // Se não há sessão válida, não renderiza nada (o useEffect já redirecionou)
  if (!session || status !== 'authenticated') {
    return null
  }

  const [personSource, setPersonSource] = useState<'url' | 'upload' | 'saved'>('url')
  const [clothingSource, setClothingSource] = useState<'url' | 'upload'>('url')
  const [personUrl, setPersonUrl] = useState('')
  const [clothingUrl, setClothingUrl] = useState('')
  const [personDataUrl, setPersonDataUrl] = useState('')
  const [clothingDataUrl, setClothingDataUrl] = useState('')
  const [savedPerson, setSavedPerson] = useState<ImageInput | null>(null)
  const [garmentScope, setGarmentScope] = useState('upper')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [rememberGeminiKey, setRememberGeminiKey] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[]
        setHistory(parsed)
        setActiveIndex(0)
      }
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_PERSON_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ImageInput
        setSavedPerson(parsed)
      }
    } catch {
      setSavedPerson(null)
    }
  }, [])

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(GEMINI_KEY_STORAGE)
      if (storedKey) {
        setGeminiApiKey(storedKey)
        setRememberGeminiKey(true)
      }
    } catch {
      // Ignore storage failures
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      // Ignore storage failures
    }
  }, [history])

  useEffect(() => {
    try {
      if (savedPerson) {
        localStorage.setItem(SAVED_PERSON_KEY, JSON.stringify(savedPerson))
      }
    } catch {
      // Ignore storage failures
    }
  }, [savedPerson])

  useEffect(() => {
    try {
      if (rememberGeminiKey && geminiApiKey) {
        localStorage.setItem(GEMINI_KEY_STORAGE, geminiApiKey)
      } else {
        localStorage.removeItem(GEMINI_KEY_STORAGE)
      }
    } catch {
      // Ignore storage failures
    }
  }, [geminiApiKey, rememberGeminiKey])

  const hasHistory = history.length > 0
  const activeHistoryItem = useMemo(() => history[activeIndex], [history, activeIndex])
  const hasSavedPerson = Boolean(savedPerson?.value)

  const isValidUrl = (value: string) => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  const isValidDataUrl = (value: string) =>
    value.startsWith('data:image/') && value.includes('base64,')

  useEffect(() => {
    if (personSource === 'url' && isValidUrl(personUrl)) {
      setSavedPerson({ type: 'url', value: personUrl.trim() })
      return
    }

    if (personSource === 'upload' && isValidDataUrl(personDataUrl)) {
      setSavedPerson({ type: 'data', value: personDataUrl })
    }
  }, [personSource, personUrl, personDataUrl])

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
      reader.readAsDataURL(file)
    })

  const getInputFromSource = (
    source: 'url' | 'upload' | 'saved',
    urlValue: string,
    dataValue: string,
    savedValue: ImageInput | null
  ): ImageInput | null => {
    if (source === 'saved') {
      return savedValue
    }

    if (source === 'url') {
      return urlValue ? { type: 'url', value: urlValue.trim() } : null
    }

    return dataValue ? { type: 'data', value: dataValue } : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const personInput = getInputFromSource(
      personSource,
      personUrl,
      personDataUrl,
      savedPerson
    )
    const clothingInput = getInputFromSource(
      clothingSource,
      clothingUrl,
      clothingDataUrl,
      null
    )

    if (!personInput || !clothingInput) {
      setError('Por favor, informe ou envie ambas as imagens')
      return
    }

    if (personInput.type === 'url' && !isValidUrl(personInput.value)) {
      setError('A URL da pessoa nao e valida')
      return
    }

    if (clothingInput.type === 'url' && !isValidUrl(clothingInput.value)) {
      setError('A URL da roupa nao e valida')
      return
    }

    if (personInput.type === 'data' && !isValidDataUrl(personInput.value)) {
      setError('A imagem da pessoa nao e valida')
      return
    }

    if (clothingInput.type === 'data' && !isValidDataUrl(clothingInput.value)) {
      setError('A imagem da roupa nao e valida')
      return
    }

    setLoading(true)
    setError(null)
    setResultImage(null)

    try {
      const response = await fetch('/api/try-on', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personInput,
          clothingInput,
          garmentScope,
          geminiApiKey: geminiApiKey.trim() || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (data?.finishReason === 'IMAGE_SAFETY' || data?.error === 'IMAGE_SAFETY') {
          throw new Error('A imagem utilizada e considerada nao segura.')
        }
        throw new Error(data?.error || 'Erro ao processar as imagens')
      }
      setResultImage(data.resultUrl)
      if (data.resultUrl) {
        const newItem: HistoryItem = {
          url: data.resultUrl,
          createdAt: new Date().toISOString(),
        }
        setHistory((prev) => [newItem, ...prev].slice(0, MAX_HISTORY))
        setActiveIndex(0)
        setSavedPerson(personInput)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + history.length) % history.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % history.length)
  }

  const handleSelect = (index: number) => {
    setActiveIndex(index)
  }

  const handleRemoveHistory = (index: number) => {
    setHistory((prev) => {
      const next = prev.filter((_, i) => i !== index)
      if (next.length === 0) {
        setActiveIndex(0)
        return next
      }
      if (activeIndex >= next.length) {
        setActiveIndex(next.length - 1)
      }
      return next
    })
  }

  const personInputPreview = getInputFromSource(
    personSource,
    personUrl,
    personDataUrl,
    savedPerson
  )
  const clothingInputPreview = getInputFromSource(
    clothingSource,
    clothingUrl,
    clothingDataUrl,
    null
  )
  const canSubmit = Boolean(personInputPreview && clothingInputPreview) && !loading

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-10">
      <div className="w-full max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            Ola, {session.user?.name ?? session.user?.email ?? 'usuario'}
          </div>
          <div className="flex flex-wrap gap-3">
            {status === 'authenticated' && session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
        <h1 className="text-center text-4xl font-bold text-slate-900">Virtual Try-On</h1>
        <p className="mt-3 text-center text-base text-slate-600">
          Informe o link da imagem ou faca upload para gerar o resultado com IA
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 rounded-2xl bg-white p-8 shadow-lg shadow-slate-200"
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-slate-700">Foto de corpo inteiro</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={
                      personSource === 'url'
                        ? 'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                        : 'rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700'
                    }
                    onClick={() => setPersonSource('url')}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    className={
                      personSource === 'upload'
                        ? 'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                        : 'rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700'
                    }
                    onClick={() => setPersonSource('upload')}
                  >
                    Enviar foto
                  </button>
                  <button
                    type="button"
                    className={
                      personSource === 'saved'
                        ? 'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                        : hasSavedPerson
                          ? 'rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700'
                          : 'rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-400'
                    }
                    onClick={() => hasSavedPerson && setPersonSource('saved')}
                    disabled={!hasSavedPerson}
                  >
                    Usar foto salva
                  </button>
                </div>
              </div>

              {personSource === 'url' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    id="person"
                    placeholder="https://exemplo.com/pessoa.jpg"
                    value={personUrl}
                    onChange={(e) => setPersonUrl(e.target.value)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <p className="text-xs text-slate-500">A imagem deve ser publica e acessivel pela internet.</p>
                </div>
              )}

              {personSource === 'upload' && (
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const dataUrl = await readFileAsDataUrl(file)
                      setPersonDataUrl(dataUrl)
                    }}
                    className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                  />
                  {personDataUrl && (
                    <div className="flex justify-center rounded-xl bg-slate-50 p-3">
                      <img
                        src={personDataUrl}
                        alt="Preview da pessoa"
                        className="max-h-52 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {personSource === 'saved' && savedPerson && (
                <div className="flex justify-center rounded-xl bg-slate-50 p-3">
                  <img
                    src={savedPerson.value}
                    alt="Foto salva"
                    className="max-h-52 rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-slate-700">Foto da roupa</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={
                      clothingSource === 'url'
                        ? 'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                        : 'rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700'
                    }
                    onClick={() => setClothingSource('url')}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    className={
                      clothingSource === 'upload'
                        ? 'rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white'
                        : 'rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700'
                    }
                    onClick={() => setClothingSource('upload')}
                  >
                    Enviar foto
                  </button>
                </div>
              </div>

              {clothingSource === 'url' && (
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    id="clothing"
                    placeholder="https://exemplo.com/roupa.jpg"
                    value={clothingUrl}
                    onChange={(e) => setClothingUrl(e.target.value)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <p className="text-xs text-slate-500">A imagem deve ser publica e acessivel pela internet.</p>
                </div>
              )}

              {clothingSource === 'upload' && (
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const dataUrl = await readFileAsDataUrl(file)
                      setClothingDataUrl(dataUrl)
                    }}
                    className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm"
                  />
                  {clothingDataUrl && (
                    <div className="flex justify-center rounded-xl bg-slate-50 p-3">
                      <img
                        src={clothingDataUrl}
                        alt="Preview da roupa"
                        className="max-h-52 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* <div className="mt-8 flex flex-col gap-3">
            <label htmlFor="scope" className="text-sm font-semibold text-slate-700">
              Area da roupa
            </label>
            <select
              id="scope"
              value={garmentScope}
              onChange={(e) => setGarmentScope(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="upper">Parte de cima</option>
              <option value="lower">Parte de baixo</option>
              <option value="full">Roupa completa</option>
            </select>
          </div> */}

          <p className="mt-6 text-sm text-slate-500">
            O prompt e fixo e otimizado para o modelo nano-banana-pro.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-semibold text-slate-700">
              Chave do Gemini
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Gere a sua em{' '}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-indigo-600 underline"
              >
                https://aistudio.google.com/api-keys
              </a>
            </p>
            <input
              type="password"
              placeholder="Cole sua chave aqui"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberGeminiKey}
                onChange={(e) => setRememberGeminiKey(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Salvar esta chave neste navegador
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processando...' : 'Gerar Imagem'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {resultImage && (
          <div className="mt-10 text-center">
            <h2 className="mb-6 text-xl font-semibold text-slate-800">Resultado:</h2>
            <img
              src={resultImage}
              alt="Resultado do try-on"
              className="mx-auto max-w-full rounded-2xl shadow-xl"
            />
          </div>
        )}

        {hasHistory && (
          <section className="mt-12 rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-800">Historico de imagens</h2>
              <span className="text-sm text-slate-500">{history.length} geradas</span>
            </div>

            <div className="mt-6 grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
              <button
                type="button"
                className="h-11 w-11 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700"
                onClick={handlePrev}
                disabled={history.length < 2}
                aria-label="Imagem anterior"
              >
                ◀
              </button>

              <div className="flex min-h-[260px] items-center justify-center rounded-2xl bg-slate-50 p-4">
                {activeHistoryItem && (
                  <img
                    src={activeHistoryItem.url}
                    alt="Imagem gerada anteriormente"
                    className="max-h-[360px] rounded-2xl shadow-lg"
                  />
                )}
              </div>

              <button
                type="button"
                className="h-11 w-11 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700"
                onClick={handleNext}
                disabled={history.length < 2}
                aria-label="Proxima imagem"
              >
                ▶
              </button>
            </div>

            <div className="mt-6 grid auto-cols-[minmax(90px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
              {history.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className={
                    index === activeIndex
                      ? 'relative rounded-xl border-2 border-indigo-400'
                      : 'relative rounded-xl border-2 border-transparent'
                  }
                >
                  <button
                    type="button"
                    className="block"
                    onClick={() => handleSelect(index)}
                  >
                    <img
                      src={item.url}
                      alt={`Imagem gerada ${index + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveHistory(index)}
                    aria-label="Remover imagem"
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-slate-700 shadow"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
