import express from "express";
import multer from "multer";
import uploadConfig from "../config/upload";
import isAuth from "../middleware/isAuth";

import * as ProductController from "../controllers/ProductController";

const productRoutes = express.Router();
const upload = multer(uploadConfig);

productRoutes.get("/products", isAuth, ProductController.index);
productRoutes.post("/products", isAuth, upload.single("image"), ProductController.store);
productRoutes.get("/products/:id", isAuth, ProductController.show);
productRoutes.put("/products/:id", isAuth, upload.single("image"), ProductController.update);
productRoutes.delete("/products/:id", isAuth, ProductController.remove);

export default productRoutes;
