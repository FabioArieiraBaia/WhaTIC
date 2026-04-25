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
  mediaData?: {
    base64: string;
    mimeType: string;
  };
}

export const GeminiService = async ({
  companyId,
  ticketId,
  messageBody,
  mediaData
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
    productsText = products.map(p => {
      let priceText = `R$ ${p.price}`;
      if (p.promotionalPrice && parseFloat(p.promotionalPrice.toString()) > 0) {
        priceText = `DE R$ ${p.price} POR APENAS R$ ${p.promotionalPrice} (OFERTA ESPECIAL)`;
      }
      let productInfo = `- ${p.name}: ${priceText} - ${p.description || ""}`;
      if (p.videoUrl) productInfo += `\n  - Vídeo de Demonstração: ${p.videoUrl}`;
      if (p.testimonials) productInfo += `\n  - Testemunhos Texto: ${p.testimonials}`;
      if (p.testimonialAudioUrl) productInfo += `\n  - ÁUDIO DE DEPOIMENTO REAL DISPONÍVEL (Use o comando [SEND_AUDIO_${p.id}] para enviar)`;
      if (p.testimonialImageUrl) productInfo += `\n  - PRINT DE DEPOIMENTO REAL DISPONÍVEL (Use o comando [SEND_PRINT_${p.id}] para enviar)`;
      if (p.relatedProducts) productInfo += `\n  - Produtos Relacionados (Upsell): ${p.relatedProducts}`;
      if (p.purchaseUrl) productInfo += `\n  - Link de Compra: ${p.purchaseUrl}`;
      
      return productInfo;
    }).join("\n");
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
- Use os **Testemunhos** como prova social quando o cliente estiver em dúvida ou precisar de segurança.
- Ofereça o **Vídeo de Demonstração** para mostrar o produto em funcionamento e gerar desejo.
- Utilize os **Produtos Relacionados** para fazer Upsell ou Cross-sell quando o cliente demonstrar interesse em algo ou estiver finalizando uma compra.
- O link de compra é opcional; se não houver, foque em converter o cliente para que ele peça o link ou finalize por aqui.
- Se o cliente enviar uma IMAGEM, ÁUDIO ou DOCUMENTO, analise o conteúdo com atenção e responda de acordo. Você tem visão e audição completas agora.
- Responda APENAS com o texto que deve ser enviado ao cliente, sem formatações extras.
`;

  const prompt = `
${systemPrompt}

=== Histórico da Conversa ===
${chatHistory}

${contactName}: ${messageBody}
${aiAgentName}:`;

  try {
    const parts: any[] = [{ text: prompt }];

    if (mediaData && mediaData.base64 && mediaData.mimeType) {
      parts.push({
        inlineData: {
          data: mediaData.base64,
          mimeType: mediaData.mimeType
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error in Gemini API:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Em breve um atendente irá falar com você.";
  }
};
