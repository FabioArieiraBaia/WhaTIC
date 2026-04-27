# 🚀 WhaTIC - Documentação de Desenvolvimento e Infraestrutura

Este documento serve como guia para desenvolvedores ou agentes de IA que assumirem a manutenção e evolução do sistema WhaTIC (baseado no Ticketz).

## 🏗️ Arquitetura Atual (Google Cloud Platform)

O sistema foi migrado e otimizado para rodar de forma escalável e econômica no GCP:

1.  **Frontend & Backend**: Rodando no **Google Cloud Run** (Stateless).
2.  **Banco de Dados**: **Cloud SQL (PostgreSQL)**. 
    *   *Nota*: O banco foi "downgraded" para a instância `db-f1-micro` com HA (Alta Disponibilidade) desativada para reduzir custos em ~90%.
3.  **Armazenamento de Mídia**: **Google Cloud Storage (GCS)**.
    *   *Bucket*: `whatic-media-315750790111`
    *   *Motivo*: Como o Cloud Run é stateless, arquivos salvos localmente sumiam no reinício. Agora o armazenamento é persistente e global.

---

## 💎 Funcionalidades Implementadas Recentemente

### 1. Portal do Cliente Premium (`/portal`)
*   **Acesso**: Login simplificado via número de WhatsApp.
*   **Flexibilidade de Login**: O sistema agora limpa caracteres especiais e busca pelo sufixo do número, facilitando o acesso mesmo com variações de DDI/DDD.
*   **Vídeos e YouTube**: Suporte para embeds automáticos do YouTube e player nativo para MP4 (usando separador `###` no campo `videoUrl`).
*   **Fluxo de Pagamento**: Integração visual com PIX (QR Code e Copia e Cola) e status de aprovação.

### 2. Estabilidade de Autenticação
*   O hook `useAuth` foi modificado para ignorar verificações de token administrativo quando a rota inicia com `/portal`. Isso evita erros 401 que quebravam a experiência do cliente.

### 3. Persistência de Mídia (GCS)
*   Implementada a biblioteca `@flystorage/google-cloud-storage`.
*   O arquivo `backend/src/helpers/saveMediaFile.ts` agora alterna entre local e GCS baseado em variáveis de ambiente.
*   O arquivo `backend/src/app.ts` redireciona requisições de `/public/*` para a URL pública do Google Storage se configurado.

### 4. IA Vendedora e Abertura de O.S. Automática
*   **Trigger**: `[CREATE_ORDER_Descricao_Valor]`
*   **Funcionamento**: O Agente de IA (Gemini) foi treinado para identificar intenção de compra. Ao confirmar com o cliente, ele gera o trigger que cria automaticamente uma `ServiceOrder` vinculada ao contato.
*   **Confirmação**: O sistema anexa o número da O.S. na resposta final do WhatsApp.

### 5. Facilidade de Pagamento (PIX)
*   **Copia e Cola**: Adicionado botão de cópia rápida para a chave PIX no Portal do Cliente, melhorando a conversão de vendas para usuários que acessam via celular.

---

## 🛠️ Guia de Deploy

O fluxo de CI/CD está configurado via **Google Cloud Build**:
1.  **Push no GitHub** (branch `main`) dispara o gatilho `whatic-deploy-main`.
2.  O Cloud Build compila as imagens Docker e faz o deploy para o Cloud Run.
3.  **Atenção**: Às vezes é necessário gerenciar o tráfego manualmente no console do Cloud Run para direcionar 100% para a nova revisão.

### Variáveis de Ambiente Cruciais (Backend):
*   `STORAGE_TYPE`: `gcs` (para ativar o Google Storage).
*   `GCS_BUCKET`: `whatic-media-315750790111`.
*   `BACKEND_URL`: URL oficial da API no Cloud Run.
*   `FRONTEND_URL`: URL oficial do site no Cloud Run.

---

## 🚀 Próximos Passos Sugeridos
*   **Migração de DB**: Se houver necessidade de novas colunas no banco (como `finalVideoUrl`), realizar via script manual, pois o deploy automático de migrações pode falhar em ambientes de produção restritos.
*   **WhatsApp Sessions**: Monitorar a estabilidade das sessões do Baileys, garantindo que não haja múltiplos clientes conectados ao mesmo número.

---
**Documentação gerada por Antigravity AI em 27 de Abril de 2026.**
