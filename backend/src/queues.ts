import * as Sentry from "@sentry/node";
import Queue, { Job } from "bull";
import moment from "moment";
import { Op, WhereOptions } from "sequelize";
import { CronJob } from "cron";
import { subDays, subMinutes } from "date-fns";
import { MessageData, SendMessage } from "./helpers/SendMessage";
import Whatsapp from "./models/Whatsapp";
import { logger } from "./utils/logger";
import Schedule from "./models/Schedule";
import Contact from "./models/Contact";
import GetDefaultWhatsApp from "./helpers/GetDefaultWhatsApp";
import GetWhatsappWbot from "./helpers/GetWhatsappWbot";
import User from "./models/User";
import Company from "./models/Company";
import Plan from "./models/Plan";
import TicketTraking from "./models/TicketTraking";
import { GetCompanySetting } from "./helpers/CheckSettings";
import { getWbot } from "./libs/wbot";
import Ticket from "./models/Ticket";
import QueueModel from "./models/Queue";
import UpdateTicketService from "./services/TicketServices/UpdateTicketService";
import { handleMessage } from "./services/WbotServices/wbotMessageListener";
import Invoices from "./models/Invoices";
import formatBody, { mustacheFormat } from "./helpers/Mustache";
import Setting from "./models/Setting";
import { parseToMilliseconds } from "./helpers/parseToMilliseconds";
import { startCampaignQueues } from "./queues/campaign";
import OutOfTicketMessage from "./models/OutOfTicketMessages";
import { getJidOf } from "./services/WbotServices/getJidOf";
import { _t } from "./services/TranslationServices/i18nService";
import { makeRandomId } from "./helpers/MakeRandomId";

const connection = process.env.REDIS_URI || "";
const limiterMax = process.env.REDIS_OPT_LIMITER_MAX || 1;
const limiterDuration = process.env.REDIS_OPT_LIMITER_DURATION || 3000;

export const userMonitor = new Queue("UserMonitor", connection);

export const messageQueue = new Queue("MessageQueue", connection, {
  limiter: {
    max: limiterMax as number,
    duration: limiterDuration as number
  }
});

export const scheduleMonitor = new Queue("ScheduleMonitor", connection);
export const sendScheduledMessages = new Queue(
  "SendSacheduledMessages",
  connection
);

async function handleSendMessage(job) {
  try {
    const { data } = job;
    const whatsapp = await Whatsapp.findByPk(data.whatsappId);
    if (whatsapp == null) {
      throw Error("Unidentified WhatsApp");
    }
    const messageData: MessageData = data.data;
    await SendMessage(whatsapp, messageData);
  } catch (e) {
    logger.error({ message: e?.message }, "MessageQueue -> SendMessage: error");
    throw e;
  }
}

async function handleVerifySchedules() {
  try {
    const { count, rows: schedules } = await Schedule.findAndCountAll({
      where: {
        status: "PENDENTE",
        sentAt: null,
        sendAt: {
          [Op.gte]: moment().format("YYYY-MM-DD HH:mm:ss"),
          [Op.lte]: moment().add("30", "seconds").format("YYYY-MM-DD HH:mm:ss")
        }
      },
      include: [{ model: Contact, as: "contact" }]
    });
    if (count > 0) {
      schedules.map(async schedule => {
        await schedule.update({ status: "AGENDADA" });
        sendScheduledMessages.add("SendMessage", { schedule }, { delay: 40000 });
        logger.info(`Delivery scheduled for: ${schedule.contact.name}`);
      });
    }
  } catch (e) {
    logger.error({ message: e?.message }, "SendScheduledMessage -> Verify: error");
    throw e;
  }
}

async function handleExpireOutOfTicketMessages() {
  OutOfTicketMessage.destroy({
    where: {
      createdAt: { [Op.lt]: subDays(new Date(), 1) }
    }
  });
}

async function handleSendScheduledMessage(job) {
  handleExpireOutOfTicketMessages();
  const { data: { schedule } } = job;
  let scheduleRecord: Schedule | null = null;
  try {
    scheduleRecord = await Schedule.findByPk(schedule.id, {
      include: [{ model: Contact, as: "contact" }, { model: User, as: "user" }]
    });
  } catch (e) {
    Sentry.captureException(e);
  }
  try {
    const whatsapp = await GetDefaultWhatsApp(schedule.companyId);
    const message = await SendMessage(whatsapp, {
      number: schedule.contact.number,
      body: mustacheFormat({
        body: schedule.body,
        contact: schedule.contact,
        currentUser: schedule.user
      })
    });
    if (schedule.saveMessage) {
      handleMessage(message, await GetWhatsappWbot(whatsapp), schedule.companyId);
    }
    await scheduleRecord?.update({ sentAt: new Date(), status: "ENVIADA" });
    sendScheduledMessages.clean(15000, "completed");
  } catch (e) {
    await scheduleRecord?.update({ status: "ERRO" });
    logger.error({ message: e?.message }, "SendScheduledMessage -> SendMessage: error");
    throw e;
  }
}

async function setRatingExpired(tracking: TicketTraking, threshold: Date) {
  await tracking.update({ expired: true });
  if (tracking.ratingAt < subMinutes(threshold, 5)) return;
  const wbot = getWbot(tracking.whatsapp.id);
  const complationMessage = tracking.whatsapp.complationMessage.trim() || _t("Service completed", tracking.whatsapp);
  await wbot.sendMessage(getJidOf(tracking.ticket), {
    text: formatBody(`\u200e${complationMessage}`, tracking.ticket)
  });
}

