import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Product from "../models/Product";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const products = await Product.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return res.status(200).json(products);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const productData = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (files) {
    if (files.image) {
      productData.imageUrl = files.image[0].filename;
    }
    if (files.testimonialAudio) {
      productData.testimonialAudioUrl = files.testimonialAudio[0].filename;
    }
    if (files.testimonialImage) {
      productData.testimonialImageUrl = files.testimonialImage[0].filename;
    }
    if (files.pixImage) {
      productData.pixImageUrl = files.pixImage[0].filename;
    }
  }

  if (productData.promotionalPrice === "null" || productData.promotionalPrice === "") {
    productData.promotionalPrice = null;
  }

  const product = await Product.create({
    ...productData,
    companyId
  });

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-product`, {
    action: "create",
    product
  });

  return res.status(200).json(product);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const product = await Product.findOne({
    where: { id, companyId }
  });

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  return res.status(200).json(product);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const productData = req.body;
  const { companyId } = req.user;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (files) {
    if (files.image) {
      productData.imageUrl = files.image[0].filename;
    }
    if (files.testimonialAudio) {
      productData.testimonialAudioUrl = files.testimonialAudio[0].filename;
    }
    if (files.testimonialImage) {
      productData.testimonialImageUrl = files.testimonialImage[0].filename;
    }
    if (files.pixImage) {
      productData.pixImageUrl = files.pixImage[0].filename;
    }
  }

  if (productData.promotionalPrice === "null" || productData.promotionalPrice === "") {
    productData.promotionalPrice = null;
  }

  const product = await Product.findOne({
    where: { id, companyId }
  });

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  // Explicitly check and set PIX image URL if a file was uploaded
  if (files && files.pixImage) {
    productData.pixImageUrl = files.pixImage[0].filename;
  }

  await product.update(productData);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-product`, {
    action: "update",
    product
  });

  return res.status(200).json(product);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  const product = await Product.findOne({
    where: { id, companyId }
  });

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  await product.destroy();

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-product`, {
    action: "delete",
    productId: id
  });

  return res.status(200).json({ message: "Product deleted" });
};
