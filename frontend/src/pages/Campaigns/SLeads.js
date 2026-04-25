import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import { SocketContext } from "../../context/Socket/SocketContext";
import { ContactPhone as ContactPhoneIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    height: "100%",
  },
  searchForm: {
    marginBottom: theme.spacing(2),
  },
  iframeContainer: {
    width: "100%",
    height: "60vh",
    marginTop: theme.spacing(2),
    border: "1px solid #ccc",
    borderRadius: "4px",
    overflow: "hidden",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
  },
}));

const SLeads = () => {
  const classes = useStyles();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [leads, setLeads] = useState([]);

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onSLeadsUpdate = (data) => {
      if (data.action === "update") {
        setLeads((prev) => [...prev, ...data.record]);
        setIsSearching(false);
        toast.success(`${data.record.length} leads coletados com sucesso!`);
      }
      if (data.action === "error") {
        setIsSearching(false);
        toast.error(data.message || "Erro na busca SLeads.");
      }
    };

    socket.on(`company-${companyId}-sleads`, onSLeadsUpdate);

    return () => {
      socket.off(`company-${companyId}-sleads`, onSLeadsUpdate);
    };
  }, [socketManager]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Por favor, digite um termo de busca.");
      return;
    }

    try {
      setIsSearching(true);
      
      const encodedQuery = encodeURIComponent(query);
      setMapUrl(`https://www.google.com/maps?q=${encodedQuery}&output=embed`);
      setLeads([]);

      const { data } = await api.post("/sleads/search", { query });
      toast.success(data.message || "Busca iniciada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar a busca SLeads.");
      setIsSearching(false);
    }
  };

  const handleAddToContacts = async (lead) => {
    try {
      await api.post("/contacts", {
        name: lead.name,
        number: lead.number,
        email: ""
      });
      toast.success(`Contato ${lead.name} adicionado com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error("Este contato já existe ou ocorreu um erro.");
    }
  };

  const handleAddAllToContacts = async () => {
    try {
      setIsSearching(true);
      for (const lead of leads) {
        await api.post("/contacts", {
          name: lead.name,
          number: lead.number,
          email: ""
        });
      }
      toast.success(`${leads.length} contatos adicionados com sucesso!`);
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao adicionar alguns contatos.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={2} alignItems="center" className={classes.searchForm}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Descreva os leads (ex: Corretores em São Paulo)"
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isSearching}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={isSearching}
            style={{ height: "56px" }}
          >
            {isSearching ? "Buscando..." : "Ativar IA e Buscar Leads"}
          </Button>
        </Grid>
      </Grid>

      <Typography variant="body1" gutterBottom>
        A IA realizará a extração e os leads capturados serão adicionados automaticamente ao menu "Listas de Contatos" com o nome "SLeads - {query}".
      </Typography>

    {mapUrl && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper className={classes.iframeContainer}>
            <iframe
              title="Google Maps SLeads"
              src={mapUrl}
              className={classes.iframe}
              allowFullScreen
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ marginTop: 16, marginBottom: 8 }}>
            <Typography variant="h6">
              Leads Coletados ({leads.length})
            </Typography>
            {leads.length > 0 && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={handleAddAllToContacts}
                disabled={isSearching}
              >
                Adicionar Todos
              </Button>
            )}
          </Grid>
          <Paper style={{ maxHeight: "60vh", overflow: "auto" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {isSearching ? "Buscando leads..." : "Nenhum lead coletado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>{lead.number}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Adicionar aos Contatos">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleAddToContacts(lead)}
                          >
                            <ContactPhoneIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    )}
    </div>
  );
};

export default SLeads;
