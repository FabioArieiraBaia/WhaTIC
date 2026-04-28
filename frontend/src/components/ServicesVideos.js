
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import PricingTable from "./PricingTable";
import { useHistory } from "react-router-dom";
import "../pages/Portal/LandingPage.css";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: "120px 0",
    background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    position: "relative",
    overflow: "hidden",
  },
  glowBg: {
    position: "absolute",
    top: "20%",
    right: "-10%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%)",
    zIndex: 0,
  },
  title: {
    fontWeight: 800,
    fontSize: "3rem",
    textAlign: "center",
    marginBottom: "24px",
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  intro: {
    textAlign: "center",
    color: "#94a3b8",
    maxWidth: "800px",
    margin: "0 auto 80px",
    fontSize: "1.2rem",
    lineHeight: 1.6,
  },
  benefitItem: {
    marginBottom: "16px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.02)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
      borderColor: "#00ffc3",
      transform: "translateX(10px)",
    },
    "& .MuiListItemIcon-root": {
      color: "#00ffc3",
      minWidth: "48px",
    },
    "& .MuiListItemText-primary": {
      color: "#f8fafc",
      fontSize: "1.05rem",
      fontWeight: 500,
    }
  },
  ctaBox: {
    marginTop: "80px",
    textAlign: "center",
  },
  actionBtn: {
    background: "linear-gradient(135deg, #00d2ff 0%, #3b82f6 100%)",
    color: "#fff",
    padding: "18px 48px",
    fontSize: "1.1rem",
    fontWeight: 700,
    borderRadius: "50px",
    boxShadow: "0 10px 30px -5px rgba(0, 210, 255, 0.4)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
      boxShadow: "0 20px 40px -10px rgba(0, 210, 255, 0.6)",
    }
  }
}));

const pricingData = [
  { duration: "30 segundos", price: "R$ 50", ideal: "Stories, Reels, Ads rápidos" },
  { duration: "60 segundos", price: "R$ 100", ideal: "Anúncios principais" },
  { duration: "90 segundos", price: "R$ 150", ideal: "Vendas completas" },
  { duration: "120 segundos", price: "R$ 200", ideal: "Lançamentos e campanhas" },
];

const ServicesVideos = () => {
  const classes = useStyles();
  const history = useHistory();

  const handleAction = () => {
    history.push("/portal/login");
  };

  return (
    <Box component="section" className={`${classes.section} reveal`} id="videos">
      <div className={classes.glowBg} />
      <Container maxWidth="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="h2" className={classes.title}>
          Vídeos Comerciais <span style={{ color: '#00ffc3' }}>por IA</span>
        </Typography>
        <Typography className={classes.intro}>
          A tecnologia de 2026 aplicada à sua marca. Transformamos fotos estáticas em 
          produções cinematográficas de alto impacto em questão de minutos.
        </Typography>

        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} lg={7}>
            <Box className="glass-card" style={{ padding: 0 }}>
              <PricingTable data={pricingData} />
            </Box>
          </Grid>
          <Grid item xs={12} lg={5}>
            <Typography variant="h4" style={{ color: '#fff', fontWeight: 700, marginBottom: '32px' }}>
              Por que usar IA?
            </Typography>
            <List disablePadding>
              <ListItem className={classes.benefitItem}>
                <ListItemIcon><CheckCircleOutlineIcon style={{ fontSize: 28 }} /></ListItemIcon>
                <ListItemText primary="Aumento real de +30% na conversão de anúncios" />
              </ListItem>
              <ListItem className={classes.benefitItem}>
                <ListItemIcon><CheckCircleOutlineIcon style={{ fontSize: 28 }} /></ListItemIcon>
                <ListItemText primary="Custos até 90% menores que produções tradicionais" />
              </ListItem>
              <ListItem className={classes.benefitItem}>
                <ListItemIcon><CheckCircleOutlineIcon style={{ fontSize: 28 }} /></ListItemIcon>
                <ListItemText primary="Acompanhamento e entrega via Portal Exclusivo" />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        <Box className={classes.ctaBox}>
          <Button className={classes.actionBtn} onClick={handleAction}>
            Iniciar meu projeto de vídeo
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ServicesVideos;
