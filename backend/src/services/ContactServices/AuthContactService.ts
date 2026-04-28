import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import {
  createContactAccessToken,
  createContactRefreshToken
} from "../../helpers/CreateContactTokens";
import { SerializeContact } from "../../helpers/SerializeContact";
import Company from "../../models/Company";
import { Op } from "sequelize";

interface Response {
  serializedContact: any;
  token: string;
  refreshToken: string;
}

interface Request {
  number: string;
  password?: string;
}

const AuthContactService = async ({
  number,
  password
}: Request): Promise<Response> => {
  const cleanNumber = number.replace(/\D/g, "");

  const contact = await Contact.findOne({
    where: { 
      [Op.or]: [
        { number: cleanNumber },
        { number: { [Op.like]: `%${cleanNumber}` } }
      ]
    },
    include: [{ model: Company }]
  });

  if (!contact) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (password && !(await contact.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const token = createContactAccessToken(contact);
  const refreshToken = createContactRefreshToken(contact);

  const serializedContact = await SerializeContact(contact);

  return {
    serializedContact,
    token,
    refreshToken
  };
};

export default AuthContactService;
