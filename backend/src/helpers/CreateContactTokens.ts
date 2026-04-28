import { sign } from "jsonwebtoken";
import authConfig from "../config/auth";
import Contact from "../models/Contact";

export const createContactAccessToken = (contact: Contact): string => {
  const { secret, expiresIn } = authConfig;

  return sign(
    {
      username: contact.name,
      profile: "client",
      id: contact.id,
      companyId: contact.companyId,
      contactId: contact.id
    },
    secret,
    {
      expiresIn
    }
  );
};

export const createContactRefreshToken = (contact: Contact): string => {
  const { refreshSecret, refreshExpiresIn } = authConfig;

  return sign(
    { id: contact.id, tokenVersion: contact.tokenVersion, companyId: contact.companyId, isContact: true },
    refreshSecret,
    {
      expiresIn: refreshExpiresIn
    }
  );
};
