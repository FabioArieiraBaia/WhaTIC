
import React from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid,
  Avatar,
  Link
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import YouTubeIcon from '@material-ui/icons/YouTube';
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
    marginBottom: "80px",
    color: "#fff",
  },
  memberCard: {
    textAlign: "center",
    transition: "all 0.4s ease",
    "&:hover": {
      "& $avatar": {
        transform: "scale(1.1) rotate(5deg)",
        borderColor: "#00ffc3",
        boxShadow: "0 0 30px rgba(0, 255, 195, 0.4)",
      }
    }
  },
  avatar: {
    width: "220px",
    height: "220px",
    margin: "0 auto 32px",
    border: "4px solid #00d2ff",
    boxShadow: "0 0 20px rgba(0, 210, 255, 0.2)",
    transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
  memberName: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: "8px",
  },
  memberRole: {
    color: "#00ffc3",
    fontSize: "0.9rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "16px",
  },
  socialProof: {
    marginTop: "120px",
    textAlign: "center",
    padding: "60px 40px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
    borderRadius: "40px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
  },
  ytLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    color: "#FF0000",
    fontWeight: 800,
    fontSize: "2rem",
    textDecoration: "none",
    marginTop: "24px",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
      filter: "drop-shadow(0 0 10px rgba(255, 0, 0, 0.4))",
    }
  }
}));

const Team = () => {
  const classes = useStyles();

  return (
    <Box component="section" className={`${classes.section} reveal`} id="equipe">
      <Container maxWidth="lg">
        <Typography variant="h2" className={classes.title}>
          Expertise & <span className="kinetic-text">Visão</span>
        </Typography>

        <Grid container spacing={8} justifyContent="center">
          <Grid item xs={12} sm={6} md={5}>
            <Box className={classes.memberCard}>
              <Avatar className={classes.avatar} src="/team/jessica.png" alt="Jéssica Magliano Costa" />
              <Typography className={classes.memberRole}>Diretora de Criação</Typography>
              <Typography className={classes.memberName}>Jéssica Magliano Costa</Typography>
              <Typography style={{ color: '#94a3b8' }}>Especialista em narrativa visual e estética cinematográfica.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={5}>
            <Box className={classes.memberCard}>
              <Avatar className={classes.avatar} src="/team/fabio.png" alt="Fabio Arieira Baia" />
              <Typography className={classes.memberRole}>Full-Stack & IA Architect</Typography>
              <Typography className={classes.memberName}>Fabio Arieira Baia</Typography>
              <Typography style={{ color: '#94a3b8' }}>Especialista em automação inteligente e sistemas de alta escala.</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box className={classes.socialProof}>
          <Typography variant="h4" style={{ color: '#fff', marginBottom: '16px', fontWeight: 800 }}>
            Influência que gera Resultados
          </Typography>
          <Typography style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Fundadores do canal <strong>Caminhos Ilimitados</strong>, referência em tecnologia e inovação.
          </Typography>
          <Link href="https://youtube.com/c/CaminhosIlimitados" target="_blank" className={classes.ytLink}>
            <YouTubeIcon style={{ fontSize: '50px' }} />
            +710.000 Inscritos
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Team;
