
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import "../pages/Portal/LandingPage.css";

const useStyles = makeStyles((theme) => ({
  section: {
    padding: "120px 0",
    background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
    position: "relative",
  },
  title: {
    fontWeight: 800,
    fontSize: "3rem",
    textAlign: "center",
    marginBottom: "80px",
    color: "#fff",
  },
  stepContainer: {
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "40px",
      left: "0",
      width: "100%",
      height: "2px",
      background: "linear-gradient(to right, transparent, var(--neon-blue), var(--neon-green), transparent)",
      opacity: 0.2,
      [theme.breakpoints.down("sm")]: {
        display: "none",
      }
    }
  },
  stepCard: {
    textAlign: "center",
    position: "relative",
    padding: "40px 24px",
    zIndex: 1,
  },
  stepNumber: {
    width: "80px",
    height: "80px",
    background: "rgba(2, 6, 23, 0.8)",
    border: "2px solid #00d2ff",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 32px",
    color: "#00d2ff",
    fontWeight: 800,
    fontSize: "2rem",
    boxShadow: "0 0 30px rgba(0, 210, 255, 0.2)",
    transition: "all 0.4s ease",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      height: "100%",
      background: "var(--neon-blue)",
      filter: "blur(40px)",
      opacity: 0,
      transition: "opacity 0.4s ease",
      zIndex: -1,
    }
  },
  stepTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: "16px",
  },
  stepText: {
    color: "#94a3b8",
    fontSize: "1rem",
    lineHeight: 1.6,
  },
  activeStep: {
    "& $stepNumber": {
      background: "#00d2ff",
      color: "#020617",
      boxShadow: "0 0 40px rgba(0, 210, 255, 0.5)",
      "&::before": {
        opacity: 0.3,
      }
    }
  }
}));

const steps = [
  { title: "Briefing", text: "Envie sua ideia e materiais via WhatsApp ou nosso Portal." },
  { title: "Produção IA", text: "Nossa tecnologia avançada gera sua aplicação ou vídeo em tempo recorde." },
  { title: "Revisão", text: "Ajustamos cada detalhe para garantir a perfeição do seu projeto." },
  { title: "Entrega", text: "Download imediato e ativação do sistema com suporte total." }
];

const HowItWorks = () => {
  const classes = useStyles();

  return (
    <Box component="section" className={`${classes.section} reveal`} id="como-funciona">
      <Container maxWidth="lg">
        <Typography variant="h2" className={classes.title}>
          Processo em <span style={{ color: '#00d2ff' }}>4 Passos</span>
        </Typography>

        <Grid container spacing={2} className={classes.stepContainer}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Box className={`${classes.stepCard} ${index === 1 ? classes.activeStep : ""}`}>
                <Box className={classes.stepNumber}>{index + 1}</Box>
                <Typography className={classes.stepTitle}>{step.title}</Typography>
                <Typography className={classes.stepText}>{step.text}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorks;
