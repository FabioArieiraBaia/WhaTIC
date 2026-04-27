
import { Router } from "express";
import multer from "multer";
import * as PortalController from "../controllers/PortalController";
import uploadConfig from "../config/upload";

const portalRoutes = Router();
const upload = multer(uploadConfig);

portalRoutes.post("/portal/login", PortalController.login);
portalRoutes.get("/portal/orders/:contactId", PortalController.listOrders);
portalRoutes.post("/portal/orders/:id/approve", PortalController.approveOrder);
portalRoutes.get("/portal/products/:companyId", PortalController.listProducts);
portalRoutes.post("/portal/orders", PortalController.createOrder);
portalRoutes.post("/portal/orders/:id/proof", upload.single("file"), PortalController.uploadProof);

export default portalRoutes;
