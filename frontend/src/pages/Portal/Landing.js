
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Hero from "../../components/Hero";
import ServicesVideos from "../../components/ServicesVideos";
import ServicesDev from "../../components/ServicesDev";
import Team from "../../components/Team";
import HowItWorks from "../../components/HowItWorks";
import Footer from "../../components/Footer";
import "./LandingPage.css";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#020617",
    minHeight: "100vh",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    color: "#fff",
    overflowX: "hidden",
    transition: "padding-top 0.3s ease",
  },
}));

const PromotionBanner = ({ onClose }) => (
  <div className="promo-banner">
    <div className="promo-text">
      <span>🚀 SUPER PROMOÇÃO: Seu primeiro vídeo de 30 segundos é GRATIS! Aproveite!!!</span>
      <span className="promo-separator">|</span>
      <span>🌐 Primeiro Site "simples" ONE PAGE GRATIS aproveite</span>
    </div>
    <IconButton className="promo-close" onClick={onClose} size="small">
      <CloseIcon style={{ color: 'white', fontSize: '1.2rem' }} />
    </IconButton>
  </div>
);

const PortalLanding = () => {
  const classes = useStyles();
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className={classes.root} style={{ paddingTop: showPromo ? '50px' : '0' }}>
      <Helmet>
        <title>Iris Produções | Vídeos Comerciais por IA & Desenvolvimento de Elite 2026</title>
        <meta name="description" content="Líderes em tecnologia visual e desenvolvimento de sistemas de alta performance. Vídeos por IA e aplicações mobile de elite." />
        <meta name="keywords" content="vídeos por ia, desenvolvimento de sistemas, iris produções, apps mobile, automação ia, 2026 tech" />
      </Helmet>

      {showPromo && <PromotionBanner onClose={() => setShowPromo(false)} />}
      <Hero />
      <ServicesVideos />
      <ServicesDev />
      <HowItWorks />
      <Team />
      <Footer />
    </div>
  );
};

export default PortalLanding;
