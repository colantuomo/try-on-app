import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, HarmBlockMethod, HarmBlockThreshold, HarmCategory } from '@google/genai'
import Replicate from 'replicate'

type InlineImagePart = {
    inlineData: {
        data: string
        mimeType: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const personInput = body?.personInput || (body?.personUrl ? { type: 'url', value: body.personUrl } : null)
        const clothingInput = body?.clothingInput || (body?.clothingUrl ? { type: 'url', value: body.clothingUrl } : null)
        const garmentScope = body?.garmentScope || 'upper'
        const provider = (process.env.IMAGE_PROVIDER || 'replicate').toLowerCase()
        const scopeText =
            garmentScope === 'lower'
                ? 'lower body with no exposed skin'
                : garmentScope === 'full'
                    ? 'fully clothed with no exposed skin'
                    : 'up to the waist with no exposed skin'
        const prompt =
            `Use the provided reference image of the person and the clothing image to generate a virtual fashion try-on result.

Preserve the original face, facial features, and natural expression exactly as in the reference image.
Preserve the original location, background, lighting, and camera perspective without modification.
Keep the original neutral pose and body proportions.

Apply the complete outfit from the clothing image in a realistic and natural way suitable for a fashion e-commerce catalog.

High-quality image with sharp details.
Focus on clothing appearance and fit, not on the body.
No exposed skin except face and hands.
No cleavage, no underwear, no transparent fabrics.
Generate only just one imagem
`
        if (!personInput || !clothingInput) {
            return NextResponse.json(
                { error: 'Ambas as imagens são obrigatórias' },
                { status: 400 }
            )
        }

        const isValidUrl = (value: string) => {
            try {
                const url = new URL(value)
                return url.protocol === 'http:' || url.protocol === 'https:'
            } catch {
                return false
            }
        }

        if (
            (personInput.type === 'url' && !isValidUrl(personInput.value)) ||
            (clothingInput.type === 'url' && !isValidUrl(clothingInput.value))
        ) {
            return NextResponse.json(
                { error: 'As URLs informadas não são válidas' },
                { status: 400 }
            )
        }

        const isDataUrl = (value: string) => value.startsWith('data:')
        const parseDataUrl = (value: string) => {
            const match = value.match(/^data:([^;]+);base64,(.*)$/)
            if (!match) return null
            return { mimeType: match[1], data: match[2] }
        }

        let resultUrl = ''

        if (provider === 'gemini') {
            if (!process.env.GEMINI_API_KEY) {
                return NextResponse.json(
                    { error: 'GEMINI_API_KEY não configurada. Veja o README para instruções.' },
                    { status: 500 }
                )
            }

            const geminiModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview'
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

            const toInlineImagePart = async (input: { type: string; value: string }): Promise<InlineImagePart> => {
                if (input.type === 'data' || isDataUrl(input.value)) {
                    const parsed = parseDataUrl(input.value)
                    if (!parsed) {
                        throw new Error('Imagem em formato invalido')
                    }
                    return {
                        inlineData: {
                            data: parsed.data,
                            mimeType: parsed.mimeType,
                        },
                    }
                }

                const response = await fetch(input.value)
                if (!response.ok) {
                    throw new Error(`Falha ao baixar imagem: ${input.value}`)
                }
                const mimeType = response.headers.get('content-type') || 'image/jpeg'
                const buffer = Buffer.from(await response.arrayBuffer())
                return {
                    inlineData: {
                        data: buffer.toString('base64'),
                        mimeType,
                    },
                }
            }

            const [personPart, clothingPart] = await Promise.all([
                toInlineImagePart(personInput),
                toInlineImagePart(clothingInput),
            ])

            const response = await ai.models.generateContent({
                model: geminiModel,
                contents: [prompt, personPart, clothingPart],
                config: {
                    temperature: 0.2,
                    topP: 0.9,
                    maxOutputTokens: 4096,
                    responseModalities: ['IMAGE'],
                    imageConfig: {
                        aspectRatio: '4:3',
                        imageSize: '1K',
                    },
                },
            })

            const finishReason = response.candidates?.[0]?.finishReason
            if (finishReason === 'IMAGE_SAFETY') {
                return NextResponse.json(
                    {
                        error: 'IMAGE_SAFETY',
                        finishReason,
                        message: 'A imagem utilizada e considerada nao segura.',
                    },
                    { status: 422 }
                )
            }

            const parts = response.candidates?.[0]?.content?.parts || []
            const imagePart = parts.find((part: { inlineData?: { data: string; mimeType: string } }) =>
                Boolean(part.inlineData?.data)
            )
            console.log('Resposta da Gemini recebida:', response)
            if (!imagePart?.inlineData?.data) {
                throw new Error('Resposta da Gemini nao contem imagem')
            }

            resultUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
        } else {
            if (!process.env.REPLICATE_API_TOKEN) {
                return NextResponse.json(
                    { error: 'REPLICATE_API_TOKEN não configurada. Veja o README para instruções.' },
                    { status: 500 }
                )
            }

            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
            })

            console.log('Iniciando processamento com Replicate...')

            if (personInput.type !== 'url' || clothingInput.type !== 'url') {
                return NextResponse.json(
                    { error: 'O Replicate exige URLs publicas. Use links em vez de upload.' },
                    { status: 422 }
                )
            }

            const output = await replicate.run(
                "google/nano-banana-pro",
                {
                    input: {
                        prompt,
                        image_input: [personInput.value, clothingInput.value],
                        resolution: '1K',
                        aspect_ratio: '4:3',
                        output_format: 'png',
                        safety_filter_level: 'block_only_high',
                    }
                }
            ) as string

            console.log('Processamento concluído!', output)

            resultUrl =
                Array.isArray(output)
                    ? output[0]
                    : typeof (output as { url?: () => string }).url === 'function'
                        ? (output as { url: () => string }).url()
                        : output
        }

        return NextResponse.json({
            success: true,
            resultUrl,
            message: 'Imagem gerada com sucesso usando IA!'
        })

    } catch (error) {
        console.error('Erro ao processar try-on:', error)
        return NextResponse.json(
            {
                error: 'Erro ao processar as imagens',
                details: error instanceof Error ? error.message : 'Erro desconhecido'
            },
            { status: 500 }
        )
    }
}
