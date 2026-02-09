'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './page.module.css'

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
const MAX_HISTORY = 20

export default function Home() {
  const [personSource, setPersonSource] = useState<'url' | 'upload' | 'saved'>('url')
  const [clothingSource, setClothingSource] = useState<'url' | 'upload'>('url')
  const [personUrl, setPersonUrl] = useState('')
  const [clothingUrl, setClothingUrl] = useState('')
  const [personDataUrl, setPersonDataUrl] = useState('')
  const [clothingDataUrl, setClothingDataUrl] = useState('')
  const [savedPerson, setSavedPerson] = useState<ImageInput | null>(null)
  const [garmentScope, setGarmentScope] = useState('upper')
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

  const hasHistory = history.length > 0
  const activeHistoryItem = useMemo(() => history[activeIndex], [history, activeIndex])

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

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Virtual Try-On</h1>
        <p className={styles.subtitle}>
          Informe o link da imagem ou faca upload para gerar o resultado com IA
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.uploadSection}>
            <div className={styles.uploadBox}>
              <div className={styles.sourceRow}>
                <span className={styles.label}>Foto de corpo inteiro</span>
                <div className={styles.sourceButtons}>
                  <button
                    type="button"
                    className={
                      personSource === 'url'
                        ? `${styles.sourceButton} ${styles.sourceActive}`
                        : styles.sourceButton
                    }
                    onClick={() => setPersonSource('url')}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    className={
                      personSource === 'upload'
                        ? `${styles.sourceButton} ${styles.sourceActive}`
                        : styles.sourceButton
                    }
                    onClick={() => setPersonSource('upload')}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className={
                      personSource === 'saved'
                        ? `${styles.sourceButton} ${styles.sourceActive}`
                        : styles.sourceButton
                    }
                    onClick={() => savedPerson && setPersonSource('saved')}
                    disabled={!savedPerson}
                  >
                    Usar salva
                  </button>
                </div>
              </div>

              {personSource === 'url' && (
                <div className={styles.inputBlock}>
                  <input
                    type="url"
                    id="person"
                    placeholder="https://exemplo.com/pessoa.jpg"
                    value={personUrl}
                    onChange={(e) => setPersonUrl(e.target.value)}
                    className={styles.textInput}
                  />
                  <p className={styles.hint}>A imagem deve ser publica e acessivel pela internet.</p>
                </div>
              )}

              {personSource === 'upload' && (
                <div className={styles.inputBlock}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const dataUrl = await readFileAsDataUrl(file)
                      setPersonDataUrl(dataUrl)
                    }}
                    className={styles.fileInput}
                  />
                  {personDataUrl && (
                    <div className={styles.previewBox}>
                      <img
                        src={personDataUrl}
                        alt="Preview da pessoa"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              )}

              {personSource === 'saved' && savedPerson && (
                <div className={styles.previewBox}>
                  <img
                    src={savedPerson.value}
                    alt="Foto salva"
                    className={styles.previewImage}
                  />
                </div>
              )}
            </div>

            <div className={styles.uploadBox}>
              <div className={styles.sourceRow}>
                <span className={styles.label}>Foto da roupa</span>
                <div className={styles.sourceButtons}>
                  <button
                    type="button"
                    className={
                      clothingSource === 'url'
                        ? `${styles.sourceButton} ${styles.sourceActive}`
                        : styles.sourceButton
                    }
                    onClick={() => setClothingSource('url')}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    className={
                      clothingSource === 'upload'
                        ? `${styles.sourceButton} ${styles.sourceActive}`
                        : styles.sourceButton
                    }
                    onClick={() => setClothingSource('upload')}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {clothingSource === 'url' && (
                <div className={styles.inputBlock}>
                  <input
                    type="url"
                    id="clothing"
                    placeholder="https://exemplo.com/roupa.jpg"
                    value={clothingUrl}
                    onChange={(e) => setClothingUrl(e.target.value)}
                    className={styles.textInput}
                  />
                  <p className={styles.hint}>A imagem deve ser publica e acessivel pela internet.</p>
                </div>
              )}

              {clothingSource === 'upload' && (
                <div className={styles.inputBlock}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const dataUrl = await readFileAsDataUrl(file)
                      setClothingDataUrl(dataUrl)
                    }}
                    className={styles.fileInput}
                  />
                  {clothingDataUrl && (
                    <div className={styles.previewBox}>
                      <img
                        src={clothingDataUrl}
                        alt="Preview da roupa"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={styles.selectBox}>
            <label htmlFor="scope" className={styles.label}>
              Area da roupa
            </label>
            <select
              id="scope"
              value={garmentScope}
              onChange={(e) => setGarmentScope(e.target.value)}
              className={styles.selectInput}
            >
              <option value="upper">Parte de cima</option>
              <option value="lower">Parte de baixo</option>
              <option value="full">Roupa completa</option>
            </select>
          </div>

          <p className={styles.note}>
            O prompt e fixo e otimizado para o modelo nano-banana-pro.
          </p>

          <button
            type="submit"
            disabled={loading || !personUrl || !clothingUrl}
            className={styles.button}
          >
            {loading ? 'Processando...' : 'Gerar Imagem'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {resultImage && (
          <div className={styles.result}>
            <h2>Resultado:</h2>
            <img src={resultImage} alt="Resultado do try-on" className={styles.resultImage} />
          </div>
        )}

        {hasHistory && (
          <section className={styles.carousel}>
            <div className={styles.carouselHeader}>
              <h2>Historico de imagens</h2>
              <span className={styles.count}>{history.length} geradas</span>
            </div>

            <div className={styles.carouselMain}>
              <button
                type="button"
                className={styles.navButton}
                onClick={handlePrev}
                disabled={history.length < 2}
                aria-label="Imagem anterior"
              >
                ◀
              </button>

              <div className={styles.activeFrame}>
                {activeHistoryItem && (
                  <img
                    src={activeHistoryItem.url}
                    alt="Imagem gerada anteriormente"
                    className={styles.activeImage}
                  />
                )}
              </div>

              <button
                type="button"
                className={styles.navButton}
                onClick={handleNext}
                disabled={history.length < 2}
                aria-label="Proxima imagem"
              >
                ▶
              </button>
            </div>

            <div className={styles.thumbnailRow}>
              {history.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  type="button"
                  className={
                    index === activeIndex
                      ? `${styles.thumbButton} ${styles.thumbActive}`
                      : styles.thumbButton
                  }
                  onClick={() => handleSelect(index)}
                >
                  <img
                    src={item.url}
                    alt={`Imagem gerada ${index + 1}`}
                    className={styles.thumbnail}
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
