import { WASocket } from "libzapitu-rf";
import Ticket from "../../models/Ticket";
import { GeminiService } from "./GeminiService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";

export const handleAIAgent = async (
  wbot: WASocket,
  ticket: Ticket,
  messageBody: string
): Promise<void> => {
  if (!ticket.aiAgent) {
    return;
  }

  const response = await GeminiService({
    companyId: ticket.companyId,
    ticketId: ticket.id,
    messageBody
  });

  if (response) {
    await SendWhatsAppMessage({
      body: response,
      ticket
    });
  }
};
