
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
import { ExitToApp, Refresh, AddCircleOutline, VideoLibrary } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
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
        <Box style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 20 }}>
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
      <Box style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
        <video width="100%" controls style={{ display: 'block' }}>
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
          <Box display="flex" alignItems="center" gap={2}>
            <img src="/vector/logo.png" alt="Logo" style={{ height: 40, cursor: 'pointer' }} onClick={() => history.push("/portal")} />
            <Typography variant="caption" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
              Portal de Produção
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton style={{ color: 'white' }} onClick={() => fetchOrders(client?.id)}>
              <Refresh />
            </IconButton>
            <IconButton style={{ color: 'var(--danger)' }} onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={6} className="animate-slide-up">
          <Box>
            <Typography variant="h3" style={{ fontWeight: 800, letterSpacing: '-1px', marginBottom: 8 }}>Dashboard</Typography>
            <Typography variant="body1" style={{ color: 'var(--text-muted)' }}>
              Bem-vindo, <span style={{ color: 'white', fontWeight: 800 }}>{client?.name}</span>.
            </Typography>
          </Box>
          <Button 
            className="premium-button" 
            startIcon={<AddCircleOutline />}
            onClick={() => setOpenModal(true)}
            style={{ padding: '12px 24px' }}
          >
            Novo Pedido
          </Button>
        </Box>

        <Grid container spacing={4} className="animate-slide-up">
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card className="glass-card">
                <CardContent style={{ padding: 40 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <VideoLibrary style={{ color: 'var(--primary)', fontSize: '1rem' }} />
                        <Typography variant="caption" style={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                          Projeto <span className="order-id">#{order.id}</span>
                        </Typography>
                      </Box>
                      <Typography variant="h4" style={{ fontWeight: 800, marginTop: 5, letterSpacing: '-0.5px' }}>
                        {order.product?.name || "Produção Personalizada"}
                      </Typography>
                    </Box>
                    <Box 
                      className="status-chip" 
                      style={{ 
                        backgroundColor: getStatusColor(order.status), 
                        color: 'white', 
                        boxShadow: `0 0 20px ${getStatusColor(order.status)}55` 
                      }}
                    >
                      {getStatusLabel(order.status)}
                    </Box>
                  </Box>

                  {order.description && (
                    <Typography variant="body1" style={{ color: 'var(--text-muted)', marginBottom: 30, borderLeft: '3px solid var(--primary)', paddingLeft: 15 }}>
                      {order.description}
                    </Typography>
                  )}

                  {order.status === "REVISAO" && order.videoUrl && (
                    <Box mt={4} className="animate-slide-up" p={3} style={{ background: 'rgba(0, 210, 255, 0.05)', borderRadius: 24, border: '1px solid rgba(0, 210, 255, 0.1)' }}>
                      <Typography variant="h6" style={{ fontWeight: 800, marginBottom: 20, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <span role="img" aria-label="sparkles">✨</span> Sua Prévia está Pronta!
                      </Typography>
                      {renderVideo(order.videoUrl)}
                      <Box mt={4} textAlign="center">
                        <Button 
                          className="premium-button" 
                          onClick={() => handleApprove(order.id)}
                          style={{ padding: '16px 60px', fontSize: '1.1rem' }}
                        >
                          Aprovar Projeto & Pagar
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {order.status === "AGUARDANDO_PAGAMENTO" && order.product?.pixImageUrl && (
                    <Box className="pix-box animate-slide-up">
                      <Typography variant="h5" align="center" style={{ fontWeight: 800, marginBottom: 30, color: 'var(--primary)' }}>
                        Finalizar Pagamento (PIX)
                      </Typography>
                      
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Box p={1} style={{ background: 'white', borderRadius: 20, boxShadow: '0 0 30px rgba(0, 210, 255, 0.2)' }}>
                          <img 
                            src={order.product.pixImageUrl} 
                            alt="PIX QR Code" 
                            style={{ width: 240, height: 240, borderRadius: 12, display: 'block' }} 
                          />
                        </Box>
                        
                        {order.product.pixCopiaCola && (
                          <Box width="100%" mt={4}>
                            <Typography variant="caption" style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Chave PIX Copia e Cola:</Typography>
                            <code className="copy-cola">
                              {order.product.pixCopiaCola}
                            </code>
                          </Box>
                        )}

                        <Box mt={3} p={2} textAlign="center" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, width: '100%' }}>
                          <Typography variant="h4" style={{ fontWeight: 800, color: 'var(--success)' }}>
                            R$ {order.value || order.product.price}
                          </Typography>
                        </Box>

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
                              style={{ height: 60, fontSize: '1.1rem' }}
                            >
                              {loading ? <CircularProgress size={24} color="inherit" /> : "Anexar Comprovante"}
                            </Button>
                          </label>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {(order.status === "PAGO" || order.status === "CONCLUIDO") && (
                    <Box mt={4} p={4} className="animate-slide-up" style={{ 
                      background: 'linear-gradient(135deg, rgba(0, 255, 195, 0.1) 0%, rgba(0, 210, 255, 0.1) 100%)', 
                      borderRadius: 24, 
                      border: '1px solid var(--success)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h5" style={{ color: 'var(--success)', fontWeight: 800, marginBottom: 15 }}>
                        Projeto Concluído! ✅
                      </Typography>
                      <Typography variant="body1" style={{ color: 'white', marginBottom: 30, opacity: 0.9 }}>
                        Pagamento confirmado. Sua obra de arte está pronta para o mundo!
                      </Typography>

                      {order.finalVideoUrl ? (
                        <Button
                          variant="contained"
                          className="premium-button"
                          style={{ background: 'var(--success)', height: 60, fontSize: '1.1rem' }}
                          href={order.finalVideoUrl}
                          target="_blank"
                          download
                          fullWidth
                        >
                          Baixar Arquivo Final
                        </Button>
                      ) : (
                        <Typography variant="caption" style={{ color: 'var(--text-muted)' }}>
                          Aguardando liberação do link de download pela equipe.
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}

          {orders.length === 0 && !loading && (
            <Box m={10} textAlign="center" width="100%" className="animate-slide-up">
              <Box mb={3} style={{ opacity: 0.2 }}>
                <VideoLibrary style={{ fontSize: '5rem' }} />
              </Box>
              <Typography variant="h5" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sua galeria está vazia.</Typography>
              <Typography variant="body2" style={{ color: '#64748b', marginBottom: 30 }}>Comece sua jornada cinematográfica hoje mesmo.</Typography>
              <Button className="premium-button" onClick={() => setOpenModal(true)}>
                Fazer meu primeiro pedido
              </Button>
            </Box>
          )}

          {loading && orders.length === 0 && (
            <Box m={10} textAlign="center" width="100%">
              <CircularProgress style={{ color: 'var(--primary)' }} />
            </Box>
          )}
        </Grid>

        <Box mt={12} textAlign="center" pb={5}>
          <Typography variant="caption" style={{ color: '#475569', fontWeight: 600, letterSpacing: 1 }}>
            © 2026 IRIS PRODUÇÕES. TECNOLOGIA & CINEMA.
          </Typography>
        </Box>
      </Container>

      {/* Modal Novo Pedido */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ className: 'glass-card', style: { padding: 30, background: '#0f172a' } }}
      >
        <DialogTitle style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', textAlign: 'center' }}>Novo Projeto</DialogTitle>
        <DialogContent>
          <Typography variant="body2" style={{ color: '#94a3b8', textAlign: 'center', marginBottom: 30 }}>
            Selecione o serviço desejado para iniciar a produção:
          </Typography>
          <List>
            {products.map((product) => (
              <ListItem 
                button 
                key={product.id} 
                onClick={() => handleCreateOrder(product.id)} 
                disabled={loading}
                style={{ 
                  marginBottom: 16, 
                  borderRadius: 20, 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '20px'
                }}
              >
                <ListItemText 
                  primary={<Typography style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{product.name}</Typography>}
                  secondary={
                    <Box mt={1}>
                      <Typography style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.4 }}>{product.description}</Typography>
                      <Typography style={{ color: 'var(--primary)', fontWeight: 800, marginTop: 8 }}>R$ {product.price}</Typography>
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
          {products.length === 0 && <Typography variant="caption" style={{ color: 'var(--text-muted)', display: 'block', textAlign: 'center' }}>Nenhum serviço disponível no momento.</Typography>}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', marginTop: 20 }}>
          <Button onClick={() => setOpenModal(false)} style={{ color: 'var(--danger)', fontWeight: 700 }}>Talvez mais tarde</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PortalOrders;
