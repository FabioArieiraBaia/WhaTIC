import { Request, Response } from "express";
import { Op } from "sequelize";
import ServiceOrder from "../models/ServiceOrder";
import Product from "../models/Product";
import ContactPurchase from "../models/ContactPurchase";
import Contact from "../models/Contact";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import { getMessageFileOptions, sendWhatsappFile } from "../services/WbotServices/SendWhatsAppMedia";
import { getFullUrl } from "../helpers/FormatProductUrls";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const orders = await ServiceOrder.findAll({
    where: { contactId, companyId },
    include: [{ model: Product, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]]
  });

  return res.status(200).json(orders);
};

export const listAll = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const orders = await ServiceOrder.findAll({
    where: { companyId },
    include: [
      { model: Product, attributes: ["id", "name"] },
      "contact"
    ],
    order: [["createdAt", "DESC"]]
  });

  return res.status(200).json(orders);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId, productId, description, status, value } = req.body;

  const order = await ServiceOrder.create({
    contactId,
    productId,
    description,
    status,
    value,
    companyId
  });

  if (status === "CONCLUIDO") {
    await ContactPurchase.create({
      contactId,
      productId: productId || null,
      price: value || 0,
      purchaseDate: new Date(),
      companyId
    });
  }

  const reloadOrder = await ServiceOrder.findByPk(order.id, {
    include: [{ model: Product, attributes: ["id", "name"] }]
  });

  return res.status(200).json(reloadOrder);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { status, description, productId, value, videoUrl, finalVideoUrl } = req.body;
  const combinedVideoUrl = `${videoUrl || ""}###${finalVideoUrl || ""}`;

  const order = await ServiceOrder.findOne({
    where: { id, companyId }
  });

  if (!order) {
    throw new AppError("ERR_NO_SERVICE_ORDER_FOUND", 404);
  }

  const oldStatus = order.status;
  await order.update({ status, description, productId, value, videoUrl: combinedVideoUrl });

  // Notification Process (Separated to not block the response)
  (async () => {
    try {
      const contact = await Contact.findByPk(order.contactId);
      if (!contact) return;

      // Find any session that is NOT disconnected
      const whatsapp = await Whatsapp.findOne({
        where: { 
          companyId, 
          status: { [Op.notIn]: ["DISCONNECTED", "qrcode"] } 
        }
      });

      if (whatsapp) {
        const { ticket } = await FindOrCreateTicketService(contact, whatsapp.id, companyId);
        
        let message = "";
        if (status === "EM_ANDAMENTO") {
          message = `*Pedido #${order.id}*\nSeu pedido foi aceito e já está em produção! 🚀`;
        } else if (status === "REVISAO") {
          message = `*Pedido #${order.id}*\nSeu vídeo está pronto para revisão! Assista no nosso portal: ${process.env.FRONTEND_URL}/portal/orders`;
        } else if (status === "AGUARDANDO_PAGAMENTO") {
          const product = await Product.findByPk(order.productId || productId || order.productId);
          message = `*Pedido #${order.id}*\n🎬 Seu vídeo está pronto!\n\nAcesse nossa plataforma e conclua o pagamento no link abaixo:\n${process.env.FRONTEND_URL}/portal/orders\n\n`;
          
          if (product?.pixCopiaCola) {
            message += `*Chave PIX (Copia e Cola):*\n${product.pixCopiaCola}\n\n`;
          }
          
          message += `Assim que o pagamento for aprovado, você poderá fazer o download do seu vídeo. ✨`;
        } else if (status === "PAGO") {
          message = `*Pedido #${order.id}*\nSeu pagamento foi confirmado! 🚀\nObrigado por confiar no nosso trabalho. ✨`;
          if (finalVideoUrl) {
            message += `\n\n⬇️ *Baixar Material:*\n${finalVideoUrl}`;
          }
        } else if (status === "CONCLUIDO") {
          message = `*Pedido #${order.id}*\nPedido concluído com sucesso! Obrigado pela preferência. ✨`;
          if (finalVideoUrl) {
            message += `\n\n⬇️ *Baixar Material:*\n${finalVideoUrl}`;
          }
        }

        if (message) {
          // Attempt to send via WhatsApp, but don't crash if session is flapping
          try {
            const product = await Product.findByPk(order.productId || productId || order.productId);
            
            // If it's PIX status and there is a QR Code image, send it via URL (supports both GCS and local)
            if (status === "AGUARDANDO_PAGAMENTO" && product?.pixImageUrl) {
                const pixUrl = getFullUrl(product.pixImageUrl);
                
                if (pixUrl) {
                    const mediaOptions = await getMessageFileOptions(
                        "qrcode-pix.png",
                        pixUrl,
                        "image/png"
                    );
                    
                    if (mediaOptions) {
                        await sendWhatsappFile(ticket, {
                            mediaUrl: product.pixImageUrl,
                            mimetype: "image/png",
                            filename: "qrcode-pix.png"
                        }, {
                            caption: message,
                            fileName: "qrcode-pix.png",
                            ...mediaOptions
                        } as any);
                    } else {
                        await SendWhatsAppMessage({ body: message, ticket });
                    }
                } else {
                    await SendWhatsAppMessage({ body: message, ticket });
                }
            } else {
                await SendWhatsAppMessage({ body: message, ticket });
            }
          } catch (wErr: any) {
            console.warn(`[ServiceOrder] WhatsApp send failed for order #${order.id}, recording in chat anyway:`, wErr.message);
          }
          
          // Always record in database so the operator sees what was attempted
          await CreateMessageService({
            messageData: {
              id: `notif_order_${order.id}_${new Date().getTime()}`,
              ticketId: ticket.id,
              contactId: contact.id,
              body: message,
              fromMe: true,
              read: true
            },
            companyId
          });
        }
      }
    } catch (err) {
      console.error("[ServiceOrder] Critical error in notification background process:", err);
    }
  })();

  if (status === "CONCLUIDO" && oldStatus !== "CONCLUIDO") {
    await ContactPurchase.create({
      contactId: order.contactId,
      productId: productId || order.productId || null,
      price: value || order.value || 0,
      purchaseDate: new Date(),
      companyId
    });
  }

  const reloadOrder = await ServiceOrder.findByPk(order.id, {
    include: [{ model: Product, attributes: ["id", "name"] }]
  });

  return res.status(200).json(reloadOrder);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const order = await ServiceOrder.findOne({
    where: { id, companyId }
  });

  if (!order) {
    throw new AppError("ERR_NO_SERVICE_ORDER_FOUND", 404);
  }

  await order.destroy();

  return res.status(200).json({ message: "Service Order deleted" });
};
