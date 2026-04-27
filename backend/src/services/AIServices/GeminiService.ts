import { GoogleGenerativeAI } from "@google/generative-ai";
import Contact from "../../models/Contact";
import Product from "../../models/Product";
import Setting from "../../models/Setting";

export const GeminiService = async (
  contact: Contact,
  ticketId: number,
  companyId: number,
  userMessage: string,
  history: any[] = []
): Promise<string> => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const products = await Product.findAll({ where: { companyId } });
  
  const settings = await Setting.findAll({ where: { companyId } });
  const aiName = settings.find(s => s.key === "aiName")?.value || "Assistente Virtual";
  const aiContext = settings.find(s => s.key === "aiContext")?.value || "";

  const productsText = products.map(p => `ID: ${p.id} - Nome: ${p.name} - Preço: R$ ${p.price} - Descrição: ${p.description}`).join("\n");

  const systemPrompt = `
Você é ${aiName}, um assistente virtual inteligente e proativo da WhaTIC.
Seu objetivo principal é converter atendimentos em vendas, oferecendo os produtos da empresa de forma natural e persuasiva.

Contexto da Empresa:
${aiContext}

Instruções de Atendimento:
- Seja sempre educado, prestativo e use um tom de voz que combine com a marca.
- Use o nome do cliente (${contact.name}) para criar conexão.
- Analise o histórico da conversa para dar respostas coerentes.

Gatilhos Especiais (Use estes comandos EXATAMENTE como escritos quando apropriado):
1. Para enviar um ÁUDIO de demonstração/testemunho de um produto: [SEND_AUDIO_ID]
2. Para enviar um VÍDEO de um produto: [SEND_VIDEO_ID]
3. Para enviar um PRINT/DEPOIMENTO (prova social) de um produto: [SEND_PRINT_ID]

Substitua ID pelo número do ID do produto correspondente.

Regras de Negócio:
- Use provas sociais e áudios de outros clientes para gerar confiança.
- Se o cliente demonstrar interesse em fechar um pedido ou contratar um serviço, pergunte educadamente se ele gostaria que você abrisse uma **Ordem de Serviço** para formalizar o pedido.
- Se o cliente confirmar, colete os detalhes do que ele precisa e o valor acordado.
- Para efetivar a abertura da ordem no sistema, você **DEVE** incluir no final da sua resposta o comando: **[CREATE_ORDER_Descricao do Pedido_Valor]**
  - Exemplo: "Com certeza! Vou abrir sua ordem agora. [CREATE_ORDER_Criação de Site Institucional_1500.00]"
- Use o ponto (.) como separador decimal para o valor (Ex: 150.00).

Produtos Disponíveis:
${productsText ? productsText : "Nenhum produto disponível no momento."}

Responda APENAS com o texto que deve ser enviado ao cliente, incluindo o comando entre colchetes quando necessário.
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
