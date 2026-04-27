import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ProductSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Obrigatório"),
  price: Yup.number().required("Obrigatório"),
  purchaseUrl: Yup.string().url("URL inválida").nullable(),
  videoUrl: Yup.string().url("URL inválida").nullable(),
});

const ProductModal = ({ open, onClose, productId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    description: "",
    price: "",
    purchaseUrl: "",
    promotionalPrice: "",
    videoUrl: "",
    testimonials: "",
    relatedProducts: "",
    pixCopiaCola: "",
    pixImageUrl: "",
    isActive: true,
  };

  const [product, setProduct] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const [pixAttachment, setPixAttachment] = useState(null);
  const [testimonialAudio, setTestimonialAudio] = useState(null);
  const [testimonialImage, setTestimonialImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        const { data } = await api.get(`/products/${productId}`);
        setProduct(data);
      } catch (err) {
        toastError(err);
      }
    };

    fetchProduct();
  }, [productId, open]);

  const handleClose = () => {
    onClose();
    setProduct(initialState);
    setPixAttachment(null);
    setAttachment(null);
  };

  const handleSaveProduct = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("price", values.price);
      formData.append("promotionalPrice", values.promotionalPrice || "");
      formData.append("purchaseUrl", values.purchaseUrl || "");
      formData.append("videoUrl", values.videoUrl || "");
      formData.append("testimonials", values.testimonials || "");
      formData.append("relatedProducts", values.relatedProducts || "");
      formData.append("pixCopiaCola", values.pixCopiaCola || "");

      if (attachment) {
        formData.append("image", attachment);
      }
      if (pixAttachment) {
        formData.append("pixImage", pixAttachment);
      }
      if (testimonialAudio) {
        formData.append("testimonialAudio", testimonialAudio);
      }
      if (testimonialImage) {
        formData.append("testimonialImage", testimonialImage);
      }

      if (productId) {
        await api.put(`/products/${productId}`, formData);
      } else {
        await api.post("/products", formData);
      }
      toast.success(i18n.t("Produto salvo com sucesso!"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {productId
            ? i18n.t("Editar Produto")
            : i18n.t("Adicionar Produto")}
        </DialogTitle>
        <Formik
          initialValues={product}
          enableReinitialize={true}
          validationSchema={ProductSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveProduct(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Nome")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Descrição")}
                    name="description"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    multiline
                    rows={3}
                  />
                </div>
                                <div className={classes.multFieldLine}>
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
                    label={i18n.t("Link de Compra (Opcional)")}
                    name="purchaseUrl"
                    error={touched.purchaseUrl && Boolean(errors.purchaseUrl)}
                    helperText={touched.purchaseUrl && errors.purchaseUrl}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Link do Vídeo (Ex: YouTube/Vimeo)")}
                    name="videoUrl"
                    error={touched.videoUrl && Boolean(errors.videoUrl)}
                    helperText={touched.videoUrl && errors.videoUrl}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Testemunhos de Clientes")}
                    name="testimonials"
                    error={touched.testimonials && Boolean(errors.testimonials)}
                    helperText={touched.testimonials && errors.testimonials}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("Produtos Relacionados / Sugestões")}
                    name="relatedProducts"
                    error={touched.relatedProducts && Boolean(errors.relatedProducts)}
                    helperText={touched.relatedProducts && errors.relatedProducts}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </div>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("PIX Copia e Cola (Estático)")}
                    name="pixCopiaCola"
                    error={touched.pixCopiaCola && Boolean(errors.pixCopiaCola)}
                    helperText={touched.pixCopiaCola && errors.pixCopiaCola}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    multiline
                    rows={2}
                  />
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="pix-image-file"
                      type="file"
                      onChange={(e) => setPixAttachment(e.target.files[0])}
                    />
                    <label htmlFor="pix-image-file">
                      <Button variant="contained" component="span" size="small" color="secondary">
                        {pixAttachment ? "QR Code OK" : "QR Code PIX"}
                      </Button>
                    </label>
                  </div>

                  <div>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="raised-button-file"
                      type="file"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />
                    <label htmlFor="raised-button-file">
                      <Button variant="contained" component="span" size="small">
                        {attachment ? "Imagem OK" : "Imagem Produto"}
                      </Button>
                    </label>
                  </div>

                  <div>
                    <input
                      accept="audio/*"
                      style={{ display: 'none' }}
                      id="testimonial-audio-file"
                      type="file"
                      onChange={(e) => setTestimonialAudio(e.target.files[0])}
                    />
                    <label htmlFor="testimonial-audio-file">
                      <Button variant="contained" component="span" size="small" color="primary">
                        {testimonialAudio ? "Áudio OK" : "Áudio Depoimento"}
                      </Button>
                    </label>
                  </div>

                  <div>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="testimonial-image-file"
                      type="file"
                      onChange={(e) => setTestimonialImage(e.target.files[0])}
                    />
                    <label htmlFor="testimonial-image-file">
                      <Button variant="contained" component="span" size="small" color="primary">
                        {testimonialImage ? "Print Depoimento" : "Print Depoimento"}
                      </Button>
                    </label>
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("Cancelar")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {productId
                    ? i18n.t("Salvar")
                    : i18n.t("Adicionar")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ProductModal;
