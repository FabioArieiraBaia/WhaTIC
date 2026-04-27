
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton
} from "@material-ui/core";
import { ExitToApp, Refresh, AddCircleOutline } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { getBackendURL } from "../../services/config";
import "./Portal.css";

const PortalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [client, setClient] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const savedClient = localStorage.getItem("portal_client");
    if (savedClient) {
      const parsedClient = JSON.parse(savedClient);
      setClient(parsedClient);
      fetchOrders(parsedClient.id);
      fetchProducts(parsedClient.companyId);
    } else {
      history.push("/portal/login");
    }
  }, [history]);

  const fetchProducts = async (companyId) => {
    try {
      const { data } = await api.get(`/portal/products/${companyId}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (contactId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/portal/orders/${contactId}`);
      const processedOrders = data.map(order => {
        const parts = (order.videoUrl || "").split("###");
        return {
          ...order,
          videoUrl: parts[0] || "",
          finalVideoUrl: parts[1] || ""
        };
      });
      setOrders(processedOrders);
    } catch (err) {
      toast.error("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portal_client");
    history.push("/portal/login");
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
      case "PENDENTE": return "var(--warning)";
      case "EM_ANDAMENTO": return "var(--info)";
      case "REVISAO": return "var(--primary)";
      case "AGUARDANDO_PAGAMENTO": return "var(--danger)";
      case "PAGO": return "var(--success)";
      case "CONCLUIDO": return "var(--success)";
      default: return "#757575";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "REVISAO") return "EM ANÁLISE";
    return status.replace("_", " ");
  };

  const renderVideo = (url) => {
    if (!url) return null;

    const getYouTubeId = (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
      return (
        <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 16 }}>
          <iframe
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Box>
      );
    }

    return (
      <Box style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <video width="100%" controls>
          <source src={url} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      </Box>
    );
  };

  return (
    <div className="portal-container">
      <Container maxWidth="md">
        {/* Header */}
        <Box className="portal-header" display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography className="logo-text" onClick={() => history.push("/portal")} style={{ cursor: 'pointer' }}>
              WhaTIC
            </Typography>
            <Typography variant="caption" style={{ color: '#64748b', marginLeft: 10 }}>
              | Dashboard
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton style={{ color: 'white' }} onClick={() => fetchOrders(client?.id)}>
              <Refresh />
            </IconButton>
            <IconButton style={{ color: 'var(--danger)' }} onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={4} className="animate-slide-up">
          <Box>
            <Typography variant="h4" style={{ fontWeight: 800 }}>Meus Pedidos</Typography>
            <Typography variant="body1" style={{ color: 'var(--text-muted)' }}>
              Olá, <span style={{ color: 'white', fontWeight: 600 }}>{client?.name}</span>. Acompanhe suas produções abaixo.
            </Typography>
          </Box>
          <Button 
            className="premium-button" 
            startIcon={<AddCircleOutline />}
            onClick={() => setOpenModal(true)}
          >
            Novo Pedido
          </Button>
        </Box>

        <Grid container spacing={3} className="animate-slide-up">
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card className="glass-card">
                <CardContent style={{ padding: 30 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Box>
                      <Typography variant="caption" style={{ color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Protocolo <span className="order-id">#{order.id}</span>
                      </Typography>
                      <Typography variant="h5" style={{ fontWeight: 700, marginTop: 5 }}>
                        {order.product?.name || "Pedido Personalizado"}
                      </Typography>
                    </Box>
                    <Box 
                      className="status-chip" 
                      style={{ backgroundColor: getStatusColor(order.status), color: 'white', boxShadow: `0 0 15px ${getStatusColor(order.status)}44` }}
                    >
                      {getStatusLabel(order.status)}
                    </Box>
                  </Box>

                  {order.status === "REVISAO" && order.videoUrl && (
                    <Box mt={3} className="animate-slide-up">
                      <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 15 }}>
                        ✨ Seu vídeo está pronto! Assista abaixo:
                      </Typography>
                      {renderVideo(order.videoUrl)}
                      <Box mt={3} textAlign="center">
                        <Button 
                          className="premium-button" 
                          onClick={() => handleApprove(order.id)}
                          style={{ padding: '12px 60px' }}
                        >
                          Aprovar e Ir para Pagamento
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {order.status === "AGUARDANDO_PAGAMENTO" && order.product?.pixImageUrl && (
                    <Box className="pix-box animate-slide-up">
                      <Typography variant="h6" align="center" style={{ fontWeight: 700, marginBottom: 20 }}>
                        Pagamento via PIX
                      </Typography>
                      
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <img 
                          src={order.product.pixImageUrl} 
                          alt="PIX QR Code" 
                          style={{ width: 220, height: 220, borderRadius: 12, border: '5px solid white' }} 
                        />
                        
                        {order.product.pixCopiaCola && (
                          <Box width="100%" mt={3}>
                            <Typography variant="caption" style={{ color: 'var(--text-muted)' }}>Chave Copia e Cola:</Typography>
                            <code className="copy-cola">
                              {order.product.pixCopiaCola}
                            </code>
                          </Box>
                        )}

                        <Typography variant="h5" color="primary" style={{ marginTop: 20, fontWeight: 800 }}>
                          Valor: R$ {order.value || order.product.price}
                        </Typography>

                        <Box mt={4} width="100%">
                          <input
                            accept="image/*,application/pdf"
                            style={{ display: 'none' }}
                            id={`proof-upload-${order.id}`}
                            type="file"
                            onChange={(e) => handleUploadProof(order.id, e.target.files[0])}
                          />
                          <label htmlFor={`proof-upload-${order.id}`}>
                            <Button 
                              className="premium-button"
                              component="span"
                              fullWidth
                              disabled={loading}
                            >
                              {loading ? <CircularProgress size={24} color="inherit" /> : "Enviar Comprovante"}
                            </Button>
                          </label>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {(order.status === "PAGO" || order.status === "CONCLUIDO") && (
                    <Box mt={3} p={3} className="animate-slide-up" style={{ 
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                      borderRadius: 16, 
                      border: '1px solid var(--success)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h6" style={{ color: 'var(--success)', fontWeight: 700, marginBottom: 10 }}>
                        Pagamento Aprovado! ✅
                      </Typography>
                      <Typography variant="body1" style={{ color: 'white', marginBottom: 20 }}>
                        Muito obrigado por confiar em nossos serviços. Sua produção foi finalizada com sucesso!
                      </Typography>

                      {order.finalVideoUrl && (
                        <Button
                          variant="contained"
                          className="premium-button"
                          style={{ background: 'var(--success)' }}
                          href={order.finalVideoUrl}
                          target="_blank"
                          download
                          fullWidth
                        >
                          Baixar meu Vídeo Agora
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {orders.length === 0 && !loading && (
            <Box m={10} textAlign="center" width="100%">
              <Typography variant="h6" style={{ color: 'var(--text-muted)' }}>Nenhum pedido encontrado.</Typography>
              <Button color="primary" onClick={() => setOpenModal(true)} style={{ marginTop: 20 }}>
                Clique aqui para realizar seu primeiro pedido
              </Button>
            </Box>
          )}

          {loading && orders.length === 0 && (
            <Box m={10} textAlign="center" width="100%">
              <CircularProgress color="primary" />
            </Box>
          )}
        </Grid>

        <Box mt={10} textAlign="center">
          <Typography variant="caption" style={{ color: '#64748b' }}>
            © 2026 WhaTIC. Plataforma Segura.
          </Typography>
        </Box>
      </Container>

      {/* Modal Novo Pedido */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ className: 'glass-card', style: { padding: 20 } }}
      >
        <DialogTitle style={{ color: 'white', fontWeight: 800 }}>Escolha um Serviço</DialogTitle>
        <DialogContent>
          <List>
            {products.map((product) => (
              <ListItem 
                button 
                key={product.id} 
                onClick={() => handleCreateOrder(product.id)} 
                disabled={loading}
                style={{ marginBottom: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <ListItemText 
                  primary={<Typography style={{ color: 'white', fontWeight: 600 }}>{product.name}</Typography>}
                  secondary={<Typography style={{ color: '#94a3b8', fontSize: '0.8rem' }}>R$ {product.price} - {product.description}</Typography>} 
                />
              </ListItem>
            ))}
          </List>
          {products.length === 0 && <Typography variant="caption" style={{ color: 'var(--text-muted)' }}>Nenhum serviço disponível.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} style={{ color: 'var(--danger)' }}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PortalOrders;
