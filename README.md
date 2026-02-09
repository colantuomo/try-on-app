# Virtual Try-On Application

Este projeto é um aplicativo web de virtual try-on construído com **Next.js**. Ele permite que usuários enviem uma foto de corpo inteiro e uma foto da roupa desejada, e utiliza IA para gerar uma imagem da pessoa vestindo aquela roupa.

## 🎯 Funcionalidades

- Upload de duas imagens: foto da pessoa (corpo inteiro) e foto da roupa
- Processamento via **Replicate API** usando o modelo **IDM-VTON**
- Interface responsiva e moderna
- Visualização do resultado gerado com IA real

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Replicate API** (IA de virtual try-on)
- **Sharp** (processamento de imagens)

## 📦 Instalação

```bash
# Instalar dependências
npm install
```

## 🔑 Configuração da API (OBRIGATÓRIO)

### Passo a passo para obter a chave da Replicate:

1. **Criar conta na Replicate**
   - Acesse: https://replicate.com
   - Clique em "Sign up" e crie sua conta (pode usar GitHub)

2. **Obter API Token**
   - Após fazer login, acesse: https://replicate.com/account/api-tokens
   - Clique em "Create token" ou copie o token padrão
   - Copie o token (começa com `r8_...`)

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

   # Gemini (opcional se usar Replicate)
   GEMINI_API_KEY=seu_token_gemini
   GEMINI_IMAGE_MODEL=gemini-3-pro-image-preview

   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

⚠️ **IMPORTANTE**: Sem a API key configurada, o app não funcionará!

💡 **Custo**: A Replicate oferece créditos gratuitos iniciais. Depois, cobra por uso (~$0.005 por imagem).

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
├── public/
│   └── uploads/                   # Imagens enviadas (criado automaticamente)
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## 🤖 Integração com IA

Este projeto usa a **Replicate API** com o modelo **IDM-VTON** (Image-based Virtual Try-On).

### Modelo utilizado:
- **IDM-VTON**: Um dos melhores modelos open-source de virtual try-on
- Suporta roupas superiores (camisas, blusas, casacos)
- Gera imagens realistas mantendo características da pessoa

### Configurações disponíveis em `app/api/try-on/route.ts`:

```typescript
category: "upper_body"  // Opções: "upper_body", "lower_body", "dresses"
seed: 42                // Para resultados reproduzíveis
num_inference_steps: 30 // Mais steps = melhor qualidade (mais lento)
```

### Trocar o modelo de IA:

Se quiser usar outro modelo da Replicate:
1. Acesse https://replicate.com/collections/virtual-try-on
2. Escolha um modelo
3. Copie o ID do modelo
4. Substitua em `app/api/try-on/route.ts`

## 📝 Uso

1. Abra o app no navegador
2. Faça upload de uma foto de corpo inteiro
3. Faça upload de uma foto da roupa
4. Clique em "Gerar Imagem"
5. Aguarde o processamento e veja o resultado

## 🔐 Variáveis de Ambiente

Arquivo `.env.local` necessário:

```env
# Token da Replicate (OBRIGATÓRIO)
REPLICATE_API_TOKEN=r8_seu_token_aqui

# URL base do app (necessário para Replicate acessar as imagens)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Em produção (Vercel, etc):
# NEXT_PUBLIC_BASE_URL=https://seu-app.vercel.app
```

### Deployment (Vercel/Netlify):

Ao fazer deploy, configure as variáveis de ambiente no painel:
- `REPLICATE_API_TOKEN`: Seu token da Replicate
- `NEXT_PUBLIC_BASE_URL`: URL pública do seu app

## 📄 Licença

MIT

## 👤 Autor

Your Name
