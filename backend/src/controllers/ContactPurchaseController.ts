import { Request, Response } from "express";
import ContactPurchase from "../models/ContactPurchase";
import Product from "../models/Product";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { companyId } = req.user;

  const purchases = await ContactPurchase.findAll({
    where: { contactId, companyId },
    include: [{ model: Product, attributes: ["id", "name"] }],
    order: [["purchaseDate", "DESC"]]
  });

  return res.status(200).json(purchases);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { contactId, productId, purchaseDate, price } = req.body;

  const purchase = await ContactPurchase.create({
    contactId,
    productId,
    purchaseDate,
    price,
    companyId
  });

  const reloadPurchase = await ContactPurchase.findByPk(purchase.id, {
    include: [{ model: Product, attributes: ["id", "name"] }]
  });

  return res.status(200).json(reloadPurchase);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const purchase = await ContactPurchase.findOne({
    where: { id, companyId }
  });

  if (!purchase) {
    throw new AppError("ERR_NO_PURCHASE_FOUND", 404);
  }

  await purchase.destroy();

  return res.status(200).json({ message: "Purchase deleted" });
};
