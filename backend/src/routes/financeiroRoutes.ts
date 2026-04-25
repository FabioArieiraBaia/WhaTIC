import express from "express";
import isAuth from "../middleware/isAuth";
import * as FinanceiroController from "../controllers/FinanceiroController";
import isAdmin from "../middleware/isAdmin";

const financeiroRoutes = express.Router();

financeiroRoutes.get("/financeiro-gestao", isAuth, isAdmin, FinanceiroController.index);

export default financeiroRoutes;
