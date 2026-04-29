import { GoogleGenerativeAI } from "@google/generative-ai";
import Contact from "../../models/Contact";
import Product from "../../models/Product";
import Setting from "../../models/Setting";
import { logger } from "../../utils/logger";

export const GeminiService = async (
  contact: Contact,
  ticketId: number,
  companyId: number,
  userMessage: string,
  history: any[] = [],
  mediaData: any = null
): Promise<string> => {
  const settings = await Setting.findAll({ where: { companyId } });
  const geminiKey = settings.find(s => s.key === "geminiApiKey")?.value || "";
  
  if (!geminiKey) {
    logger.error(`[GeminiService] No API Key found for company ${companyId}`);
    return "Desculpe, meu sistema de inteligência está temporariamente indisponível (chave ausente no painel).";
  }

  // Modelo Gemini 2.5 Flash como padrão para 2026
  const aiAgentModel = settings.find(s => s.key === "aiAgentModel")?.value || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(geminiKey);
  const model = genAI.getGenerativeModel({ model: aiAgentModel });

  const products = await Product.findAll({ where: { companyId } });
  
  const aiName = settings.find(s => s.key === "aiAgentName")?.value || "Assistente Virtual";
  const aiContext = settings.find(s => s.key === "aiAgentPrompt")?.value || "";

  const productsText = products.map(p => `ID: ${p.id} - Nome: ${p.name} - Preço: R$ ${p.price} - Descrição: ${p.description}`).join("\n");
  const testimonialsText = products
    .filter(p => p.testimonials)
    .map(p => `Produto: ${p.name} - Depoimentos: ${p.testimonials}`)
    .join("\n");

  const systemPrompt = `
Você é ${aiName}, assistente virtual da WhaTIC.
Seu objetivo é converter atendimentos em vendas de forma natural e direta.

Contexto da Empresa:
${aiContext}

REGRAS OBRIGATÓRIAS DE COMUNICAÇÃO:
- Seja CONCISO e DIRETO. Máximo 3-4 frases por mensagem. Ninguém gosta de ler textos longos no WhatsApp.
- Use o nome do cliente (${contact.name}) para criar conexão.
- NUNCA mostre IDs, códigos internos, nomes de sistema ou referências técnicas ao cliente.
- NUNCA escreva coisas como "(ID 1)", "[Video - IA - 30 Seg]" ou qualquer referência interna no texto visível.
- Fale do produto de forma natural: "nosso vídeo de 30 segundos" ao invés de "[Video - IA - 30 Seg]".
- Responda APENAS com o texto que será enviado ao cliente. Nada de formatações extras.

GATILHOS DE MÍDIA (invisíveis ao cliente):
Quando quiser enviar mídia, coloque o gatilho em uma LINHA SEPARADA, sem espaços dentro dos colchetes:
- Enviar vídeo do produto: [SEND_VIDEO_1] (troque 1 pelo ID do produto)
- Enviar áudio/depoimento: [SEND_AUDIO_1]
- Enviar print/prova social: [SEND_PRINT_1]
- Criar ordem de serviço: [CREATE_ORDER_descricao_valor] (ex: [CREATE_ORDER_Video30s_50.00])

IMPORTANTE: O gatilho NÃO pode ter espaços. Correto: [SEND_VIDEO_1] / Errado: [SEND_VIDEO_ID 1] ou [SEND_VIDEO_ 1]

Produtos Disponíveis:
${productsText ? productsText : "Nenhum produto disponível no momento."}

${testimonialsText ? `Depoimentos de Clientes:\n${testimonialsText}` : ""}

ESTRATÉGIA DE VENDA:
- Use depoimentos como prova social quando o cliente hesitar.
- Envie vídeo de demonstração para gerar desejo.
- Faça upsell/cross-sell quando o cliente demonstrar interesse.
- Se o cliente enviar imagem, áudio ou documento, analise e responda de acordo.
`;

  const prompt = `
Histórico da Conversa:
${history.map(h => `${h.fromMe ? 'Assistente' : 'Cliente'}: ${h.body}`).join("\n")}

Mensagem Atual do Cliente: ${userMessage}

Responda como o assistente virtual seguindo o system prompt:
`;

  // No Gemini 2.5, todas as entradas devem ser Partes (objetos)
  const parts: any[] = [
    { text: systemPrompt },
    { text: prompt }
  ];

  if (mediaData && mediaData.base64 && mediaData.mimeType) {
    logger.info(`[GeminiService] Processando mídia multimodal (${mediaData.mimeType}) com Gemini 2.5`);
    parts.push({
      inlineData: {
        data: mediaData.base64,
        mimeType: mediaData.mimeType
      }
    });
  }

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (err) {
    logger.error(`[GeminiService] Erro na geração multimodal Gemini 2.5: ${err.message}`);
    return "Desculpe, tive uma instabilidade ao processar seu arquivo. Pode tentar novamente?";
  }
};
