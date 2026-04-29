
import React, { useState } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress
} from "@material-ui/core";
import { WhatsApp, CheckCircle, Lock } from "@material-ui/icons";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./Portal.css";

const PortalLogin = () => {
  const [step, setStep] = useState(1); 
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
      
      const { data } = await api.post("/portal/login", { number: fullNumber });
      
      // Ajuste na lógica para bater com o Backend
      if (data.action === "SEND_MAGIC_LINK" || data.firstAccess) {
        // CORREÇÃO: Rota correta do backend
        await api.post("/portal/request-magic-link", { number: fullNumber, companyId: 1 });
        setStep(2);
      } else if (data.token) {
        // CORREÇÃO: Garantir que o token e o contato sejam salvos corretamente
        const contactData = data.contact || data.serializedContact;
        localStorage.setItem("portal_client", JSON.stringify(contactData));
        localStorage.setItem("token", JSON.stringify(data.token)); // Algumas versões do axios aqui usam JSON stringified
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
              <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 30, lineHeight: 1.6 }}>
                Digite seu número de WhatsApp abaixo para receber um <strong>link seguro</strong> de acesso instantâneo.
              </Typography>

              <form onSubmit={handleLoginAttempt}>
                <Box display="flex" alignItems="center" style={{ 
                  marginBottom: 16, 
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
                    placeholder="Seu WhatsApp"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    InputProps={{ disableUnderline: true, style: { color: 'white', fontSize: '1.05rem', fontWeight: 500 }}}
                  />
                </Box>

                <Box display="flex" alignItems="center" justifyContent="center" mb={3} style={{ color: 'var(--success)', opacity: 0.8 }}>
                  <Lock style={{ fontSize: 14, marginRight: 6 }} />
                  <Typography variant="caption" style={{ fontWeight: 600 }}>Conexão Segura e Criptografada</Typography>
                </Box>
                
                <Button
                  className="premium-button"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  startIcon={!loading && <WhatsApp />}
                  style={{ height: 60, fontSize: '1.1rem', background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar via WhatsApp"}
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
                Enviamos uma mensagem para o seu WhatsApp com o link de acesso. Verifique seu aplicativo agora.
              </Typography>
              <Button 
                onClick={() => setStep(1)}
                style={{ color: 'var(--primary)', textTransform: 'none', fontWeight: 600 }}
              >
                Tentar outro número
              </Button>
            </Box>
          )}

          <Box mt={4} pt={2} style={{ borderTop: '1px solid var(--glass-border)' }}>
            <Typography variant="caption" style={{ color: '#64748b', display: 'block', marginBottom: 8 }}>
              Ainda não é cliente?
            </Typography>
            <Button 
              size="small" 
              style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'none' }}
              onClick={() => window.open("https://wa.me/5524993050256", "_blank")}
            >
              Falar com Consultor Iris
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLogin;
