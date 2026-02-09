# 🔑 Guia: Como Obter e Configurar a API Key da Replicate

## Passo 1: Criar Conta na Replicate

1. Acesse: **https://replicate.com**
2. Clique em **"Sign up"** (canto superior direito)
3. Você pode criar conta de 3 formas:
   - **GitHub** (recomendado - mais rápido)
   - Google
   - Email + senha

## Passo 2: Obter API Token

1. Após fazer login, vá para: **https://replicate.com/account/api-tokens**
   
   Ou navegue manualmente:
   - Clique no seu avatar (canto superior direito)
   - Selecione **"API tokens"**

2. Você verá um token padrão já criado, OU pode criar um novo:
   - Clique em **"Create token"** (se necessário)
   - Dê um nome descritivo (ex: "Virtual Try-On App")

3. **COPIE O TOKEN** - ele começa com `r8_` seguido de caracteres
   
   ⚠️ **IMPORTANTE**: Guarde esse token em local seguro! Por segurança, a Replicate só mostra o token uma vez.

   Exemplo de token:
   ```
   r8_abcdefghijklmnopqrstuvwxyz1234567890ABCDEF
   ```

## Passo 3: Configurar no Projeto

1. **Copie o arquivo de exemplo**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edite o arquivo `.env.local`**:
   ```bash
   # No macOS/Linux:
   nano .env.local
   
   # Ou abra com seu editor favorito (VS Code, etc)
   code .env.local
   ```

3. **Cole seu token**:
   ```env
   REPLICATE_API_TOKEN=r8_seu_token_copiado_aqui
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Salve o arquivo** (Ctrl+O no nano, depois Ctrl+X)

## Passo 4: Verificar Configuração

Rode o app:
```bash
npm run dev
```

Se tudo estiver correto:
- ✅ App inicia sem erros
- ✅ Console não mostra "REPLICATE_API_TOKEN não configurada"
- ✅ Ao fazer upload e clicar em "Gerar Imagem", o processamento começa

Se houver erro:
- ❌ Verifique se o arquivo é `.env.local` (não `.env`)
- ❌ Verifique se não há espaços extras no token
- ❌ Reinicie o servidor após criar/editar `.env.local`

## 💰 Informações sobre Créditos e Custos

### Créditos Gratuitos
- A Replicate oferece **créditos gratuitos** ao criar conta
- Suficiente para testar o app várias vezes

### Após os créditos gratuitos
- Modelo IDM-VTON custa aproximadamente **$0.005 por imagem**
- É cobrado por tempo de processamento (cerca de 30-60 segundos por imagem)
- Você pode adicionar créditos em: https://replicate.com/account/billing

### Ver uso atual
- Acesse: https://replicate.com/account/billing
- Veja histórico de execuções e custos

## 🔒 Segurança

### ⚠️ NUNCA faça isso:
- ❌ **NÃO** commite o arquivo `.env.local` no Git
- ❌ **NÃO** compartilhe seu token publicamente
- ❌ **NÃO** coloque o token hardcoded no código

### ✅ Boas práticas:
- ✅ Mantenha o token apenas no `.env.local` (já está no `.gitignore`)
- ✅ Use variáveis de ambiente diferentes para dev e produção
- ✅ Revogue tokens que não estiver mais usando

## 🚀 Deploy em Produção (Vercel/Netlify)

### Vercel:
1. Faça push do código para GitHub/GitLab
2. Importe projeto no Vercel
3. Vá em **Settings → Environment Variables**
4. Adicione:
   - `REPLICATE_API_TOKEN`: seu token
   - `NEXT_PUBLIC_BASE_URL`: URL do deploy (ex: `https://seu-app.vercel.app`)
5. Redeploy o projeto

### Netlify:
Similar ao Vercel - adicione as variáveis de ambiente no painel.

## 🆘 Problemas Comuns

### "REPLICATE_API_TOKEN não configurada"
- Verifique se criou `.env.local` (não `.env`)
- Reinicie o servidor dev (`npm run dev`)

### "Authentication failed"
- Token inválido ou expirado
- Verifique se copiou o token completo
- Tente gerar um novo token

### "Payment required"
- Créditos gratuitos esgotados
- Adicione método de pagamento em https://replicate.com/account/billing

### Processamento muito lento
- Normal! Modelo de IA leva 30-60 segundos
- Reduza `num_inference_steps` em `route.ts` (trade-off: qualidade vs velocidade)

## 📚 Recursos Adicionais

- Documentação Replicate: https://replicate.com/docs
- Modelo IDM-VTON: https://replicate.com/cuuupid/idm-vton
- Outros modelos de try-on: https://replicate.com/collections/virtual-try-on
- Suporte: https://replicate.com/discord (Discord oficial)

---

✨ Pronto! Agora seu app está configurado para usar IA real de virtual try-on!
