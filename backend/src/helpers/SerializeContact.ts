import Contact from "../models/Contact";
import Company from "../models/Company";

interface SerializedContact {
  id: number;
  name: string;
  number: string;
  email: string;
  companyId: number;
  company: Company | null;
  profile: string;
}

export const SerializeContact = async (contact: Contact): Promise<SerializedContact> => {
  return {
    id: contact.id,
    name: contact.name,
    number: contact.number,
    email: contact.email,
    companyId: contact.companyId,
    company: contact.company,
    profile: "client"
  };
};
