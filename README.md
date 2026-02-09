# Virtual Try-On Application

Este projeto é um aplicativo web de virtual try-on construído com **Next.js**. Ele permite que usuários forneçam uma foto de corpo inteiro e uma foto da roupa desejada, por **link** ou **upload**, e utiliza IA para gerar uma imagem da pessoa vestindo aquela roupa.

## 🎯 Funcionalidades

- Link ou upload das imagens (pessoa e roupa)
- Seletor de area da roupa: parte de cima, parte de baixo ou roupa completa
- Historico com carrossel das imagens geradas (salvo no localStorage)
- Foto de corpo inteiro salva para reuso em futuras sessoes
- Alternancia simples entre **Replicate** e **Gemini** via variavel de ambiente

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Replicate API** e **Gemini API** (geracao/edicao de imagens)

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## 🔑 Configuração da API (OBRIGATÓRIO)

### Passo a passo para obter a chave da Replicate:

1. **Escolha o provedor**
   - `replicate` ou `gemini`

2. **Crie a chave de API**
   - Replicate: https://replicate.com/account/api-tokens
   - Gemini: https://aistudio.google.com/apikey

3. **Configurar variáveis de ambiente**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env.local
   ```

4. **Editar `.env.local`**
   ```env
   # Escolha o provedor: replicate ou gemini
   IMAGE_PROVIDER=replicate

   # Replicate
   REPLICATE_API_TOKEN=r8_seu_token_aqui

   # Gemini
   GEMINI_API_KEY=seu_token_gemini
   GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
   ```

⚠️ **IMPORTANTE**: Sem a API key configurada, o app não funcionará!

💡 **Custo**: Depende do provedor. Consulte a pagina de precos do Replicate e do Gemini.

## 🚀 Como Executar

### Modo desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build para produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
virtual-try-on-app/
├── app/
│   ├── api/
│   │   └── try-on/
│   │       └── route.ts          # API route para processar imagens
│   ├── layout.tsx                 # Layout raiz
│   ├── page.tsx                   # Página principal
│   ├── page.module.css            # Estilos da página
│   └── globals.css                # Estilos globais
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🤖 Integração com IA

O backend alterna entre **Replicate** e **Gemini** com base na variavel `IMAGE_PROVIDER`.

- **Replicate**: exige **URLs publicas** das imagens.
- **Gemini**: aceita URLs publicas e imagens em `data:` (upload via navegador).

O prompt e montado no backend e inclui a opcao de area da roupa selecionada pelo usuario.

## 📝 Uso

1. Abra o app no navegador
2. Escolha **Link** ou **Upload** para a foto da pessoa
3. Escolha **Link** ou **Upload** para a foto da roupa
4. Selecione a area da roupa
5. Clique em "Gerar Imagem"
6. Veja o resultado e o historico no carrossel

## 🔐 Variáveis de Ambiente

Arquivo `.env.local` necessario:

```env
IMAGE_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_seu_token_aqui
GEMINI_API_KEY=seu_token_gemini
GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview
```

### Deployment (Vercel/Netlify):

Configure as variaveis de ambiente no painel:
- `IMAGE_PROVIDER`
- `REPLICATE_API_TOKEN`
- `GEMINI_API_KEY`
- `GEMINI_IMAGE_MODEL`

## 📄 Licença

MIT

## 👤 Autor

Your Name
