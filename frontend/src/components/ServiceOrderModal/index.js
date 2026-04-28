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
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { ContactSelect } from "../ContactSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "100%",
  },
}));

const ServiceOrderSchema = Yup.object().shape({
  status: Yup.string().required("Obrigatório"),
  videoUrl: Yup.string().url("URL inválida").nullable(),
  finalVideoUrl: Yup.string().url("URL inválida").nullable(),
});

const ServiceOrderModal = ({ open, onClose, orderId, contactId }) => {
  const classes = useStyles();

  const initialState = {
    status: "PENDENTE",
    description: "",
    videoUrl: "",
    finalVideoUrl: "",
    value: "",
    contactId: "",
    productId: ""
  };

  const [order, setOrder] = useState(initialState);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err) {
        toastError(err);
      }
    };
    if (open) fetchProducts();
  }, [open]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const { data: allOrders } = await api.get("/service-orders");
        const found = allOrders.find(o => o.id === orderId);
        if (found) {
          const parts = (found.videoUrl || "").split("###");
          setOrder({
            ...found,
            videoUrl: parts[0] || "",
            finalVideoUrl: parts[1] || ""
          });
        }
      } catch (err) {
        toastError(err);
      }
    };

    if (open && orderId) {
        fetchOrder();
    }
  }, [orderId, open]);

  const handleClose = () => {
    onClose();
    setOrder(initialState);
  };

  const handleSaveOrder = async (values) => {
    try {
      if (orderId) {
        await api.put(`/service-orders/${orderId}`, values);
        toast.success(i18n.t("Pedido atualizado com sucesso!"));
      } else {
        const data = { ...values };
        if (contactId) data.contactId = contactId;
        
        await api.post(`/service-orders`, data);
        toast.success(i18n.t("Pedido criado com sucesso!"));
      }
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
          {orderId ? `${i18n.t("Gerenciar Pedido")} #${orderId}` : i18n.t("Novo Pedido")}
        </DialogTitle>
        <Formik
          initialValues={order}
          enableReinitialize={true}
          validationSchema={ServiceOrderSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveOrder(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                {!contactId && !orderId && (
                  <FormControl variant="outlined" className={classes.formControl} margin="dense">
                    <ContactSelect
                      label={i18n.t("Selecionar Cliente")}
                      onSelected={(id) => setFieldValue("contactId", id)}
                    />
                  </FormControl>
                )}

                <FormControl variant="outlined" className={classes.formControl} margin="dense">
                  <InputLabel>{i18n.t("Selecionar Produto")}</InputLabel>
                  <Select
                    label={i18n.t("Selecionar Produto")}
                    value={values.productId || ""}
                    onChange={(e) => {
                      const selected = products.find(p => p.id === e.target.value);
                      if (selected) {
                        setFieldValue("productId", selected.id);
                        setFieldValue("description", selected.name);
                        setFieldValue("value", selected.price);
                      }
                    }}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} - R$ {p.price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="outlined" className={classes.formControl} margin="dense">
                  <InputLabel>{i18n.t("Status")}</InputLabel>
                  <Select
                    value={values.status}
                    onChange={(e) => setFieldValue("status", e.target.value)}
                    label={i18n.t("Status")}
                  >
                    <MenuItem value="PENDENTE">Pendente</MenuItem>
                    <MenuItem value="EM_ANDAMENTO">Em Produção / Andamento</MenuItem>
                    <MenuItem value="REVISAO">Em Revisão (Cliente vê o vídeo)</MenuItem>
                    <MenuItem value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento (Cliente vê o PIX)</MenuItem>
                    <MenuItem value="EM_ANALISE">Em Análise (Conferindo Comprovante)</MenuItem>
                    <MenuItem value="PAGO">Pago (Libera Download p/ Cliente)</MenuItem>
                    <MenuItem value="CONCLUIDO">Concluído / Entregue</MenuItem>
                  </Select>
                </FormControl>

                <Field
                  as={TextField}
                  label={i18n.t("Link para Revisão (Vídeo Prévio)")}
                  name="videoUrl"
                  placeholder="https://exemplo.com/previa"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />

                <Field
                  as={TextField}
                  label={i18n.t("Link Final para Download (Google Drive)")}
                  name="finalVideoUrl"
                  placeholder="https://drive.google.com/..."
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  helperText="Este link só aparecerá para o cliente após a aprovação do pagamento."
                />

                <Field
                  as={TextField}
                  label={i18n.t("Descrição / Observações")}
                  name="description"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                  multiline
                  rows={3}
                />
                
                <Field
                  as={TextField}
                  label={i18n.t("Valor Final (R$)")}
                  name="value"
                  type="number"
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
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
                  {i18n.t("Salvar")}
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

export default ServiceOrderModal;
