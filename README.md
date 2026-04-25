[![en](https://img.shields.io/badge/lang-en-green.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-red.svg)](README.pt.md)

# WhaTIC

WhaTIC is a powerful multi-channel communication platform with CRM and helpdesk features, specifically designed to leverage WhatsApp and Artificial Intelligence for enhanced customer engagement.

## 🚀 Key Features

- **Multi-channel Support:** Connect multiple WhatsApp accounts and manage all chats in one place.
- **AI Agent (Gemini AI):** Native integration with Google Gemini AI for smart automation.
- **SLeads (Google Maps Scraper):** Extract targeted leads from Google Maps using AI to filter and validate contacts.
- **AI-Powered Campaigns:** Send bulk messages that are unique and humanized for each recipient.
- **Contact CRM & History:** Track customer purchases, total spend, and manage service orders (OS).
- **Product Catalog:** Manage and share your product catalog with promotional price support.
- **Multi-company (SaaS):** Support for multiple companies in a single installation.

## 🤖 AI Agent (Gemini AI)

WhaTIC includes a deep integration with Google Gemini AI. The AI Agent is aware of:
- **Customer Profile:** Access to name and custom fields.
- **Purchase History:** Knows what the customer has already bought and how much they've spent.
- **Service Orders:** Can check the status of open or finished service orders.
- **Promotional Prices:** Smartly offers discounts when a product has a promotional price.

## 📍 SLeads
A powerful tool to generate new business. Search for any niche and location, and let WhaTIC scrape Google Maps, extract valid WhatsApp numbers using AI, and organize them into lists for your campaigns.

## 📜 Credits & Authorship

All credits to **Fabio Arieira** ([fabioarieira.com](https://fabioarieira.com)).

This project is a derivative work of [Ticketz](https://github.com/allgood/ticketz), which itself was inspired by the [Whaticket Community](https://github.com/canove/whaticket-community) project. WhaTIC adds advanced features like AI automation, SLeads, and integrated CRM management.

## ⚖️ Licensing

WhaTIC is licensed under the **AGPL**, which requires that any user who has access to the system can obtain the source code. If you make changes to the code and commercialize it, you must provide the source code to your users.

## 🛠️ Quick Start (Docker)

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