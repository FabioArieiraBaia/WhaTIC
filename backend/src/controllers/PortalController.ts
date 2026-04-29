
import { Request, Response } from "express";
import Contact from "../models/Contact";
import ServiceOrder from "../models/ServiceOrder";
import Product from "../models/Product";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import AppError from "../errors/AppError";
import { formatProductUrls, getFullUrl } from "../helpers/FormatProductUrls";
import { uploadToGCS } from "../helpers/UploadToGCS";
import AuthContactService from "../services/ContactServices/AuthContactService";
import MagicLinkService from "../services/ContactServices/MagicLinkService";
import { verify } from "jsonwebtoken";
import authConfig from "../config/auth";
import { SerializeContact } from "../helpers/SerializeContact";
import Company from "../models/Company";
import { Op } from "sequelize";

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { number, password, token } = req.body;

  if (token) {
    // Magic Link Login
    try {
      const decoded: any = verify(token, authConfig.secret);
      if (decoded.action !== "magic-link") {
        throw new AppError("Invalid token action", 401);
      }
      const contact = await Contact.findByPk(decoded.contactId, {
        include: [Company]
      });
      if (!contact) {
        throw new AppError("Contact not found", 404);
      }

      if (decoded.action === "magic-link") {
        await contact.update({ isVerified: true });
      }

      const { serializedContact, token: accessToken, refreshToken } = await AuthContactService({ number: contact.number });

      return res.json({
        contact: serializedContact,
        token: accessToken,
        refreshToken,
        contactId: contact.id,
        resetPassword: decoded.action === "magic-link" 
      });
    } catch (err) {
      throw new AppError("Link de acesso expirado ou inválido", 401);
    }
  }

  if (!number) {
    throw new AppError("Número de telefone é obrigatório", 400);
  }

  // Se não tem senha, verificar se é o primeiro acesso
  const cleanNumber = number.replace(/\D/g, "");
  const contact = await Contact.findOne({ 
    where: { 
      [Op.or]: [
        { number: cleanNumber },
        { number: { [Op.like]: `%${cleanNumber}` } }
      ]
    } 
  });

  if (!contact) {
    throw new AppError("Cliente não encontrado", 404);
  }

  if (!contact.passwordHash) {
    return res.json({ firstAccess: true, contactId: contact.id });
  }

  if (!password) {
    return res.json({ action: "SEND_MAGIC_LINK", contactId: contact.id });
  }

  const { serializedContact, token: accessToken, refreshToken } = await AuthContactService({ number, password });

  return res.json({
    contact: serializedContact,
    token: accessToken,
    refreshToken
  });
};

export const requestMagicLink = async (req: Request, res: Response): Promise<Response> => {
  const { number, companyId } = req.body;
  if (!number) {
    throw new AppError("O número é obrigatório", 400);
  }

  await MagicLinkService({ number, companyId });

  return res.json({ message: "Link enviado com sucesso" });
};

export const setInitialPassword = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new AppError("As senhas não coincidem", 400);
  }

  const contact = await Contact.findByPk(contactId);
  if (!contact) {
    throw new AppError("Cliente não encontrado", 404);
  }

  await contact.update({ password, isVerified: false });

  // Enviar link de confirmação via WhatsApp
  await MagicLinkService({ 
    number: contact.number, 
    companyId: contact.companyId 
  });

  return res.status(200).json({ message: "Senha criada. Verifique seu WhatsApp para confirmar o acesso." });
};

export const me = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.user;
  const contact = await Contact.findByPk(id, {
    include: [Company]
  });

  if (!contact) {
    throw new AppError("ERR_UNAUTHORIZED", 401);
  }

  const serializedContact = await SerializeContact(contact);

  return res.json(serializedContact);
};

