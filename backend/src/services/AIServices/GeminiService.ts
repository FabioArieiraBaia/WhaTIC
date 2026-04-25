import { GoogleGenerativeAI } from "@google/generative-ai";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import Product from "../../models/Product";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Contact from "../../models/Contact";
import ContactPurchase from "../../models/ContactPurchase";
import ServiceOrder from "../../models/ServiceOrder";
import ContactCustomField from "../../models/ContactCustomField";

interface GeminiServiceProps {
  companyId: number;
  ticketId: number;
  messageBody: string;
}

export const GeminiService = async ({
  companyId,
  ticketId,
  messageBody
}: GeminiServiceProps): Promise<string> => {
  const geminiApiKey = await GetCompanySetting(companyId, "geminiApiKey", "");
  const aiAgentName = await GetCompanySetting(companyId, "aiAgentName", "Assistente");
  const aiAgentPrompt = await GetCompanySetting(companyId, "aiAgentPrompt", "");
  const aiAgentKnowledge = await GetCompanySetting(companyId, "aiAgentKnowledge", "");
  const aiAgentModel = await GetCompanySetting(companyId, "aiAgentModel", "gemini-2.0-flash");

  if (!geminiApiKey || geminiApiKey.trim() === "") {
    console.log("Gemini API Key is not configured for company", companyId);
    return "Em breve um atendente humano irá continuar o atendimento.";
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: aiAgentModel });

  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      { 
        model: Contact, 
        as: "contact",
        include: [
          "extraInfo",
          { model: ContactPurchase, include: [{ model: Product, attributes: ["name"] }] },
          { model: ServiceOrder, include: [{ model: Product, attributes: ["name"] }] }
        ]
      }
    ]
  });

  const contact = ticket?.contact;
  const contactName = contact?.name || "Cliente";

  // Format Extra Info
  const extraInfoText = contact?.extraInfo?.map(info => `- ${info.name}: ${info.value}`).join("\n") || "Nenhuma informação extra.";

  // Format Purchases
  const purchasesText = contact?.purchases?.map(p => 
    `- ${p.product?.name || "Produto"}: R$ ${p.price} em ${new Date(p.purchaseDate).toLocaleDateString("pt-BR")}`
  ).join("\n") || "Nenhuma compra registrada.";

  // Format Service Orders
  const serviceOrdersText = contact?.serviceOrders?.map(os => 
    `- ${os.description} (Status: ${os.status}) ${os.product ? `[Produto: ${os.product.name}]` : ""}`
  ).join("\n") || "Nenhuma ordem de serviço registrada.";

  // Get ticket messages for context
  const messages = await Message.findAll({
    where: { ticketId, companyId },
    order: [["createdAt", "ASC"]],
    limit: 20
  });

  const chatHistory = messages.map(msg => {
    return `${msg.fromMe ? aiAgentName : contactName}: ${msg.body}`;
  }).join("\n");

  // Get active products
  const products = await Product.findAll({
    where: { companyId, isActive: true }
  });

  let productsText = "";
  if (products.length > 0) {
    productsText = products.map(p => 
      `- ${p.name}: R$ ${p.price} - ${p.description || ""} - Link: ${p.purchaseUrl || "N/A"}`
    ).join("\n");
  }

  const systemPrompt = `
Você é ${aiAgentName}, assistente virtual da empresa.
Você está conversando com ${contactName}.

${aiAgentPrompt}

=== Base de Conhecimento ===
${aiAgentKnowledge}

=== Perfil do Cliente (${contactName}) ===
Informações Extras:
${extraInfoText}

Histórico de Compras:
${purchasesText}

Ordens de Serviço:
${serviceOrdersText}

=== Catálogo de Produtos ===
${productsText ? productsText : "Nenhum produto disponível no momento."}

Regras:
- Responda de forma natural e amigável.
- Quando o cliente perguntar sobre produtos, ofereça do catálogo.
- Inclua o link de compra quando relevante.
- Se não souber algo, informe que um atendente humano irá ajudar.
- Responda APENAS com o texto que deve ser enviado ao cliente, sem formatações extras.
`;

  const prompt = `
${systemPrompt}

=== Histórico da Conversa ===
${chatHistory}

${contactName}: ${messageBody}
${aiAgentName}:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error in Gemini API:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Em breve um atendente irá falar com você.";
  }
};
