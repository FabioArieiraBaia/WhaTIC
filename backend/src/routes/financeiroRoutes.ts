import express from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroController from "../controllers/FinanceiroController";
import isAdmin from "../middleware/isAdmin";

const financeiroRoutes = express.Router();

financeiroRoutes.get("/financeiro-gestao", isAuth, isAdmin, FinanceiroController.index);
financeiroRoutes.post("/financeiro-gestao", isAuth, isAdmin, FinanceiroController.store);
financeiroRoutes.delete("/financeiro-gestao/:id", isAuth, isAdmin, FinanceiroController.remove);

export default financeiroRoutes;
