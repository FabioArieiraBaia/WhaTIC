const fs = require('fs');
const path = 'c:/xampp/htdocs/boot2/frontend/src/components/ProductModal/index.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const [product, setProduct] = useState(initialState);',
  'const [product, setProduct] = useState(initialState);\n  const [attachment, setAttachment] = useState(null);'
);

content = content.replace(
  '    purchaseUrl: "",\n    isActive: true,',
  '    purchaseUrl: "",\n    promotionalPrice: "",\n    isActive: true,'
);

const handleSaveStr = `  const handleSaveProduct = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("price", values.price);
      formData.append("promotionalPrice", values.promotionalPrice || "");
      formData.append("purchaseUrl", values.purchaseUrl || "");
      if (attachment) {
        formData.append("image", attachment);
      }

      if (productId) {
        await api.put(\`/products/\${productId}\`, formData);
      } else {
        await api.post("/products", formData);
      }
      toast.success(i18n.t("Produto salvo com sucesso!"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };`;

content = content.replace(
  /  const handleSaveProduct = async \(values\) => {[\s\S]*?handleClose\(\);\n  };/,
  handleSaveStr
);

const fieldsStr = `                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Preço")}
                    name="price"
                    type="number"
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("Preço Promocional")}
                    name="promotionalPrice"
                    type="number"
                    error={touched.promotionalPrice && Boolean(errors.promotionalPrice)}
                    helperText={touched.promotionalPrice && errors.promotionalPrice}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Link de Compra")}
                    name="purchaseUrl"
                    error={touched.purchaseUrl && Boolean(errors.purchaseUrl)}
                    helperText={touched.purchaseUrl && errors.purchaseUrl}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div style={{ marginTop: 10 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={(e) => setAttachment(e.target.files[0])}
                  />
                  <label htmlFor="raised-button-file">
                    <Button variant="contained" component="span">
                      Anexar Imagem
                    </Button>
                  </label>
                  {attachment && <span style={{ marginLeft: 10 }}>{attachment.name}</span>}
                </div>`;

content = content.replace(
  /<div className={classes\.multFieldLine}>\s*<Field\s*as={TextField}\s*label={i18n\.t\("Preço"\)}[\s\S]*?<\/div>\s*<div className={classes\.multFieldLine}>\s*<Field\s*as={TextField}\s*label={i18n\.t\("Link de Compra"\)}[\s\S]*?<\/div>/,
  fieldsStr
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated ProductModal");
