[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-green.svg)](README.pt.md)

# WhaTIC

O WhaTIC é uma poderosa plataforma de comunicação multicanal com recursos de CRM e helpdesk, projetada especificamente para aproveitar o WhatsApp e a Inteligência Artificial para melhorar o engajamento com os clientes.

## Principais Recursos

- **Suporte Multicanal:** Conecte várias contas de WhatsApp e gerencie todas as conversas em um só lugar.
- **Integração com Agente de IA:** Suporte nativo ao Google Gemini AI para automatizar o atendimento com linguagem natural.
- **Catálogo de Produtos:** Gerencie e compartilhe seu catálogo de produtos diretamente no chat.
- **Multitenancy (SaaS):** Suporte para múltiplas empresas em uma única instalação.
- **Notificações em Tempo Real:** Avisos instantâneos de novas mensagens e atualizações de tickets.
- **Dashboard e Relatórios:** Monitore o desempenho da sua equipe e a satisfação dos clientes.

## Agente de IA (Gemini AI)

O WhaTIC inclui uma integração nativa com o Google Gemini AI. Você pode configurar um Agente de IA para cada ticket para:
- Responder automaticamente a perguntas frequentes dos clientes.
- Usar um prompt personalizado e base de conhecimento específica para o seu negócio.
- Compartilhar detalhes de produtos e links de compra automaticamente a partir do seu catálogo.
- Transferir para um atendente humano quando a IA não puder ajudar.

## Gestão de Produtos

O sistema integrado de gestão de produtos permite que você:
- Crie e gerencie um catálogo digital de produtos/serviços.
- Inclua descrições, preços e links diretos para compra.
- Permita que o Agente de IA recomende produtos com base nas dúvidas do cliente.

## Autoria Original

Este projeto é um trabalho derivado do [Ticketz](https://github.com/allgood/ticketz), que por sua vez foi inspirado no projeto [Whaticket Community](https://github.com/canove/whaticket-community). O WhaTIC adiciona funcionalidades avançadas como automação por IA e gestão integrada de produtos.

## Licenciamento

O WhaTIC está licenciado sob a **AGPL**, que exige que qualquer usuário que tenha acesso ao sistema possa obter o código-fonte. Se você fizer alterações no código e comercializá-lo, deverá fornecer o código-fonte aos seus usuários.

## Início Rápido (Docker)

Para desenvolvimento local ou testes rápidos:

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
