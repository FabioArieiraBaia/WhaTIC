import { GoogleGenerativeAI } from "@google/generative-ai";
import { GetCompanySetting } from "../../helpers/CheckSettings";
import Product from "../../models/Product";
import ContactListItem from "../../models/ContactListItem";
import Campaign from "../../models/Campaign";

interface Props {
  campaign: Campaign;
  contact: ContactListItem;
}

export const GenerateCampaignAiMessage = async ({
  campaign,
  contact
}: Props): Promise<string> => {
  const { companyId, aiPrompt } = campaign;

  const geminiApiKey = await GetCompanySetting(companyId, "geminiApiKey", "");
  const aiAgentName = await GetCompanySetting(companyId, "aiAgentName", "Consultor");
  const aiAgentModel = await GetCompanySetting(companyId, "aiAgentModel", "gemini-2.0-flash");

  if (!geminiApiKey || geminiApiKey.trim() === "") {
    console.log("Gemini API Key is not configured for company", companyId);
    return ""; // Fallback will use static messages if this returns empty
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: aiAgentModel });

  // Get selected products for this campaign
  const products = campaign.products || [];

  let productsText = "";
  if (products.length > 0) {
    productsText = products.map(p => 
      `- ${p.name}: R$ ${p.price} - ${p.description || ""} - Link: ${p.purchaseUrl || "N/A"}`
    ).join("\n");
  }

  const prompt = `
Você é ${aiAgentName}, um consultor de vendas humano e amigável.
Sua tarefa é iniciar um contato com um lead (cliente em potencial) via WhatsApp.

=== Informações do Lead ===
Nome: ${contact.name}
Telefone: ${contact.number}

=== Instruções da Campanha (O que você deve fazer) ===
${aiPrompt}

=== Produtos que você pode oferecer ===
${productsText ? productsText : "Nenhum produto específico selecionado para esta campanha."}

=== Regras Críticas ===
- Escreva como um humano real no WhatsApp. Use um tom informal, direto e amigável.
- NÃO use linguagem robótica ou formal demais.
- NUNCA repita a mesma mensagem. Mude as palavras, a saudação e a estrutura.
- Seja breve e focado em gerar interesse ou resposta.
- NÃO use muitas hashtags ou emojis excessivos.
- Responda APENAS com o texto final da mensagem, sem explicações ou formatação extra.

Mensagem para ${contact.name}:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error generating AI campaign message:", error);
    return "";
  }
};
