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
  MenuItem,
  Chip
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import EditIcon from "@material-ui/icons/Edit";
import api from "../../services/api";
import { toast } from "react-toastify";

const ContactServiceOrders = ({ contactId }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    productId: "",
    description: "",
    status: "PENDENTE"
  });

  const statuses = [
    { value: "PENDENTE", label: "Pendente", color: "#f44336" },
    { value: "EM_ANDAMENTO", label: "Em Andamento", color: "#2196f3" },
    { value: "REVISAO", label: "Em Revisão", color: "#ff9800" },
    { value: "CONCLUIDO", label: "Concluído", color: "#4caf50" }
  ];

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [contactId]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/contacts/${contactId}/service-orders`);
      setOrders(data);
    } catch (err) {
      toast.error("Erro ao buscar ordens de serviço");
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

  const handleSaveOrder = async () => {
    setLoading(true);
    try {
      if (editingOrder) {
        await api.put(`/contacts/service-orders/${editingOrder.id}`, {
          ...newOrder
        });
        toast.success("OS atualizada com sucesso");
      } else {
        await api.post("/contacts/service-orders", {
          ...newOrder,
          contactId
        });
        toast.success("OS aberta com sucesso");
      }
      setOpen(false);
      setEditingOrder(null);
      setNewOrder({
        productId: "",
        description: "",
        status: "PENDENTE"
      });
      fetchOrders();
    } catch (err) {
      toast.error("Erro ao salvar OS");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      await api.delete(`/contacts/service-orders/${id}`);
      toast.success("OS removida");
      fetchOrders();
    } catch (err) {
      toast.error("Erro ao remover OS");
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setNewOrder({
      productId: order.productId || "",
      description: order.description,
      status: order.status
    });
    setOpen(true);
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Typography variant="subtitle2">Ordens de Serviço</Typography>
        <IconButton size="small" color="primary" onClick={() => setOpen(true)}>
          <AddIcon />
        </IconButton>
      </div>

      <List dense>
        {orders.map((order) => (
          <ListItem key={order.id} divider alignItems="flex-start">
            <ListItemText
              primary={order.description}
              secondary={
                <>
                  <Typography variant="caption" display="block">
                    {order.product?.name || "Sem Produto"}
                  </Typography>
                  <Chip
                    size="small"
                    label={statuses.find(s => s.value === order.status)?.label}
                    style={{
                      backgroundColor: statuses.find(s => s.value === order.status)?.color,
                      color: "white",
                      fontSize: 10,
                      height: 20,
                      marginTop: 4
                    }}
                  />
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" size="small" onClick={() => handleEditOrder(order)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" size="small" onClick={() => handleDeleteOrder(order.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => { setOpen(false); setEditingOrder(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>{editingOrder ? "Editar OS" : "Abrir Nova OS"}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Produto Relacionado</InputLabel>
            <Select
              value={newOrder.productId}
              onChange={(e) => setNewOrder({ ...newOrder, productId: e.target.value })}
              label="Produto Relacionado"
            >
              <MenuItem value="">Nenhum</MenuItem>
              {products.map(prod => (
                <MenuItem key={prod.id} value={prod.id}>{prod.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="dense"
            label="Descrição do Serviço"
            variant="outlined"
            multiline
            rows={3}
            value={newOrder.description}
            onChange={(e) => setNewOrder({ ...newOrder, description: e.target.value })}
          />
          <FormControl fullWidth margin="dense" variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={newOrder.status}
              onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
              label="Status"
            >
              {statuses.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditingOrder(null); }}>Cancelar</Button>
          <Button color="primary" variant="contained" onClick={handleSaveOrder} disabled={loading || !newOrder.description}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ContactServiceOrders;
