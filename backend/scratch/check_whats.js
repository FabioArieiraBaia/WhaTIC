
import Whatsapp from "../src/models/Whatsapp";
import "../src/database";

async function check() {
  try {
    const whats = await Whatsapp.findAll();
    console.log(JSON.stringify(whats, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
