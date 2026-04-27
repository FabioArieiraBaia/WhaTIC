# Documentação de Manutenção - WhaTIC

Este documento registra as principais mudanças, arquitetura e decisões técnicas tomadas para garantir a estabilidade do projeto.

## 🚀 Mudanças Recentes (Abril 2026)

### 1. Migração para Google Cloud Storage (GCS)
*   **Problema**: As mídias (fotos/áudios) sumiam após alguns minutos (404) porque o Cloud Run é stateless e o disco local é apagado a cada reinicialização.
*   **Solução**: Implementada persistência no Bucket `whatic-media-315750790111`.
*   **Decisão Técnica**: Em vez de servir o arquivo pelo backend (proxy), o backend agora emite um **Redirect 302** direto para a URL pública do GCS. Isso economiza memória e banda do servidor.

### 2. Estabilidade de Autenticação no Portal
*   **Problema**: Clientes que acessavam o portal eram redirecionados para o login administrativo por causa do hook `useAuth`.
*   **Solução**: O hook `useAuth` foi modificado para ignorar verificações de token administrativo em rotas que iniciam com `/portal`.

### 3. Persistência de Mídia (GCS) - Detalhes
*   Implementada a biblioteca `@flystorage/google-cloud-storage`.
*   O arquivo `backend/src/helpers/saveMediaFile.ts` agora alterna entre local e GCS baseado em variáveis de ambiente.
*   O arquivo `backend/src/app.ts` redireciona requisições de `/public/*` para a URL pública do Google Storage se configurado.

---

## 🛠️ Recursos Revertidos (Aguardando Correção)
*   **Criação de O.S. via IA**: Revertido devido a erro de build no frontend relacionado a exportação de componentes.
*   **Botões Manuais de O.S.**: Revertidos junto com o modal para garantir estabilidade do build.
*   **Copia e Cola PIX**: Revertido para manter paridade com a versão estável.

## 📦 Infraestrutura (Google Cloud)
*   **Projeto**: `gen-lang-client-0297704847`
*   **Cloud Run (API)**: `whatic-api`
*   **Cloud Run (Web)**: `whatic-frontend`
*   **Bucket**: `whatic-media-315750790111` (Permissão: `allUsers` com `Storage Object Viewer`)

## 🔑 Variáveis de Ambiente Críticas
*   `STORAGE_TYPE`: deve ser `gcs` em produção.
*   `GCS_BUCKET`: `whatic-media-315750790111`
*   `REACT_APP_BACKEND_URL`: `https://whatic-api-315750790111.us-central1.run.app`

---
*Documento atualizado em 27/04/2026 após reversão de recursos instáveis.*
