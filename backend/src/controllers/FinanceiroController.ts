import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import ContactPurchase from "../models/ContactPurchase";
import Contact from "../models/Contact";
import moment from "moment";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  const totalWeek = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("week").toDate() }
    }
  });

  const totalMonth = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("month").toDate() }
    }
  });

  const totalYear = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("year").toDate() }
    }
  });

  const topClients = await ContactPurchase.findAll({
    where: { companyId },
    attributes: [
      "contactId",
      [fn("sum", col("price")), "totalSpent"]
    ],
    include: [{ model: Contact, attributes: ["name", "number"] }],
    group: ["contactId", "contact.id"],
    order: [[fn("sum", col("price")), "DESC"]],
    limit: 10
  });

  return res.json({
    totalWeek: totalWeek || 0,
    totalMonth: totalMonth || 0,
    totalYear: totalYear || 0,
    topClients
  });
};
