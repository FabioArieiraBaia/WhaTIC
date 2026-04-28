import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const usePortalAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("portalToken");

    (async () => {
      if (token) {
        try {
          api.defaults.headers.Authorization = `Bearer ${JSON.parse(token)}`;
          const { data } = await api.get("/portal/me");
          setContact(data);
          setIsAuth(true);
        } catch (err) {
          localStorage.removeItem("portalToken");
          localStorage.removeItem("portalContact");
          api.defaults.headers.Authorization = undefined;
          setIsAuth(false);
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/portal/login", userData);
      
      if (data.firstAccess) {
        setLoading(false);
        return { firstAccess: true, contactId: data.contactId };
      }

      localStorage.setItem("portalToken", JSON.stringify(data.token));
      localStorage.setItem("portalContact", JSON.stringify(data.contact));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      
      setContact(data.contact);
      setIsAuth(true);
      setLoading(false);
      
      if (!data.resetPassword) {
        history.push("/portal/orders");
      }
      
      return { success: true, resetPassword: data.resetPassword, contactId: data.contactId };
    } catch (err) {
      toastError(err);
      setLoading(false);
      return { success: false };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portalToken");
    localStorage.removeItem("portalContact");
    
    // Limpar cookies (importante para mobile)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    api.defaults.headers.Authorization = undefined;
    setIsAuth(false);
    setContact({});
    
    // Forçar recarregamento para limpar estados residuais
    window.location.href = "/portal/login";
  };

  return {
    isAuth,
    contact,
    loading,
    handleLogin,
    handleLogout,
  };
};

export default usePortalAuth;
