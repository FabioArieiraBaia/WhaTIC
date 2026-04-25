[![en](https://img.shields.io/badge/lang-en-green.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-red.svg)](README.pt.md)

# WhaTIC

O WhaTIC é uma poderosa plataforma de comunicação multicanal com recursos de CRM e helpdesk, projetada especificamente para aproveitar o WhatsApp e a Inteligência Artificial para melhorar o engajamento com o cliente.

## 🚀 Principais Recursos

- **Suporte Multicanal:** Conecte várias contas do WhatsApp e gerencie todos os chats em um só lugar.
- **Agente de IA (Gemini AI):** Integração nativa com o Google Gemini AI para automação inteligente.
- **SLeads (Scraper do Google Maps):** Extraia leads segmentados do Google Maps usando IA para filtrar e validar contatos.
- **Campanhas com IA:** Envie mensagens em massa únicas e humanizadas para cada destinatário.
- **CRM de Contatos:** Acompanhe o histórico de compras, total gasto e gerencie Ordens de Serviço (OS).
- **Catálogo de Produtos:** Gerencie e compartilhe seu catálogo com suporte a preços promocionais.
- **Multi-empresa (SaaS):** Suporte para várias empresas em uma única instalação.

## 🤖 Agente de IA (Gemini AI)

O WhaTIC inclui uma integração profunda com o Google Gemini AI. O Agente de IA tem consciência de:
- **Perfil do Cliente:** Acesso ao nome e campos personalizados.
- **Histórico de Compras:** Sabe o que o cliente já comprou e quanto ele já gastou.
- **Ordens de Serviço:** Pode verificar o status de OS abertas ou finalizadas.
- **Preços Promocionais:** Oferece descontos de forma inteligente quando um produto tem preço promocional.

## 📍 SLeads
Uma ferramenta poderosa para gerar novos negócios. Busque por qualquer nicho e localização, e deixe o WhaTIC extrair dados do Google Maps, identificar números de WhatsApp válidos via IA e organizá-los em listas para suas campanhas.

## 📜 Créditos e Autoria

Todos os créditos a **Fabio Arieira** ([fabioarieira.com](https://fabioarieira.com)).

Este projeto é um trabalho derivado do [Ticketz](https://github.com/allgood/ticketz), que por sua vez foi inspirado no projeto [Whaticket Community](https://github.com/canove/whaticket-community). O WhaTIC adiciona recursos avançados como automação de IA, SLeads e gestão integrada de CRM.

## ⚖️ Licenciamento

O WhaTIC está licenciado sob a **AGPL**, que exige que qualquer usuário que tenha acesso ao sistema possa obter o código-fonte. Se você fizer alterações no código e comercializá-lo, deverá fornecer o código-fonte aos seus usuários.

## 🛠️ Início Rápido (Docker)

1. Clone o repositório:
   ```bash
   git clone https://github.com/FabioArieiraBaia/WhaTIC.git
   cd WhaTIC
   ```

2. Execute com Docker Compose:
   ```bash
   docker compose -f docker-compose-local.yaml up -d
   ```

A aplicação estará disponível em `http://localhost:3000`.
Login padrão: `admin@ticketz.host` / `123456`.

---

**Aviso Importante:** Este projeto não é afiliado à Meta, WhatsApp ou Google. Use com responsabilidade.
