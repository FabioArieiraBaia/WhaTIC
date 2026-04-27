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
  history: any[] = []
): Promise<string> => {
  const settings = await Setting.findAll({ where: { companyId } });
  const geminiKey = settings.find(s => s.key === "geminiApiKey")?.value || "";
  
  if (!geminiKey) {
    logger.error(`[GeminiService] No API Key found for company ${companyId}`);
    return "Desculpe, meu sistema de inteligência está temporariamente indisponível (chave ausente no painel).";
  }

  const aiAgentModel = settings.find(s => s.key === "aiAgentModel")?.value || "gemini-1.5-pro";
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
Você é ${aiName}, um assistente virtual inteligente e proativo da WhaTIC.
Seu objetivo principal é converter atendimentos em vendas, oferecendo os produtos da empresa de forma natural e persuasiva.

Contexto da Empresa:
${aiContext}

Instruções de Atendimento:
- Seja sempre educado, prestativo e use um tom de voz que combine com a marca.
- Use o nome do cliente (${contact.name}) para criar conexão.
- Analise o histórico da conversa para dar respostas coerentes.
- Se o cliente perguntar algo que não está no contexto, tente ajudar da melhor forma, mas sempre direcione para os produtos da empresa.

Gatilhos Especiais (Use estes comandos EXATAMENTE como escritos quando apropriado):
1. Para enviar um ÁUDIO de demonstração de um produto: [SEND_AUDIO_ID]
2. Para enviar um VÍDEO de um produto: [SEND_VIDEO_ID]
3. Para enviar um PRINT/DEPOIMENTO (prova social) de um produto: [SEND_PRINT_ID]
4. Para criar uma ORDEM DE SERVIÇO quando o cliente confirmar a compra ou um serviço: [CREATE_ORDER_descricao_valor]

Substitua ID pelo número do ID do produto correspondente.
Para a Ordem de Serviço, substitua 'descricao' pelo nome do serviço e 'valor' pelo preço (ex: [CREATE_ORDER_Video_60s_100.00]).

Produtos Disponíveis:
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
Histórico da Conversa:
${history.map(h => `${h.fromMe ? 'Assistente' : 'Cliente'}: ${h.body}`).join("\n")}

Mensagem Atual do Cliente: ${userMessage}

Responda como o assistente virtual seguindo o system prompt:
`;

  const result = await model.generateContent([systemPrompt, prompt]);
  const response = await result.response;
  return response.text();
};
