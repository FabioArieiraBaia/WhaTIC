import { Request, Response } from "express";
import SearchGoogleMapsService from "../services/SLeadsService/SearchGoogleMapsService";

export const search = async (req: Request, res: Response): Promise<Response> => {
  const { query } = req.body;
  const companyId = req.user.companyId;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    // Initiate the search asynchronously so we don't block the request if it takes long
    SearchGoogleMapsService({ query, companyId });
    return res.status(200).json({ message: "Busca iniciada. Os leads serão adicionados à lista de contatos em breve." });
  } catch (error) {
    console.error("SLeads error:", error);
    return res.status(500).json({ error: "Failed to initiate search" });
  }
};
