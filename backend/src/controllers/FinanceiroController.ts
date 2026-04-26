import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import ContactPurchase from "../models/ContactPurchase";
import Contact from "../models/Contact";
import Expense from "../models/Expense";
import moment from "moment";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  
  // Incomes (from ContactPurchase)
  const totalIncomesWeek = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("week").toDate() }
    }
  }) || 0;

  const totalIncomesMonth = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("month").toDate() }
    }
  }) || 0;

  const totalIncomesYear = await ContactPurchase.sum("price", {
    where: {
      companyId,
      purchaseDate: { [Op.gte]: moment().startOf("year").toDate() }
    }
  }) || 0;

  // Expenses
  const totalExpensesWeek = await Expense.sum("value", {
    where: {
      companyId,
      expenseDate: { [Op.gte]: moment().startOf("week").toDate() }
    }
  }) || 0;

  const totalExpensesMonth = await Expense.sum("value", {
    where: {
      companyId,
      expenseDate: { [Op.gte]: moment().startOf("month").toDate() }
    }
  }) || 0;

  const totalExpensesYear = await Expense.sum("value", {
    where: {
      companyId,
      expenseDate: { [Op.gte]: moment().startOf("year").toDate() }
    }
  }) || 0;

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

  const recentExpenses = await Expense.findAll({
    where: { companyId },
    order: [["expenseDate", "DESC"]],
    limit: 10
  });

  // Chart data (Last 30 days)
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const date = moment().subtract(i, "days").format("YYYY-MM-DD");
    const dayIncome = await ContactPurchase.sum("price", {
      where: {
        companyId,
        purchaseDate: {
          [Op.gte]: moment(date).startOf("day").toDate(),
          [Op.lte]: moment(date).endOf("day").toDate()
        }
      }
    }) || 0;
    const dayExpense = await Expense.sum("value", {
      where: {
        companyId,
        expenseDate: {
          [Op.gte]: moment(date).startOf("day").toDate(),
          [Op.lte]: moment(date).endOf("day").toDate()
        }
      }
    }) || 0;
    chartData.push({ date: moment(date).format("DD/MM"), income: dayIncome, expense: dayExpense });
  }

  return res.json({
    totalIncomesWeek,
    totalIncomesMonth,
    totalIncomesYear,
    totalExpensesWeek,
    totalExpensesMonth,
    totalExpensesYear,
    topClients,
    recentExpenses,
    chartData
  });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { description, value, expenseDate, category } = req.body;

  const expense = await Expense.create({
    description,
    value,
    expenseDate,
    category,
    companyId
  });

  return res.status(200).json(expense);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { id } = req.params;

  const expense = await Expense.findOne({
    where: { id, companyId }
  });

  if (!expense) {
    return res.status(404).json({ error: "Despesa não encontrada" });
  }

  await expense.destroy();

  return res.status(200).json({ message: "Despesa excluída" });
};
