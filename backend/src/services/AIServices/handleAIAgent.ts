import Ticket from "../../models/Ticket";
import Product from "../../models/Product";
import ServiceOrder from "../../models/ServiceOrder";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import path from "path";
import fs from "fs";
import { Storage } from "@google-cloud/storage";
import os from "os";
import { GeminiService } from "./GeminiService";
import Message from "../../models/Message";

export interface MediaData {
  base64: string;
  mimeType: string;
}

const downloadFromGCS = async (mediaPath: string): Promise<string> => {
  const bucketName = process.env.GCS_BUCKET;
  if (!bucketName) throw new Error("GCS_BUCKET not configured");
  
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  
  // Try with 'products/' prefix if it's a product asset and doesn't have it
  let file = bucket.file(mediaPath);
  let [exists] = await file.exists();
  
  if (!exists && !mediaPath.startsWith("products/")) {
    file = bucket.file(`products/${mediaPath}`);
    [exists] = await file.exists();
  }

  if (!exists && !mediaPath.startsWith("proofs/")) {
    // Try in 'proofs/' for payment proofs
    file = bucket.file(`proofs/${mediaPath}`);
    [exists] = await file.exists();
  }
  
  if (!exists) throw new Error(`Object ${mediaPath} not found in bucket ${bucketName}`);
  
  const tempPath = path.join(os.tmpdir(), path.basename(mediaPath));
  await file.download({ destination: tempPath });
  return tempPath;
};

const handleAIAgent = async (
  wbot: any,
  ticket: Ticket,
  bodyMessage: string,
  mediaData: MediaData | null
): Promise<void> => {
  const storageType = process.env.STORAGE_TYPE || "local";
  try {
    const history = await Message.findAll({
      where: { ticketId: ticket.id },
      order: [["createdAt", "DESC"]],
      limit: 10
    });
    
    let response = await GeminiService(
      ticket.contact,
      ticket.id,
      ticket.companyId,
      bodyMessage,
      history.reverse()
    );

    // Check for [SEND_AUDIO_ID] trigger
    const audioMatch = response.match(/\[SEND_AUDIO_(\d+)\]/);
    if (audioMatch) {
      const productId = audioMatch[1];
      const product = await Product.findByPk(productId);
      if (product && product.testimonialAudioUrl) {
        let filePath = "";
        let isTemp = false;
        try {
          if (storageType === "gcs") {
            filePath = await downloadFromGCS(product.testimonialAudioUrl);
            isTemp = true;
          } else {
            filePath = path.join(__dirname, "..", "..", "..", "public", product.testimonialAudioUrl);
          }

          if (fs.existsSync(filePath)) {
            await SendWhatsAppMedia({
              media: {
                path: filePath,
                originalname: product.testimonialAudioUrl,
                mimetype: "audio/ogg",
                size: fs.statSync(filePath).size
              } as any,
              ticket
            });
          }
        } finally {
          if (isTemp && fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
        let filePath = "";
        let isTemp = false;
        try {
          if (storageType === "gcs") {
            filePath = await downloadFromGCS(product.videoUrl);
            isTemp = true;
          } else {
            filePath = path.join(__dirname, "..", "..", "..", "public", product.videoUrl);
          }

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
        } finally {
          if (isTemp && fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
        let filePath = "";
        let isTemp = false;
        try {
          if (storageType === "gcs") {
            filePath = await downloadFromGCS(product.testimonialImageUrl);
            isTemp = true;
          } else {
            filePath = path.join(__dirname, "..", "..", "..", "public", product.testimonialImageUrl);
          }

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
        } finally {
          if (isTemp && fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
