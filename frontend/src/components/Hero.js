
import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Container 
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import AssignmentIcon from '@material-ui/icons/Assignment';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { useHistory } from "react-router-dom";
import "../pages/Portal/LandingPage.css";

const useStyles = makeStyles((theme) => ({
  heroSection: {
    position: "relative",
    padding: "160px 0 100px",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#020617",
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    transform: "scale(1.1)",
    transition: "transform 10s ease-out",
    "&.active": {
      transform: "scale(1)",
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle at 50% 50%, transparent 0%, #020617 90%)",
    }
  },
  heroImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.3,
  },
  content: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
  },
  title: {
    fontWeight: 800,
    fontSize: "4.5rem",
    lineHeight: 1,
    marginBottom: "32px",
    letterSpacing: "-0.02em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "2.8rem",
    }
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#94a3b8",
    maxWidth: "700px",
    margin: "0 auto 48px",
    lineHeight: 1.6,
    animation: "fadeIn 1.2s ease-out",
  },
  ctaContainer: {
    display: "flex",
    gap: "24px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "80px",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #00d2ff 0%, #3b82f6 100%)",
    color: "#fff",
    padding: "18px 36px",
    fontSize: "1.1rem",
    fontWeight: 700,
    borderRadius: "16px",
    textTransform: "none",
    boxShadow: "0 10px 30px -5px rgba(0, 210, 255, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: "0 20px 40px -10px rgba(0, 210, 255, 0.6)",
    }
  },
  secondaryBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "#fff",
    padding: "18px 36px",
    fontSize: "1.1rem",
    fontWeight: 700,
    borderRadius: "16px",
    textTransform: "none",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.1)",
      borderColor: "#00d2ff",
    }
  },
  whatsappBtn: {
    background: "rgba(37, 211, 102, 0.1)",
    color: "#25D366",
    padding: "12px 24px",
    fontSize: "1rem",
    fontWeight: 600,
    borderRadius: "16px",
    textTransform: "none",
    border: "1px solid rgba(37, 211, 102, 0.2)",
    "&:hover": {
      background: "rgba(37, 211, 102, 0.2)",
    }
  },
  statsContainer: {
    marginTop: "40px",
  },
  statCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    padding: "24px",
    textAlign: "center",
    transition: "all 0.4s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
      borderColor: "#00ffc3",
      transform: "translateY(-5px)",
    }
  }
}));

const Hero = () => {
  const classes = useStyles();
  const history = useHistory();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
  }, []);

  const handleLogin = () => history.push("/portal/login");
  const handleWhatsApp = () => {
    window.open("https://wa.me/5524993050256?text=Ol%C3%A1%21+Vim+pelo+site+e+gostaria+de+um+or%C3%A7amento.", "_blank");
  };

  return (
    <Box component="section" className={classes.heroSection}>
      <Box className={`${classes.heroBg} ${active ? "active" : ""}`}>
        <img src="/hero-tech.png" alt="Technology and Cinema" className={classes.heroImage} />
      </Box>
      
      <Container maxWidth="lg" className={classes.content}>
        <div className="animate-fade">
          <div className="logo-container">
            <img src="/vector/logo.png" alt="Iris Produções" className="logo-image" />
          </div>
          <Typography variant="h1" className={`${classes.title} kinetic-text`}>
            A Revolução Visual <br />
            Encontra a Performance
          </Typography>
          
          <Typography className={classes.subtitle}>
            Unimos 10 anos de excelência audiovisual com o poder da Inteligência Artificial. 
            Resultados cinematográficos para o seu negócio com velocidade e tecnologia de 2026.
          </Typography>
        </div>

        <Box className={classes.ctaContainer}>
          <Button 
            className={classes.primaryBtn} 
            startIcon={<PlayCircleOutlineIcon />}
            onClick={handleLogin}
          >
            Fazer meu pedido agora
          </Button>
          <Button 
            className={classes.secondaryBtn} 
            startIcon={<AssignmentIcon />}
            onClick={handleLogin}
          >
            Acessar meus pedidos
          </Button>
          <Button 
            className={classes.whatsappBtn} 
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
          >
            Falar no WhatsApp
          </Button>
        </Box>

        <Grid container spacing={3} className={classes.statsContainer}>
          <Grid item xs={6} md={3}>
            <Box className={classes.statCard}>
              <Typography variant="h4" style={{ color: '#00ffc3', fontWeight: 800 }}>+30%</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>Conversão média</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className={classes.statCard}>
              <Typography variant="h4" style={{ color: '#00d2ff', fontWeight: 800 }}>10 min</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>Setup inicial</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className={classes.statCard}>
              <Typography variant="h4" style={{ color: '#9d50bb', fontWeight: 800 }}>8K</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>Qualidade visual</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box className={classes.statCard}>
              <Typography variant="h4" style={{ color: '#f59e0b', fontWeight: 800 }}>24/7</Typography>
              <Typography variant="body2" style={{ color: '#94a3b8' }}>Suporte IA</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
