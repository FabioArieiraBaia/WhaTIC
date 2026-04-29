import React, { useState, useEffect } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  IconButton,
  InputAdornment
} from "@material-ui/core";
import { Visibility, VisibilityOff, WhatsApp } from "@material-ui/icons";
import { useHistory, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import useSettings from "../../hooks/useSettings";
import usePortalAuth from "../../hooks/usePortalAuth";
import { getBackendURL } from "../../services/config";
import "./Portal.css";

const PortalLogin = () => {
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("55");
  const [mode, setMode] = useState("login"); // login, firstAccess, magicLink, confirmationPending
  const [contactId, setContactId] = useState(null);
  
  const history = useHistory();
  const location = useLocation();
  const [appName, setAppName] = useState("Iris Produções");
  const [logo, setLogo] = useState("/vector/logo-dark.png");
  const { getPublicSetting } = useSettings();
  const { handleLogin, loading: authLoading, isAuth } = usePortalAuth();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    getPublicSetting("appName").then((name) => {
      if (name) setAppName(name);
    }).catch(() => {});

    getPublicSetting("appLogoDark").then((file) => {
      if (file) setLogo(`${getBackendURL()}/public/${file}`);
    }).catch(() => {});
  }, [getPublicSetting]);

  useEffect(() => {
    // Check for token in URL (Magic Link or Confirmation)
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      // Limpa o token da URL imediatamente para não causar loop infinito
      history.replace(location.pathname);

      handleLogin({ token }).then(res => {
        if (res?.resetPassword) {
            toast.info("Acesso via link confirmado. Você pode definir uma nova senha agora.");
            setMode("firstAccess");
        }
      });
    }
  }, [location.search, handleLogin, history, location.pathname]);

  useEffect(() => {
    // Só redireciona se não estiver em primeiro acesso e estiver realmente autenticado
    if (isAuth && mode !== "firstAccess") {
      history.push("/portal/orders");
    }
  }, [isAuth, history, mode]);

  const countries = [
    { code: "55", flag: "🇧🇷", name: "Brasil" },
    { code: "1", flag: "🇺🇸", name: "EUA" },
    { code: "351", flag: "🇵🇹", name: "Portugal" },
  ];

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    
    if (!number && mode !== "firstAccess") {
      toast.error("Por favor, informe seu número de WhatsApp");
      return;
    }

    const fullNumber = countryCode + number.replace(/\D/g, "");

    if (mode === "login") {
      await handleRequestMagicLink();
      return;
    } else if (mode === "firstAccess") {
      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }

      setLocalLoading(true);
      try {
        await api.post("/portal/first-access", { contactId, password, confirmPassword });
        setMode("confirmationPending");
      } catch (err) {
        toast.error("Erro ao cadastrar senha.");
      } finally {
        setLocalLoading(false);
      }
    }
  };

  const handleRequestMagicLink = async () => {
    if (!number) {
      toast.error("Informe seu número primeiro");
      return;
    }
    const fullNumber = countryCode + number.replace(/\D/g, "");
    setLocalLoading(true);
    try {
      await api.post("/portal/request-magic-link", { number: fullNumber });
      toast.success("Link enviado para seu WhatsApp!");
      setMode("magicLinkSent");
    } catch (err) {
      if (err.response?.data?.error === "ERR_CONTACT_NOT_FOUND") {
        toast.error("Número não cadastrado. Verifique o número digitado.");
      } else if (err.response?.data?.error === "ERR_NO_WHATSAPP_FOUND") {
        toast.error("Sistema de envio indisponível. Entre em contato com o suporte.");
      } else {
        toast.error("Erro ao enviar link. Tente novamente mais tarde.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="portal-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Container maxWidth="xs">
        <Box className="glass-card animate-slide-up" p={4} textAlign="center">
          
          {logo ? (
            <img src={logo} alt={appName} style={{ maxWidth: '100%', height: 'auto', maxHeight: '80px', marginBottom: '20px', objectFit: 'contain' }} />
          ) : (
            <Typography className="logo-text" variant="h4" gutterBottom style={{ marginBottom: 30, background: 'linear-gradient(to right, #fff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>
              {appName}
            </Typography>
          )}

          <Typography variant="h6" style={{ marginBottom: 10, fontWeight: 600 }}>
            {mode === "firstAccess" ? "Primeiro Acesso" : 
             mode === "confirmationPending" ? "Verifique seu WhatsApp" :
             "Acesso ao Portal"}
          </Typography>
          
          <Typography variant="body2" style={{ color: '#94a3b8', marginBottom: 30 }}>
            {mode === "firstAccess" 
              ? "Este é seu primeiro acesso, crie sua senha abaixo." 
              : mode === "confirmationPending"
              ? "Sua senha foi salva. Enviamos um link de confirmação para seu WhatsApp para ativar sua conexão permanente."
              : "Acompanhe seus pedidos de forma segura"}
          </Typography>

          {mode !== "confirmationPending" && mode !== "magicLinkSent" && (
            <form onSubmit={handleAuth}>
              {mode !== "firstAccess" && (
                <Box display="flex" alignItems="center" className="input-glass-container">
                  <select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="country-select"
                  >
                    {countries.map(c => (
                      <option key={c.code} value={c.code} className="country-option">
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
              )}

              <Button
                className="premium-button"
                fullWidth
                type="submit"
                disabled={authLoading || localLoading}
                style={{ height: 50, marginTop: 30 }}
              >
                {authLoading || localLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "RECEBER LINK NO WHATSAPP"
                )}
              </Button>
            </form>
          )}



          {(mode === "magicLinkSent" || mode === "confirmationPending") && (
            <Box mt={2} p={2} style={{ backgroundColor: 'rgba(37, 211, 102, 0.1)', borderRadius: 12 }}>
              <Typography variant="body2" style={{ color: '#25D366' }}>
                {mode === "confirmationPending" 
                  ? "Acesse seu WhatsApp e clique no link de confirmação para liberar seu acesso."
                  : "Verifique seu WhatsApp! Enviamos um link de acesso rápido para você."}
              </Typography>
              <Button size="small" onClick={() => setMode("login")} style={{ color: 'white', marginTop: 10 }}>
                Voltar
              </Button>
            </Box>
          )}

          <Box mt={4}>
            <Typography variant="caption" style={{ color: '#64748b' }}>
              Segurança garantida por criptografia de ponta a ponta.
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLogin;
