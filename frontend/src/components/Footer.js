
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Link,
  IconButton
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import "../pages/Portal/LandingPage.css";

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: "100px 0 40px",
    background: "#020617",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  logo: {
    fontWeight: 800,
    fontSize: "1.75rem",
    color: "#fff",
    marginBottom: "24px",
    display: "block",
    letterSpacing: "-0.03em",
  },
  footerHeading: {
    color: "#fff",
    marginBottom: "32px",
    fontWeight: 700,
    fontSize: "1.1rem",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  link: {
    color: "#94a3b8",
    marginBottom: "16px",
    display: "block",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#00d2ff",
      transform: "translateX(8px)",
    }
  },
  floatingBtn: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    background: "#25D366",
    color: "#fff",
    width: "64px",
    height: "64px",
    boxShadow: "0 15px 30px rgba(37, 211, 102, 0.4), 0 0 0 0 rgba(37, 211, 102, 0.4)",
    zIndex: 1000,
    animation: "pulse-green 2s infinite",
    "&:hover": {
      background: "#128C7E",
      transform: "scale(1.1)",
    }
  },
  "@keyframes pulse-green": {
    "0%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0.7)" },
    "70%": { boxShadow: "0 0 0 20px rgba(37, 211, 102, 0)" },
    "100%": { boxShadow: "0 0 0 0 rgba(37, 211, 102, 0)" }
  }
}));

const Footer = () => {
  const classes = useStyles();

  const handleWhatsApp = () => {
    window.open("https://wa.me/5524993050256?text=Ol%C3%A1%21+Vim+pelo+site+e+gostaria+de+falar+com+um+especialista.", "_blank");
  };

  return (
    <Box component="footer" className={classes.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          <Grid item xs={12} md={5}>
            <img src="/vector/logo.png" alt="Iris Produções" className="logo-image" style={{ maxWidth: '160px' }} />
            <Typography style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '400px' }}>
              Redefinindo os limites da criação digital. Unindo tecnologia de 2026 com narrativa audiovisual de elite.
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography className={classes.footerHeading}>Navegação</Typography>
            <Link href="#videos" className={classes.link}>Vídeos IA</Link>
            <Link href="#desenvolvimento" className={classes.link}>Sistemas</Link>
            <Link href="#como-funciona" className={classes.link}>Processo</Link>
            <Link href="/portal/login" className={classes.link}>Portal Login</Link>
          </Grid>
          <Grid item xs={6} md={4}>
            <Typography className={classes.footerHeading}>Contato Direto</Typography>
            <Typography style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '24px' }}>
              Petrópolis, Rio de Janeiro - Brasil<br />
              Atendimento Digital Global
            </Typography>
            <Link href="https://wa.me/5524993050256" target="_blank" className={classes.link}>
              +55 24 99305-0256
            </Link>
          </Grid>
        </Grid>

        <Box mt={10} pt={4} borderTop="1px solid rgba(255, 255, 255, 0.05)" textAlign="center">
          <Typography style={{ color: '#475569', fontSize: '0.9rem' }}>
            © 2026 Iris Produções. A próxima geração do desenvolvimento digital.
          </Typography>
        </Box>
      </Container>

      <IconButton className={classes.floatingBtn} onClick={handleWhatsApp} aria-label="Falar no WhatsApp">
        <WhatsAppIcon style={{ fontSize: '36px' }} />
      </IconButton>
    </Box>
  );
};

export default Footer;
