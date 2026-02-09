# Instruções do Projeto

## O que é este projeto?

Este projeto é um **app web de virtual try-on** desenvolvido com **Next.js**. Ele recebe duas fotos:

1. **Foto de corpo inteiro da pessoa**
2. **Foto da roupa que a pessoa quer usar**

Com a ajuda de uma **IA de try-on**, o sistema gera uma nova imagem da pessoa vestindo aquela roupa.

## Objetivo Principal

Permitir que usuários visualizem como uma roupa ficaria em seus corpos antes de comprar ou experimentar fisicamente.

## Tecnologias Utilizadas

- **Next.js 14** com App Router
- **React 18** + TypeScript
- **Sharp** para processamento de imagens
- API Routes do Next.js para backend

## Como Funciona

1. Usuário acessa a aplicação web
2. Faz upload de:
   - Sua foto de corpo inteiro
   - Foto da roupa desejada
3. Clica em "Gerar Imagem"
4. O sistema processa as imagens via IA
5. Retorna uma imagem da pessoa usando a roupa

## Estado Atual

✅ **A integração com IA está FUNCIONANDO!** 

O endpoint `/api/try-on` usa a **Replicate API** com o modelo **IDM-VTON** para gerar imagens reais de virtual try-on.

### Requisitos:
- Conta na Replicate (gratuita com créditos iniciais)
- API Token configurado em `.env.local`

### Como obter API Key:
Veja o arquivo **[GUIA_API_KEY.md](GUIA_API_KEY.md)** com passo a passo completo.

## Como Rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

