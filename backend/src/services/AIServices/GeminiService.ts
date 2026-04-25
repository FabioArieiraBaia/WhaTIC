import { GoogleGenerativeAI } from "@google/generative-ai";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import Product from "../../models/Product";
import Message from "../../models/Message";

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

  // Get ticket messages for context
  const messages = await Message.findAll({
    where: { ticketId, companyId },
    order: [["createdAt", "ASC"]],
    limit: 20
  });

  const chatHistory = messages.map(msg => {
    return `${msg.fromMe ? aiAgentName : "Cliente"}: ${msg.body}`;
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

${aiAgentPrompt}

=== Base de Conhecimento ===
${aiAgentKnowledge}

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

Cliente: ${messageBody}
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
