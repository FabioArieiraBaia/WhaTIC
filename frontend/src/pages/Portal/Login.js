
import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Portal.css";

const PortalLogin = () => {
  const [number, setNumber] = useState("");
  const [countryCode, setCountryCode] = useState("55");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const countries = [
    { code: "55", flag: "🇧🇷", name: "Brasil" },
    { code: "1", flag: "🇺🇸", name: "EUA" },
    { code: "351", flag: "🇵🇹", name: "Portugal" },
    { code: "34", flag: "🇪🇸", name: "Espanha" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!number) {
      toast.error("Por favor, informe seu número de WhatsApp");
      return;
    }

    let cleanNumber = number.replace(/\D/g, "");
    const fullNumber = countryCode + cleanNumber;

    setLoading(true);
    try {
      const { data } = await api.post("/portal/login", { number: fullNumber });
      localStorage.setItem("portal_client", JSON.stringify(data));
      toast.success(`Bem-vindo, ${data.name}!`);
      history.push("/portal/orders");
    } catch (err) {
      toast.error("Cliente não encontrado. Verifique o número ou fale conosco.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Box className="glass-card animate-slide-up" p={5} textAlign="center">
          <div className="portal-logo-container">
            <img src="/vector/logo.png" alt="Iris Produções" className="portal-logo-img" />
          </div>
          
          <Typography variant="h5" style={{ marginBottom: 12, fontWeight: 800, letterSpacing: '-0.5px' }}>
            Portal do Cliente
          </Typography>
          <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
            Acompanhe suas produções cinematográficas e realize novos pedidos com tecnologia IA.
          </Typography>

          <form onSubmit={handleLogin}>
            <Box display="flex" alignItems="center" style={{ 
              marginBottom: 24, 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              borderRadius: 16,
              padding: '8px 20px',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.3s ease'
            }}>
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  outline: 'none',
                  marginRight: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#020617', color: 'white' }}>
                    {c.flag} +{c.code}
                  </option>
                ))}
              </select>
              <TextField
                variant="standard"
                fullWidth
                placeholder="Número com DDD"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  style: { color: 'white', fontSize: '1.05rem', fontWeight: 500 }
                }}
              />
            </Box>
            
            <Button
              className="premium-button"
              fullWidth
              type="submit"
              disabled={loading}
              style={{ height: 56, fontSize: '1.1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar agora"}
            </Button>
          </form>

          <Box mt={5}>
            <Typography variant="caption" style={{ color: '#64748b', display: 'block', marginBottom: 8 }}>
              Ainda não é cliente?
            </Typography>
            <Button 
              size="small" 
              style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'none' }}
              onClick={() => window.open("https://wa.me/5524993050256", "_blank")}
            >
              Falar com Consultor
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLogin;
