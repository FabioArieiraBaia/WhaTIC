
import "./bootstrap";
import Contact from "./src/models/Contact";
import Company from "./src/models/Company";

async function check() {
  const contact = await Contact.findOne({ where: { name: "Íris Produções" } });
  if (contact) {
    console.log("Contact found:", contact.name, "CompanyId:", contact.companyId);
  } else {
    console.log("Contact not found");
  }
  process.exit();
}

check();
