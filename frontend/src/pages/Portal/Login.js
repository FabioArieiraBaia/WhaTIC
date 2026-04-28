
import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  CircularProgress
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import useSettings from "../../hooks/useSettings";
import "./Portal.css";

const PortalLogin = () => {
  const [number, setNumber] = useState("");
  const [countryCode, setCountryCode] = useState("55");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [appName, setAppName] = useState("Portal");
  const { getPublicSetting } = useSettings();

  React.useEffect(() => {
    getPublicSetting("appName").then((name) => {
      if (name) setAppName(name);
    }).catch(() => {});
  }, [getPublicSetting]);

  const countries = [
    { code: "55", flag: "🇧🇷", name: "Brasil" },
    { code: "1", flag: "🇺🇸", name: "EUA" },
    { code: "351", flag: "🇵🇹", name: "Portugal" },
    { code: "244", flag: "🇦🇴", name: "Angola" },
    { code: "34", flag: "🇪🇸", name: "Espanha" },
    { code: "54", flag: "🇦🇷", name: "Argentina" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!number) {
      toast.error("Por favor, informe seu número de WhatsApp");
      return;
    }

    // Clean number and prepend selected country code
    let cleanNumber = number.replace(/\D/g, "");
    const fullNumber = countryCode + cleanNumber;

    setLoading(true);
    try {
      const { data } = await api.post("/portal/login", { number: fullNumber });
      localStorage.setItem("portal_client", JSON.stringify(data));
      toast.success(`Bem-vindo, ${data.name}!`);
      history.push("/portal/orders");
    } catch (err) {
      toast.error("Cliente não encontrado. Use o número cadastrado no WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Box className="glass-card animate-slide-up" p={4} textAlign="center">
          <Typography className="logo-text" variant="h4" gutterBottom style={{ marginBottom: 30 }}>
            {appName}
          </Typography>
          <Typography variant="h6" style={{ marginBottom: 10, fontWeight: 600 }}>
            Acesso Rápido
          </Typography>
          <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 30 }}>
            Acompanhe seus pedidos de qualquer lugar do mundo
          </Typography>

          <form onSubmit={handleLogin}>
            <Box display="flex" alignItems="center" style={{ 
              marginBottom: 20, 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              borderRadius: 12,
              padding: '5px 15px',
              border: '1px solid var(--glass-border)'
            }}>
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '1rem',
                  outline: 'none',
                  marginRight: 10,
                  cursor: 'pointer'
                }}
              >
                {countries.map(c => (
                  <option key={c.code} value={c.code} style={{ background: '#1e293b', color: 'white' }}>
                    {c.flag} +{c.code}
                  </option>
                ))}
              </select>
              <TextField
                variant="standard"
                fullWidth
                placeholder="Número (com DDD)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  style: { color: 'white', fontSize: '1.1rem' }
                }}
              />
            </Box>
            
            <Button
              className="premium-button"
              fullWidth
              type="submit"
              disabled={loading}
              style={{ height: 50 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar no Portal"}
            </Button>
          </form>

          <Box mt={4}>
            <Typography variant="caption" style={{ color: '#64748b' }}>
              Dúvidas? Entre em contato pelo nosso WhatsApp oficial.
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLogin;
