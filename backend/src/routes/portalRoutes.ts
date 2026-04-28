
import { Router } from "express";
import multer from "multer";
import * as PortalController from "../controllers/PortalController";
import uploadConfig from "../config/upload";
import isContactAuth from "../middleware/isContactAuth";

const portalRoutes = Router();
const upload = multer(uploadConfig);

portalRoutes.post("/portal/login", PortalController.login);
portalRoutes.post("/portal/request-magic-link", PortalController.requestMagicLink);
portalRoutes.post("/portal/first-access", PortalController.setInitialPassword);
portalRoutes.get("/portal/me", isContactAuth, PortalController.me);

portalRoutes.get("/portal/orders/:contactId", isContactAuth, PortalController.listOrders);
portalRoutes.post("/portal/orders/:id/approve", isContactAuth, PortalController.approveOrder);
portalRoutes.get("/portal/products/:companyId", isContactAuth, PortalController.listProducts);
portalRoutes.post("/portal/orders", isContactAuth, PortalController.createOrder);
portalRoutes.post("/portal/orders/:id/proof", isContactAuth, upload.single("file"), PortalController.uploadProof);

export default portalRoutes;
