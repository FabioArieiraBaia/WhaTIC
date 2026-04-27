
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Box,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";

const PortalLogin = () => {
  const history = useHistory();
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/portal/login", { number });
      localStorage.setItem("portal_client", JSON.stringify(data));
      toast.success("Bem-vindo ao Portal do Cliente!");
      history.push("/portal/orders");
    } catch (err) {
      toast.error("Erro ao fazer login. Verifique seu número.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ marginTop: 100, padding: 30 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5">Portal do Cliente</Typography>
          <form style={{ width: "100%", marginTop: 20 }} onSubmit={handleLogin}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Número do WhatsApp"
              placeholder="Ex: 5511999999999"
              autoFocus
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              Entrar
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default PortalLogin;