export const listOrders = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;

  console.log(`[Portal] Listing orders for contact ${contactId}`);
  const orders = await ServiceOrder.findAll({
    where: { contactId },
    include: [
      {
        model: Product,
        attributes: ["id", "name", "description", "price", "imageUrl", "pixImageUrl", "pixCopiaCola"]
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  console.log(`[Portal] Found ${orders.length} orders. Sample product PIX:`, orders[0]?.product?.pixImageUrl);

  const processedOrders = orders.map(order => {
    const o = order.toJSON() as any;
    if (o.product) {
      o.product = formatProductUrls(o.product);
    }
    return o;
  });

  return res.json(processedOrders);
};

export const approveOrder = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  const order = await ServiceOrder.findByPk(id);

  if (!order) {
    throw new AppError("Pedido não encontrado", 404);
  }

  // When client approves the video/result, it moves to payment
  await order.update({ status: "AGUARDANDO_PAGAMENTO" });

  // Notificar no WhatsApp
  try {
    const contact = await Contact.findByPk(order.contactId);
    const product = await Product.findByPk(order.productId);
    const companyId = order.companyId;

    if (contact && product) {
      const whatsapp = await Whatsapp.findOne({
        where: { companyId, status: "CONNECTED" }
      }) || await Whatsapp.findOne({ where: { companyId } });

      if (whatsapp) {
        const { ticket } = await FindOrCreateTicketService(contact, whatsapp.id, companyId);
        const message = `*Pedido #${order.id}*\n🎬 Seu vídeo está pronto!\n\nAcesse nossa plataforma e conclua o pagamento no link abaixo:\n${process.env.FRONTEND_URL}/portal/orders\n\n${product.pixCopiaCola ? `*Chave PIX (Copia e Cola):*\n${product.pixCopiaCola}\n\n` : ""}Assim que o pagamento for aprovado, você poderá fazer o download do seu vídeo. ✨`;

        await SendWhatsAppMessage({
          body: message,
          ticket
        });
      }
    }
  } catch (err) {
    console.error("Erro ao enviar notificação de aprovação", err);
  }

  return res.json(order);
};

export const listProducts = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  const products = await Product.findAll({
    where: { companyId, isActive: true },
    order: [["name", "ASC"]]
  });

  return res.json(products.map(formatProductUrls));
};

export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  const { contactId, productId, description, companyId } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) {
    throw new AppError("Produto não encontrado", 404);
  }

  const order = await ServiceOrder.create({
    contactId,
    productId,
    description: description || `Pedido de ${product.name}`,
    companyId,
    status: "PENDENTE",
    value: product.price
  });

  // Notificar no WhatsApp (garantir que haja um ticket aberto)
  try {
    const contact = await Contact.findByPk(contactId);
    if (contact) {
      // Buscar WhatsApp padrão da empresa
      const whatsapp = await Whatsapp.findOne({
        where: { companyId, isDefault: true }
      }) || await Whatsapp.findOne({ where: { companyId } });

      if (whatsapp) {
        const { ticket } = await FindOrCreateTicketService(contact, whatsapp.id, companyId);
        
        await CreateMessageService({
          messageData: {
            id: `portal_${order.id}_${Date.now()}`,
            ticketId: ticket.id,
            contactId: contact.id,
            body: `*⚠️ NOVO PEDIDO REALIZADO PELO PORTAL*\n\n*Pedido:* #${order.id}\n*Produto:* ${product.name}\n*Descrição:* ${order.description}\n*Valor:* R$ ${order.value}`,
            fromMe: false, // Mensagem vinda do cliente no portal
            read: false,
            ack: 1
          },
          companyId
        });
      }
    }
  } catch (err) {
    console.error("Erro ao enviar notificação de pedido no WhatsApp", err);
  }

  return res.json(order);
};

export const uploadProof = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const file = req.file;

  if (!file) {
    throw new AppError("Arquivo de comprovante não enviado", 400);
  }

  console.log(`[Portal] Uploading proof for order ${id}`);
  const order = await ServiceOrder.findByPk(id);
  if (!order) {
    throw new AppError("Pedido não encontrado", 404);
  }

  // Update to REVISAO (which the DB already knows) to represent analysis
  await order.update({ status: "REVISAO" });
  console.log(`[Portal] Order ${id} status updated to REVISAO (Analysis)`);

  // Notify on WhatsApp
  try {
    const contact = await Contact.findByPk(order.contactId);
    const companyId = order.companyId;

    if (contact) {
      const whatsapp = await Whatsapp.findOne({
        where: { companyId, status: "CONNECTED" }
      }) || await Whatsapp.findOne({ where: { companyId } });

      if (whatsapp) {
        const { ticket } = await FindOrCreateTicketService(contact, whatsapp.id, companyId);
        
        // Upload to GCS
        const uploadedPath = await uploadToGCS(file);
        const proofLink = getFullUrl(uploadedPath);
        
        const message = `*🔍 COMPROVANTE PARA ANÁLISE*\n\nO cliente *${contact.name}* enviou o comprovante do pedido *#${order.id}*.\n\n*Status:* Alterado para REVISÃO.\n*Ver comprovante:* ${proofLink}\n\n_Confira o pagamento e mude o status para PAGO para notificar o cliente._`;

        await CreateMessageService({
          messageData: {
            id: `portal_proof_${order.id}_${Date.now()}`,
            ticketId: ticket.id,
            contactId: contact.id,
            body: message,
            fromMe: false, // Message from portal client
            read: false,
            ack: 1
          },
          companyId
        });
      }
    }
  } catch (err) {
    console.error("Erro ao enviar notificação de comprovante", err);
  }

  return res.json(order);
};
