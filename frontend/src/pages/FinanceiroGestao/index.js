import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Container,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import GroupIcon from "@material-ui/icons/Group";
import api from "../../services/api";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  card: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    borderRadius: 15,
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
    backgroundColor: theme.palette.background.paper,
  },
  tablePaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(3),
    borderRadius: 15,
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  },
  icon: {
    fontSize: 40,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  value: {
    fontWeight: "bold",
    color: theme.palette.text.primary,
  }
}));

const FinanceiroGestao = () => {
  const classes = useStyles();
  const [data, setData] = useState({
    totalWeek: 0,
    totalMonth: 0,
    totalYear: 0,
    topClients: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/financeiro-gestao");
      setData(data);
    } catch (err) {
      toast.error("Erro ao carregar dados financeiros");
    }
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h4" gutterBottom style={{ fontWeight: "bold", marginBottom: 24 }}>
        Painel Financeiro
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.card}>
            <LocalAtmIcon className={classes.icon} />
            <Typography variant="subtitle2" color="textSecondary">Esta Semana</Typography>
            <Typography variant="h5" className={classes.value}>
              R$ {data.totalWeek.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.card}>
            <LocalAtmIcon className={classes.icon} style={{ color: "#4caf50" }} />
            <Typography variant="subtitle2" color="textSecondary">Este Mês</Typography>
            <Typography variant="h5" className={classes.value}>
              R$ {data.totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.card}>
            <LocalAtmIcon className={classes.icon} style={{ color: "#2196f3" }} />
            <Typography variant="subtitle2" color="textSecondary">Este Ano</Typography>
            <Typography variant="h5" className={classes.value}>
              R$ {data.totalYear.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.tablePaper}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <GroupIcon style={{ marginRight: 8, color: "#9c27b0" }} />
              <Typography variant="h6">Clientes Mais Ativos (Ranking de Gastos)</Typography>
            </div>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell align="right">Total Investido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.topClients.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell style={{ fontWeight: index < 3 ? "bold" : "normal" }}>
                      {index === 0 && "🥇 "}
                      {index === 1 && "🥈 "}
                      {index === 2 && "🥉 "}
                      {row.contact?.name || "Desconhecido"}
                    </TableCell>
                    <TableCell>{row.contact?.number}</TableCell>
                    <TableCell align="right" style={{ fontWeight: "bold", color: "#4caf50" }}>
                      R$ {parseFloat(row.totalSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                {data.topClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">Nenhum dado disponível ainda</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FinanceiroGestao;
