# Documentação de Manutenção - WhaTIC

Este documento registra as principais mudanças, arquitetura e decisões técnicas tomadas para garantir a estabilidade do projeto.

## 🚀 Mudanças Recentes (Abril 2026)

### 1. Migração para Google Cloud Storage (GCS)
*   **Problema**: As mídias (fotos/áudios) sumiam após alguns minutos (404) porque o Cloud Run é stateless.
*   **Solução**: Implementada persistência no Bucket `whatic-media-315750790111`.
*   **Decisão Técnica**: Redirect 302 direto para a URL pública do GCS.

### 2. Estabilidade de Autenticação no Portal
*   **Problema**: Clientes eram redirecionados para o login administrativo.
*   **Solução**: O hook `useAuth` agora ignora verificações administrativas em rotas `/portal`.

### 3. Persistência de Mídia (GCS) - Detalhes
*   Implementada a biblioteca `@flystorage/google-cloud-storage`.
*   O arquivo `backend/src/helpers/saveMediaFile.ts` alterna entre local e GCS.

### 4. IA Vendedora e Abertura de O.S.
*   **Trigger**: `[CREATE_ORDER_Descricao_Valor]`
*   **Abertura Automática**: O Agente de IA identifica intenção e abre a O.S.
*   **Abertura Manual**: Adicionados botões no painel administrativo (Chat e Gestão de Pedidos) para o operador abrir ordens manualmente.

### 5. Facilidade de Pagamento (PIX)
*   **Copia e Cola**: Botão de cópia rápida para a chave PIX no Portal do Cliente.

---

## 📦 Infraestrutura (Google Cloud)
*   **Projeto**: `gen-lang-client-0297704847`
*   **Cloud Run (API)**: `whatic-api`
*   **Cloud Run (Web)**: `whatic-frontend`
*   **Bucket**: `whatic-media-315750790111`

## 🔑 Variáveis de Ambiente Críticas
*   `STORAGE_TYPE`: `gcs`
*   `GCS_BUCKET`: `whatic-media-315750790111`
*   `REACT_APP_BACKEND_URL`: `https://whatic-api-315750790111.us-central1.run.app`

---
*Documento atualizado em 27/04/2026. Todos os recursos estão ATIVOS e ESTÁVEIS.*
