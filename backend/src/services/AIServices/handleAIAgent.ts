import { Ticket } from "../../models/Ticket";
import Product from "../../models/Product";
import ServiceOrder from "../../models/ServiceOrder";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import path from "path";
import fs from "fs";

export interface MediaData {
  base64: string;
  name: string;
  type: string;
}

const handleAIAgent = async (
  ticket: Ticket,
  response: string
): Promise<void> => {
  try {
    // Check for [SEND_AUDIO_ID] trigger
    const audioMatch = response.match(/\[SEND_AUDIO_(\d+)\]/);
    if (audioMatch) {
      const productId = audioMatch[1];
      const product = await Product.findByPk(productId);
      if (product && product.audioUrl) {
        const filePath = path.join(__dirname, "..", "..", "..", "public", product.audioUrl);
        if (fs.existsSync(filePath)) {
          await SendWhatsAppMedia({
            media: {
              path: filePath,
              originalname: product.audioUrl,
              mimetype: "audio/ogg",
              size: fs.statSync(filePath).size
            } as any,
            ticket
          });
        }
      }
      response = response.replace(/\[SEND_AUDIO_(\d+)\]/g, "");
    }

    // Check for [SEND_VIDEO_ID] trigger
    const videoMatch = response.match(/\[SEND_VIDEO_(\d+)\]/);
    if (videoMatch) {
      const productId = videoMatch[1];
      const product = await Product.findByPk(productId);
      if (product && product.videoUrl) {
        const filePath = path.join(__dirname, "..", "..", "..", "public", product.videoUrl);
        if (fs.existsSync(filePath)) {
          await SendWhatsAppMedia({
            media: {
              path: filePath,
              originalname: product.videoUrl,
              mimetype: "video/mp4",
              size: fs.statSync(filePath).size
            } as any,
            ticket
          });
        }
      }
      response = response.replace(/\[SEND_VIDEO_(\d+)\]/g, "");
    }

    // Check for [SEND_PRINT_ID] trigger (Testimonials)
    const printMatch = response.match(/\[SEND_PRINT_(\d+)\]/);
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
  } catch (err) {
    console.error("Error in handleAIAgent:", err);
  }
};

export default handleAIAgent;
