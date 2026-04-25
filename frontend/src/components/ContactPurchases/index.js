import React, { useEffect, useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import api from "../../services/api";
import { toast } from "react-toastify";
import moment from "moment";

const ContactPurchases = ({ contactId, onTotalUpdate }) => {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    productId: "",
    price: "",
    purchaseDate: moment().format("YYYY-MM-DD")
  });

  useEffect(() => {
    fetchPurchases();
    fetchProducts();
  }, [contactId]);

  const fetchPurchases = async () => {
    try {
      const { data } = await api.get(`/contacts/${contactId}/purchases`);
      setPurchases(data);
      const total = data.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
      onTotalUpdate(total);
    } catch (err) {
      toast.error("Erro ao buscar compras");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data || []);
    } catch (err) {
      toast.error("Erro ao buscar produtos");
    }
  };

  const handleAddPurchase = async () => {
    setLoading(true);
    try {
      await api.post("/contacts/purchases", {
        ...newPurchase,
        contactId
      });
      toast.success("Compra adicionada com sucesso");
      setOpen(false);
      setNewPurchase({
        productId: "",
        price: "",
        purchaseDate: moment().format("YYYY-MM-DD")
      });
      fetchPurchases();
    } catch (err) {
      toast.error("Erro ao adicionar compra");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async (id) => {
    try {
      await api.delete(`/contacts/purchases/${id}`);
      toast.success("Compra removida");
      fetchPurchases();
    } catch (err) {
      toast.error("Erro ao remover compra");
    }
  };

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    const prod = products.find(p => p.id === prodId);
    setNewPurchase({
      ...newPurchase,
      productId: prodId,
      price: prod ? prod.price : ""
    });
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Typography variant="subtitle2">Histórico de Compras</Typography>
        <IconButton size="small" color="primary" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </div>

      <List dense>
        {purchases.map((purchase) => (
          <ListItem key={purchase.id} divider>
            <ListItemText
              primary={purchase.product?.name || "Produto Removido"}
              secondary={`${moment(purchase.purchaseDate).format("DD/MM/YYYY")} - ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(purchase.price)}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small" onClick={() => handleDeletePurchase(purchase.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar Compra</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Produto</InputLabel>
            <Select
              value={newPurchase.productId}
              onChange={handleProductChange}
              label="Produto"
            >
              {products.map(prod => (
                <MenuItem key={prod.id} value={prod.id}>{prod.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="Preço"
            variant="outlined"
            type="number"
            value={newPurchase.price}
            onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Data"
            variant="outlined"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newPurchase.purchaseDate}
            onChange={(e) => setNewPurchase({ ...newPurchase, purchaseDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={handleAddPurchase} disabled={loading || !newPurchase.productId}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactPurchases;
