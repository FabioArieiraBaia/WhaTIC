import { sign } from "jsonwebtoken";
import authConfig from "../../config/auth";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import Whatsapp from "../../models/Whatsapp";
import { Op } from "sequelize";

interface Request {
  number: string;
  companyId: number;
}

const MagicLinkService = async ({
  number,
  companyId: providedCompanyId
}: Request): Promise<void> => {
  try {
    const cleanNumber = number.replace(/\D/g, "");
    console.log(`[MagicLink] Iniciando busca para: ${cleanNumber}`);

    const contact = await Contact.findOne({
      where: { 
        [Op.or]: [
          { number: cleanNumber },
          { number: { [Op.like]: `%${cleanNumber.slice(-8)}%` } }
        ]
      }
    });

    if (!contact) {
      console.error(`[MagicLink] Contato não encontrado.`);
      throw new AppError("ERR_CONTACT_NOT_FOUND", 404);
    }

    const companyId = providedCompanyId || contact.companyId;
    console.log(`[MagicLink] Empresa: ${companyId}`);

    const { secret } = authConfig;
    const token = sign(
      { contactId: contact.id, companyId: contact.companyId, action: "magic-link" },
      secret,
      { expiresIn: "15m" }
    );

    const portalUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/login?token=${token}`;

    const whatsapp = await Whatsapp.findOne({
      where: { companyId, status: "CONNECTED" }
    }) || await Whatsapp.findOne({ where: { companyId } });

    if (!whatsapp) {
      console.error(`[MagicLink] WhatsApp não encontrado.`);
      throw new AppError("ERR_NO_WHATSAPP_FOUND", 404);
    }

    const { ticket } = await FindOrCreateTicketService(contact, whatsapp.id, companyId);
    const body = `*Acesso ao Portal*\n\nOlá ${contact.name}! Clique no link abaixo para acessar sua conta de forma segura:\n\n${portalUrl}\n\n_Este link expira em 15 minutos._`;

    await CreateMessageService({
      messageData: {
        id: `magic_link_${contact.id}_${Date.now()}`,
        ticketId: ticket.id,
        contactId: contact.id,
        body,
        fromMe: true,
        read: true
      },
      companyId
    });
    console.log(`[MagicLink] Mensagem enviada com sucesso.`);
  } catch (err) {
    console.error("[MagicLink Error]", err);
    throw err;
  }
};

export default MagicLinkService;
