import { WASocket } from "libzapitu-rf";
import Ticket from "../../models/Ticket";
import Product from "../../models/Product";
import { GeminiService } from "./GeminiService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import path from "path";
import fs from "fs";
import ServiceOrder from "../../models/ServiceOrder";

export interface MediaData {
  base64: string;
  mimeType: string;
}

export const handleAIAgent = async (
  wbot: WASocket,
  ticket: Ticket,
  messageBody: string,
  mediaData?: MediaData
): Promise<void> => {
  if (!ticket.aiAgent) {
    return;
  }

  let response = await GeminiService({
    companyId: ticket.companyId,
    ticketId: ticket.id,
    messageBody,
    mediaData
  });

  if (response) {
    // Check for media triggers
    const audioMatch = response.match(/\[SEND_AUDIO_(\d+)\]/);
    const printMatch = response.match(/\[SEND_PRINT_(\d+)\]/);

    if (audioMatch) {
      const productId = audioMatch[1];
      const product = await Product.findByPk(productId);
      if (product && product.testimonialAudioUrl) {
        const filePath = path.join(__dirname, "..", "..", "..", "public", product.testimonialAudioUrl);
        if (fs.existsSync(filePath)) {
          await SendWhatsAppMedia({
            media: {
              path: filePath,
              originalname: product.testimonialAudioUrl,
              mimetype: "audio/mp4",
              size: fs.statSync(filePath).size
            } as any,
            ticket
          });
        }
      }
      response = response.replace(/\[SEND_AUDIO_(\d+)\]/g, "");
    }

    if (printMatch) {
      const productId = printMatch[1];
      const product = await Product.findByPk(productId);
      if (product && product.testimonialImageUrl) {
        const filePath = path.join(__dirname, "..", "..", "..", "public", product.testimonialImageUrl);
        if (fs.existsSync(filePath)) {
          await SendWhatsAppMedia({
            media: {
              path: filePath,
              originalname: product.testimonialImageUrl,
              mimetype: "image/png",
              size: fs.statSync(filePath).size
            } as any,
            ticket
          });
        }
      }
      response = response.replace(/\[SEND_PRINT_(\d+)\]/g, "");
    }

    // Check for Service Order creation
    const orderMatch = response.match(/\[CREATE_ORDER_(.+?)_([\d.]+)\]/);
    if (orderMatch) {
      const description = orderMatch[1];
      const valueStr = orderMatch[2];
      const value = parseFloat(valueStr);
      
      try {
        const order = await ServiceOrder.create({
          contactId: ticket.contactId,
          companyId: ticket.companyId,
          description,
          value: isNaN(value) ? 0 : value,
          status: "PENDENTE"
        });
        
        response = response.replace(/\[CREATE_ORDER_(.+?)_([\d.]+)\]/g, "");
        response += `\n\n✅ *Ordem de Serviço #${order.id} aberta com sucesso!*\nVocê já pode acompanhar os detalhes e realizar o pagamento pelo seu portal do cliente.`;
      } catch (err) {
        console.error("Error creating AI Service Order:", err);
      }
    }

    if (response.trim() !== "") {
      await SendWhatsAppMessage({
        body: response.trim(),
        ticket
      });
    }
  }
};
