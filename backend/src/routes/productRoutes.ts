import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as ProductController from "../controllers/ProductController";

const productRoutes = express.Router();
const upload = multer(uploadConfig);

productRoutes.get("/products", isAuth, ProductController.index);
productRoutes.post(
  "/products",
  isAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "testimonialAudio", maxCount: 1 },
    { name: "testimonialImage", maxCount: 1 },
    { name: "pixImage", maxCount: 1 }
  ]),
  ProductController.store
);
productRoutes.get("/products/:id", isAuth, ProductController.show);
productRoutes.put(
  "/products/:id",
  isAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "testimonialAudio", maxCount: 1 },
    { name: "testimonialImage", maxCount: 1 },
    { name: "pixImage", maxCount: 1 }
  ]),
  ProductController.update
);
productRoutes.delete("/products/:id", isAuth, ProductController.remove);

export default productRoutes;
