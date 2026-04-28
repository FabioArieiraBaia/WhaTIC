import React from "react";
import { 
  Box, 
  Typography, 
  Container,
  Button
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CodeIcon from '@material-ui/icons/Code';
import SmartphoneIcon from '@material-ui/icons/Smartphone';
import BusinessIcon from '@material-ui/icons/Business';
import WebIcon from '@material-ui/icons/Web';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import ComputerIcon from '@material-ui/icons/Computer';
import { useHistory } from "react-router-dom";
import "../pages/Portal/LandingPage.css";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: "120px 0",
    background: "#020617",
    position: "relative",
  },
  title: {
    fontWeight: 800,
    fontSize: "3rem",
    textAlign: "center",
    marginBottom: "24px",
    color: "#fff",
  },
  intro: {
    textAlign: "center",
    color: "#94a3b8",
    maxWidth: "800px",
    margin: "0 auto 80px",
    fontSize: "1.2rem",
    lineHeight: 1.6,
  },
  iconBox: {
    background: "rgba(0, 210, 255, 0.1)",
    color: "#00d2ff",
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    transition: "all 0.3s ease",
  },
  cardTitle: {
    color: "#fff",
    fontWeight: 700,
    marginBottom: "16px",
    fontSize: "1.25rem",
  },
  cardText: {
    color: "#94a3b8",
    fontSize: "1rem",
    lineHeight: 1.5,
  },
  ctaBox: {
    marginTop: "100px",
    textAlign: "center",
  },
  quoteBtn: {
    background: "linear-gradient(135deg, #00ffc3 0%, #10b981 100%)",
    color: "#020617",
    padding: "18px 48px",
    fontSize: "1.1rem",
    fontWeight: 700,
    borderRadius: "16px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 20px 40px -10px rgba(0, 255, 195, 0.4)",
    }
  }
}));

const services = [
  { 
    title: "Sites & E-commerces", 
    icon: <WebIcon />, 
    text: "Experiências web de alta performance com foco total em conversão e SEO." 
  },
  { 
    title: "Aplicativos Mobile", 
    icon: <SmartphoneIcon />, 
    text: "Soluções nativas para iOS e Android que colocam seu negócio no bolso do cliente." 
  },
  { 
    title: "Sistemas de Gestão", 
    icon: <BusinessIcon />, 
    text: "ERP e CRM personalizados para automatizar processos e escalar sua operação." 
  },
  { 
    title: "Portais de Clientes", 
    icon: <ComputerIcon />, 
    text: "Áreas logadas seguras para entrega de serviços e fidelização de usuários." 
  },
  { 
    title: "Integrações Inteligentes", 
    icon: <WhatsAppIcon />, 
    text: "Conecte seu sistema ao WhatsApp, Gateways de Pagamento e APIs globais." 
  },
  { 
    title: "Ecossistemas de IA", 
    icon: <CodeIcon />, 
    text: "Implementação de agentes inteligentes e automação generativa sob medida." 
  }
];

const ServicesDev = () => {
  const classes = useStyles();
  const history = useHistory();

  const handleAction = () => {
    history.push("/portal/login");
  };

  return (
    <Box component="section" className={`${classes.section} reveal`} id="desenvolvimento">
      <Container maxWidth="lg">
        <Typography variant="h2" className={classes.title}>
          Desenvolvimento de <span className="kinetic-text">Elite</span>
        </Typography>
        <Typography className={classes.intro}>
          Combinamos engenharia de software de ponta com as tendências mais modernas de UX/UI. 
          Criamos soluções robustas que resolvem problemas complexos.
        </Typography>

        <div className="bento-grid">
          {services.map((item, index) => (
            <div className="glass-card" key={index}>
              <Box className={classes.iconBox}>
                {item.icon}
              </Box>
              <Typography variant="h6" className={classes.cardTitle}>
                {item.title}
              </Typography>
              <Typography className={classes.cardText}>
                {item.text}
              </Typography>
            </div>
          ))}
        </div>

        <Box className={classes.ctaBox}>
          <Button className={classes.quoteBtn} onClick={handleAction}>
            Solicitar orçamento de desenvolvimento
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ServicesDev;
