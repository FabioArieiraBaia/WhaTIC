
import React from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid 
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import useSettings from "../../hooks/useSettings";
import "./Portal.css";

const PortalLanding = () => {
  const history = useHistory();
  const [appName, setAppName] = React.useState("Portal");
  const { getPublicSetting } = useSettings();

  React.useEffect(() => {
    getPublicSetting("appName").then((name) => {
      if (name) setAppName(name);
    }).catch(() => {});
  }, [getPublicSetting]);

  return (
    <div className="portal-container">
      <Container maxWidth="lg">
        {/* Header */}
        <Box className="portal-header" display="flex" justifyContent="space-between" alignItems="center">
          <Typography className="logo-text">{appName}</Typography>
          <Button 
            className="premium-button" 
            onClick={() => history.push("/portal/login")}
            style={{ padding: '8px 20px', fontSize: '0.8rem' }}
          >
            Acessar Pedidos
          </Button>
        </Box>

        {/* Hero Section */}
        <Box className="landing-hero animate-slide-up">
          <Typography className="hero-title">
            Vídeos Profissionais <br /> 
            <span style={{ color: 'var(--primary)' }}>Impulsionados por IA</span>
          </Typography>
          <Typography className="hero-subtitle">
            Transforme suas ideias em realidade com vídeos de alta qualidade. 
            Acompanhe cada etapa da produção e aprove seus resultados em tempo real.
          </Typography>
          <Box display="flex" gap={2}>
            <Button 
              className="premium-button" 
              onClick={() => history.push("/portal/login")}
              style={{ padding: '15px 40px' }}
            >
              Começar Agora
            </Button>
          </Box>
        </Box>

        {/* Features */}
        <Grid container spacing={4} style={{ marginTop: 60 }}>
          <Grid item xs={12} md={4}>
            <Box className="glass-card" p={4} textAlign="center">
              <Typography variant="h5" style={{ marginBottom: 15, fontWeight: 700 }}>Agilidade</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>
                Processo de criação otimizado para entregar seus vídeos em tempo recorde.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="glass-card" p={4} textAlign="center">
              <Typography variant="h5" style={{ marginBottom: 15, fontWeight: 700 }}>Qualidade IA</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>
                Tecnologia de ponta para garantir resultados cinematográficos em cada frame.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="glass-card" p={4} textAlign="center">
              <Typography variant="h5" style={{ marginBottom: 15, fontWeight: 700 }}>Transparência</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>
                Acompanhe o status, faça revisões e realize pagamentos de forma segura no portal.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box mt={10} textAlign="center" pb={5}>
          <Typography variant="body2" style={{ color: '#64748b' }}>
            © 2026 {appName}. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default PortalLanding;
