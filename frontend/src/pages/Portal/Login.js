
import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress
} from "@material-ui/core";
import { WhatsApp, CheckCircle } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Portal.css";

const PortalLogin = () => {
  const [step, setStep] = useState(1); // 1: Number entry, 2: Success message
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

  const handleLoginAttempt = async (e) => {
    e.preventDefault();
    if (!number) {
      toast.error("Informe seu número de WhatsApp");
      return;
    }

    setLoading(true);
    try {
      const cleanNumber = number.replace(/\D/g, "");
      const fullNumber = countryCode + cleanNumber;
      
      // Step 1: Check contact and trigger Magic Link if needed
      const { data } = await api.post("/portal/login", { number: fullNumber });
      
      if (data.action === "SEND_MAGIC_LINK" || data.firstAccess) {
        // Trigger Magic Link automatically
        await api.post("/portal/magic-link", { number: fullNumber, companyId: 1 });
        setStep(2);
      } else if (data.token) {
        // Direct login if already authenticated or other cases
        localStorage.setItem("portal_client", JSON.stringify(data.contact));
        localStorage.setItem("token", data.token);
        history.push("/portal/orders");
      }
    } catch (err) {
      toast.error("Erro ao processar acesso. Verifique o número.");
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
          
          {step === 1 ? (
            <>
              <Typography variant="h5" style={{ marginBottom: 12, fontWeight: 800, letterSpacing: '-0.5px' }}>
                Portal do Cliente
              </Typography>
              <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
                Acompanhe suas produções cinematográficas. Digite seu WhatsApp para receber o link de acesso.
              </Typography>

              <form onSubmit={handleLoginAttempt}>
                <Box display="flex" alignItems="center" style={{ 
                  marginBottom: 24, 
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  borderRadius: 16,
                  padding: '8px 20px',
                  border: '1px solid var(--glass-border)'
                }}>
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: '1rem', outline: 'none', marginRight: 12, cursor: 'pointer' }}
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code} style={{ background: '#020617', color: 'white' }}>{c.flag} +{c.code}</option>
                    ))}
                  </select>
                  <TextField
                    variant="standard"
                    fullWidth
                    placeholder="Número com DDD"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    InputProps={{ disableUnderline: true, style: { color: 'white', fontSize: '1.05rem', fontWeight: 500 }}}
                  />
                </Box>
                
                <Button
                  className="premium-button"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  style={{ height: 56, fontSize: '1.1rem' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Receber Link de Acesso"}
                </Button>
              </form>
            </>
          ) : (
            <Box className="animate-slide-up">
              <CheckCircle style={{ fontSize: 60, color: 'var(--success)', marginBottom: 20 }} />
              <Typography variant="h5" style={{ marginBottom: 12, fontWeight: 800 }}>
                Link Enviado!
              </Typography>
              <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 30, lineHeight: 1.6 }}>
                Enviamos um link de acesso seguro para o seu WhatsApp. Clique no link para entrar no portal automaticamente.
              </Typography>
              <Button 
                onClick={() => setStep(1)}
                style={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 600 }}
              >
                Tentar outro número
              </Button>
            </Box>
          )}

          <Box mt={5}>
            <Typography variant="caption" style={{ color: '#64748b', display: 'block', marginBottom: 8 }}>
              Dúvidas? Fale com nosso suporte
            </Typography>
            <Button 
              size="small" 
              style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'none' }}
              onClick={() => window.open("https://wa.me/5524993050256", "_blank")}
            >
              Suporte Iris
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLogin;
