import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";
import uploadConfig from "../config/upload";

import * as ContactController from "../controllers/ContactController";
import * as ImportPhoneContactsController from "../controllers/ImportPhoneContactsController";
import * as ContactPurchaseController from "../controllers/ContactPurchaseController";
import * as ServiceOrderController from "../controllers/ServiceOrderController";
import apiTokenAuth from "../middleware/apiTokenAuth";

const contactRoutes = express.Router();
const upload = multer(uploadConfig);

contactRoutes.post(
  "/contacts/import",
  isAuth,
  isAdmin,
  ImportPhoneContactsController.store
);

contactRoutes.post(
  "/contacts/importCsv",
  isAuth,
  isAdmin,
  upload.single("contacts"),
  ContactController.importCsv
);

contactRoutes.get(
  "/contacts/exportCsv",
  isAuth,
  isAdmin,
  ContactController.exportCsv
);

contactRoutes.get("/contacts", apiTokenAuth, isAuth, ContactController.index);

contactRoutes.get(
  "/contacts/list",
  apiTokenAuth,
  isAuth,
  ContactController.list
);

contactRoutes.get(
  "/contacts/:contactId",
  apiTokenAuth,
  isAuth,
  ContactController.show
);

contactRoutes.post(
  "/contacts/findOrInsert",
  apiTokenAuth,
  isAuth,
  ContactController.findOrInsertContact
);

contactRoutes.post("/contacts", apiTokenAuth, isAuth, ContactController.store);

contactRoutes.put(
  "/contacts/:contactId",
  apiTokenAuth,
  isAuth,
  ContactController.update
);

contactRoutes.delete(
  "/contacts/:contactId",
  apiTokenAuth,
  isAuth,
  ContactController.remove
);

contactRoutes.post(
  "/contacts/:contactId/tags",
  apiTokenAuth,
  isAuth,
  ContactController.storeTag
);

contactRoutes.delete(
  "/contacts/:contactId/tags/:tagId",
  apiTokenAuth,
  isAuth,
  ContactController.removeTag
);

// Purchases
contactRoutes.get("/contacts/:contactId/purchases", isAuth, ContactPurchaseController.index);
contactRoutes.post("/contacts/purchases", isAuth, ContactPurchaseController.store);
contactRoutes.delete("/contacts/purchases/:id", isAuth, ContactPurchaseController.remove);

// Service Orders
contactRoutes.get("/contacts/:contactId/service-orders", isAuth, ServiceOrderController.index);
contactRoutes.post("/contacts/service-orders", isAuth, ServiceOrderController.store);
contactRoutes.put("/contacts/service-orders/:id", isAuth, ServiceOrderController.update);
contactRoutes.delete("/contacts/service-orders/:id", isAuth, ServiceOrderController.remove);

export default contactRoutes;
