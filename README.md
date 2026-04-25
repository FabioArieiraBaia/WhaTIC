[![en](https://img.shields.io/badge/lang-en-green.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-red.svg)](README.pt.md)

# WhaTIC

WhaTIC is a powerful multi-channel communication platform with CRM and helpdesk features, specifically designed to leverage WhatsApp and Artificial Intelligence for enhanced customer engagement.

## Key Features

- **Multi-channel Support:** Connect multiple WhatsApp accounts and manage all chats in one place.
- **AI Agent Integration:** Built-in support for Google Gemini AI to automate customer service with natural language.
- **Product Catalog:** Manage and share your product catalog directly within the chat.
- **Multi-company (SaaS):** Support for multiple companies in a single installation.
- **Real-time Notifications:** Instant notifications for new messages and ticket updates.
- **Dashboard & Analytics:** Monitor your team's performance and customer satisfaction.

## AI Agent (Gemini AI)

WhaTIC includes a native integration with Google Gemini AI. You can configure an AI Agent for each ticket to:
- Automatically respond to common customer questions.
- Use a custom prompt and knowledge base to match your business tone and information.
- Share product details and purchase links automatically from your catalog.
- Transfer to a human agent when the AI cannot help.

## Product Management

The built-in product management system allows you to:
- Create and manage a digital catalog of products/services.
- Include descriptions, prices, and direct purchase links.
- Allow the AI Agent to recommend products based on customer inquiries.

## Original Authorship

This project is a derivative work of [Ticketz](https://github.com/allgood/ticketz), which itself was inspired by the [Whaticket Community](https://github.com/canove/whaticket-community) project. WhaTIC adds advanced features like AI automation and integrated product management.

## Licensing

WhaTIC is licensed under the **AGPL**, which requires that any user who has access to the system can obtain the source code. If you make changes to the code and commercialize it, you must provide the source code to your users.

## Quick Start (Docker)

For local development or quick testing:

1. Clone the repository:
   ```bash
   git clone https://github.com/FabioArieiraBaia/WhaTIC.git
   cd WhaTIC
   ```

2. Run with Docker Compose:
   ```bash
   docker compose -f docker-compose-local.yaml up -d
   ```

The application will be available at `http://localhost:3000`.
Default login: `admin@ticketz.host` / `123456`.

---

**Important Notice:** This project is not affiliated with Meta, WhatsApp, or Google. Use it responsibly.