import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ServiceOrderController from "../controllers/ServiceOrderController";

const serviceOrderRoutes = Router();

serviceOrderRoutes.get("/service-orders", isAuth, ServiceOrderController.listAll);
serviceOrderRoutes.get("/service-orders/:contactId", isAuth, ServiceOrderController.index);
serviceOrderRoutes.post("/service-orders", isAuth, ServiceOrderController.store);
serviceOrderRoutes.put("/service-orders/:id", isAuth, ServiceOrderController.update);
serviceOrderRoutes.delete("/service-orders/:id", isAuth, ServiceOrderController.remove);

export default serviceOrderRoutes;
