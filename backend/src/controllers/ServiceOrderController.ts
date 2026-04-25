import { Request, Response } from "express";
import ServiceOrder from "../models/ServiceOrder";
import Product from "../models/Product";
import ContactPurchase from "../models/ContactPurchase";
import AppError from "../errors/AppError";

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
  const { status, description, productId, value } = req.body;

  const order = await ServiceOrder.findOne({
    where: { id, companyId }
  });

  if (!order) {
    throw new AppError("ERR_NO_SERVICE_ORDER_FOUND", 404);
  }

  const oldStatus = order.status;
  await order.update({ status, description, productId, value });

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