async function handleRatingsTimeout() {
  const openTrackingRatings = await TicketTraking.findAll({
    where: { rated: false, expired: false, ratingAt: { [Op.not]: null } },
    include: [{ model: Ticket, include: [{ model: Contact }, { model: User }, { model: QueueModel, as: "queue" }] }, { model: Whatsapp }]
  });
  const currentTime = new Date();
  for await (const tracking of openTrackingRatings) {
    const timeout = parseInt(await GetCompanySetting(tracking.companyId, "ratingsTimeout", "5"), 10) || 5;
    const threshold = subMinutes(currentTime, timeout);
    if (tracking.ratingAt < threshold) {
      await setRatingExpired(tracking, threshold);
    }
  }
}

async function handleNoQueueTimeout(company: Company, timeout: number, action: number) {
  if (action) {
    const queue = await QueueModel.findOne({ where: { companyId: company.id, id: action } });
    if (!queue) {
      await Setting.destroy({ where: { companyId: company.id, key: { [Op.like]: "noQueueTimeout%" } } });
      return;
    }
  }
  const where: WhereOptions<Ticket> = {
    status: "pending",
    companyId: company.id,
    queueId: null,
    updatedAt: { [Op.lt]: subMinutes(new Date(), timeout) }
  };
  const tickets = await Ticket.findAll({ where });
  for (const ticket of tickets) {
    const status = action ? "pending" : "closed";
    const queueId = action || null;
    const userId = status === "pending" ? null : ticket.userId;
    await UpdateTicketService({ ticketId: ticket.id, ticketData: { status, userId, queueId }, companyId: company.id });
  }
}

async function handleChatbotTicketTimeout(company: Company, timeout: number, action: number) {
  if (action) {
    const queue = await QueueModel.findOne({ where: { companyId: company.id, id: action } });
    if (!queue) {
      await Setting.destroy({ where: { companyId: company.id, key: { [Op.like]: "chatbotTicketTimeout%" } } });
      return;
    }
  }
  const where: WhereOptions<Ticket> = {
    status: "pending",
    companyId: company.id,
    isGroup: false,
    chatbot: true,
    updatedAt: { [Op.lt]: subMinutes(new Date(), timeout) }
  };
  const tickets = await Ticket.findAll({ where });
  for (const ticket of tickets) {
    const status = action ? "pending" : "closed";
    const queueId = action || null;
    await UpdateTicketService({ ticketId: ticket.id, ticketData: { status, queueId }, companyId: company.id });
  }
}

async function handleOpenTicketTimeout(company: Company, timeout: number, status: string) {
  const tickets = await Ticket.findAll({
    where: { status: "open", companyId: company.id, updatedAt: { [Op.lt]: subMinutes(new Date(), timeout) } }
  });
  for (const ticket of tickets) {
    await UpdateTicketService({
      ticketId: ticket.id,
      ticketData: { status, queueId: ticket.queueId, userId: status !== "pending" ? ticket.userId : null },
      companyId: company.id
    });
  }
}

async function handleTicketTimeouts() {
  const companies = await Company.findAll();
  for (const company of companies) {
    const noQueueTimeout = Number(await GetCompanySetting(company.id, "noQueueTimeout", "0"));
    if (noQueueTimeout) {
      const noQueueTimeoutAction = Number(await GetCompanySetting(company.id, "noQueueTimeoutAction", "0"));
      await handleNoQueueTimeout(company, noQueueTimeout, noQueueTimeoutAction || 0);
    }
    const openTicketTimeout = Number(await GetCompanySetting(company.id, "openTicketTimeout", "0"));
    if (openTicketTimeout) {
      const openTicketTimeoutAction = await GetCompanySetting(company.id, "openTicketTimeoutAction", "pending");
      await handleOpenTicketTimeout(company, openTicketTimeout, openTicketTimeoutAction);
    }
    const chatbotTicketTimeout = Number(await GetCompanySetting(company.id, "chatbotTicketTimeout", "0"));
    if (chatbotTicketTimeout) {
      const chatbotTicketTimeoutAction = Number(await GetCompanySetting(company.id, "chatbotTicketTimeoutAction", "0")) || 0;
      await handleChatbotTicketTimeout(company, chatbotTicketTimeout, chatbotTicketTimeoutAction);
    }
  }
}

async function handleEveryMinute(job: Job) {
  const executionId = makeRandomId(10);
  try {
    await handleRatingsTimeout();
    await handleTicketTimeouts();
  } catch (e) {
    logger.error({ message: e?.message }, `handleEveryMinute: error - ${executionId}`);
  }
}

export async function startQueueProcess() {
  logger.info("Starting queue processing");

  messageQueue.process("SendMessage", handleSendMessage);
  scheduleMonitor.process("Verify", handleVerifySchedules);
  sendScheduledMessages.process("SendMessage", handleSendScheduledMessage);
  userMonitor.process("EveryMinute", handleEveryMinute);

  userMonitor.add("EveryMinute", {}, {
    repeat: { cron: "0 0 * * *" },
    removeOnComplete: true
  });
}
