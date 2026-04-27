
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import { getBackendURL } from "../../services/config";

const PortalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [client, setClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedClient = localStorage.getItem("portal_client");
    if (savedClient) {
      const parsedClient = JSON.parse(savedClient);
      setClient(parsedClient);
      fetchOrders(parsedClient.id);
      fetchProducts(parsedClient.companyId);
    }
  }, []);

  const fetchProducts = async (companyId) => {
    try {
      const { data } = await api.get(`/portal/products/${companyId}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (contactId) => {
    try {
      const { data } = await api.get(`/portal/orders/${contactId}`);
      setOrders(data);
    } catch (err) {
      toast.error("Erro ao carregar pedidos.");
    }
  };

  const handleCreateOrder = async (productId) => {
    setLoading(true);
    try {
      await api.post("/portal/orders", {
        contactId: client.id,
        productId,
        companyId: client.companyId,
      });
      toast.success("Pedido realizado com sucesso!");
      setOpenModal(false);
      fetchOrders(client.id);
    } catch (err) {
      toast.error("Erro ao realizar pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await api.post(`/portal/orders/${orderId}/approve`);
      toast.success("Pedido aprovado! Siga para o pagamento.");
      fetchOrders(client.id);
    } catch (err) {
      toast.error("Erro ao aprovar pedido.");
    }
  };

  const handleUploadProof = async (orderId, file) => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/portal/orders/${orderId}/proof`, formData);
      toast.success("Comprovante enviado com sucesso! Aguarde a conferência.");
      
      fetchOrders(client.id);
    } catch (err) {
      toast.error("Erro ao enviar comprovante. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDENTE": return "#ff9800";
      case "EM_ANDAMENTO": return "#2196f3";
      case "REVISAO": return "#9c27b0";
      case "AGUARDANDO_PAGAMENTO": return "#f44336";
      case "EM_ANALISE": return "#ffeb3b";
      case "PAGO": return "#4caf50";
      case "ENTREGUE": return "primary";
      case "CONCLUIDO": return "#009688";
      default: return "#757575";
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: 40 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Meus Pedidos</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Novo Pedido
        </Button>
      </Box>

      {client && <Typography variant="subtitle1" gutterBottom>Olá, {client.name}!</Typography>}
      
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Pedido #{order.id}</Typography>
                  <Chip label={order.status} color={getStatusColor(order.status)} />
                </Box>
                <Typography color="textSecondary" gutterBottom>
                  Produto: {order.product?.name || "N/A"}
                </Typography>
                
                {order.status === "REVISAO" && order.videoUrl && (
                  <Box mt={2}>
                    <Typography variant="subtitle2">Seu vídeo está pronto para revisão:</Typography>
                    <video width="100%" controls style={{ marginTop: 10 }}>
                      <source src={order.videoUrl} type="video/mp4" />
                    </video>
                    <Box mt={2} display="flex" justifyContent="center">
                      <Button variant="contained" color="primary" onClick={() => handleApprove(order.id)}>
                        Aprovar e Pagar
                      </Button>
                    </Box>
                  </Box>
                )}

                {order.status === "AGUARDANDO_PAGAMENTO" && order.product?.pixImageUrl && (
                  <Box mt={2} textAlign="center">
                    <Typography variant="h6">Pagamento via PIX</Typography>
                    {(() => {
                      const imgUrl = `${getBackendURL()}/public/${order.product.pixImageUrl}`;
                      console.log(`[PortalDebug] Loading PIX from: ${imgUrl}`);
                      return (
                        <img 
                          src={imgUrl} 
                          alt="PIX QR Code" 
                          style={{ width: 250, height: 250, margin: "10px auto", display: "block" }} 
                        />
                      );
                    })()}
                    {order.product.pixCopiaCola && (
                      <Box mt={1}>
                        <Typography variant="body2" color="textSecondary">Copia e Cola:</Typography>
                        <code style={{ background: "#f0f0f0", padding: 5, display: "block", marginTop: 5, wordBreak: "break-all" }}>
                          {order.product.pixCopiaCola}
                        </code>
                      </Box>
                    )}
                    <Typography variant="body1" color="primary" style={{ marginTop: 15 }}>
                      Valor: R$ {order.value || order.product.price}
                    </Typography>

                    <Box mt={3}>
                      <input
                        accept="image/*,application/pdf"
                        style={{ display: 'none' }}
                        id={`proof-upload-${order.id}`}
                        type="file"
                        onChange={(e) => handleUploadProof(order.id, e.target.files[0])}
                      />
                      <label htmlFor={`proof-upload-${order.id}`}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          component="span"
                          fullWidth
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : "Confirmar Pagamento e Enviar Comprovante"}
                        </Button>
                      </label>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
        {orders.length === 0 && (
          <Box m={5} textAlign="center" width="100%">
            <Typography variant="body1">Você ainda não possui pedidos.</Typography>
          </Box>
        )}
      </Grid>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo Pedido</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Escolha o serviço desejado:</Typography>
          <List>
            {products.map((product) => (
              <ListItem button key={product.id} onClick={() => handleCreateOrder(product.id)} disabled={loading}>
                <ListItemText 
                  primary={product.name} 
                  secondary={`R$ ${product.price} - ${product.description || ""}`} 
                />
              </ListItem>
            ))}
          </List>
          {products.length === 0 && <Typography variant="caption">Nenhum serviço disponível no momento.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PortalOrders;
