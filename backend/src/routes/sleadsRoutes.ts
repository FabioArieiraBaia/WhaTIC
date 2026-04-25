import express from "express";
import isAuth from "../middleware/isAuth";
import * as SLeadsController from "../controllers/SLeadsController";

const sleadsRoutes = express.Router();

sleadsRoutes.post("/sleads/search", isAuth, SLeadsController.search);

export default sleadsRoutes;
