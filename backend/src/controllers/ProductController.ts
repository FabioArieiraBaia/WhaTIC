import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import Product from "../models/Product";
import { uploadToGCS } from "../helpers/UploadToGCS";

const formatProductUrls = (product: Product) => {
  const p = product.toJSON() as any;
  const bucketName = process.env.GCS_BUCKET;
  const storageType = process.env.STORAGE_TYPE || "local";
  const gcsBaseUrl = `https://storage.googleapis.com/${bucketName}/`;

  if (storageType === "gcs" && bucketName) {
    if (p.imageUrl && !p.imageUrl.startsWith("http")) p.imageUrl = `${gcsBaseUrl}${p.imageUrl}`;
    if (p.testimonialAudioUrl && !p.testimonialAudioUrl.startsWith("http")) p.testimonialAudioUrl = `${gcsBaseUrl}${p.testimonialAudioUrl}`;
    if (p.testimonialImageUrl && !p.testimonialImageUrl.startsWith("http")) p.testimonialImageUrl = `${gcsBaseUrl}${p.testimonialImageUrl}`;
    if (p.pixImageUrl && !p.pixImageUrl.startsWith("http")) p.pixImageUrl = `${gcsBaseUrl}${p.pixImageUrl}`;
  } else if (p.imageUrl && !p.imageUrl.startsWith("http")) {
    // Fallback for local storage
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    if (p.imageUrl) p.imageUrl = `${backendUrl}/public/${p.imageUrl}`;
    if (p.testimonialAudioUrl) p.testimonialAudioUrl = `${backendUrl}/public/${p.testimonialAudioUrl}`;
    if (p.testimonialImageUrl) p.testimonialImageUrl = `${backendUrl}/public/${p.testimonialImageUrl}`;
    if (p.pixImageUrl) p.pixImageUrl = `${backendUrl}/public/${p.pixImageUrl}`;
  }
  return p;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const products = await Product.findAll({
    where: { companyId },
    order: [["name", "ASC"]]
  });

  return res.status(200).json(products.map(formatProductUrls));
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const productData = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (files) {
    if (files.image) {
      productData.imageUrl = await uploadToGCS(files.image[0]);
    }
    if (files.testimonialAudio) {
      productData.testimonialAudioUrl = await uploadToGCS(files.testimonialAudio[0]);
    }
    if (files.testimonialImage) {
      productData.testimonialImageUrl = await uploadToGCS(files.testimonialImage[0]);
    }
    if (files.pixImage) {
      productData.pixImageUrl = await uploadToGCS(files.pixImage[0]);
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
    product: formatProductUrls(product)
  });

  return res.status(200).json(formatProductUrls(product));
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

  return res.status(200).json(formatProductUrls(product));
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
      productData.imageUrl = await uploadToGCS(files.image[0]);
    }
    if (files.testimonialAudio) {
      productData.testimonialAudioUrl = await uploadToGCS(files.testimonialAudio[0]);
    }
    if (files.testimonialImage) {
      productData.testimonialImageUrl = await uploadToGCS(files.testimonialImage[0]);
    }
    if (files.pixImage) {
      productData.pixImageUrl = await uploadToGCS(files.pixImage[0]);
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

  await product.update(productData);

  const io = getIO();
  io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-product`, {
    action: "update",
    product: formatProductUrls(product)
  });

  return res.status(200).json(formatProductUrls(product));
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
