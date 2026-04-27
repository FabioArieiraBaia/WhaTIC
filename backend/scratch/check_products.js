
import Product from "../src/models/Product";
import "../src/database";

async function check() {
  try {
    const products = await Product.findAll({
      attributes: ["id", "name", "pixImageUrl", "pixCopiaCola"]
    });
    console.log("=== PRODUTOS NO BANCO ===");
    console.log(JSON.stringify(products, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

check();
