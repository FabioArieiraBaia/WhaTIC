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
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Box,
  CircularProgress
} from "@material-ui/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon
} from "@material-ui/icons";
import api from "../../services/api";
import { toast } from "react-toastify";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  title: {
    fontWeight: 700,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  card: {
    padding: theme.spacing(3),
    borderRadius: 20,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "translateY(-5px)",
    },
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  },
  cardIncome: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
  },
  cardExpense: {
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    color: "#d32f2f",
  },
  cardBalance: {
    background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    color: "#1b5e20",
  },
  cardIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    fontSize: 80,
    opacity: 0.2,
    transform: 'rotate(-15deg)'
  },
  value: {
    fontSize: '1.8rem',
    fontWeight: 800,
    marginTop: theme.spacing(1)
  },
  sectionTitle: {
    fontWeight: 600,
    margin: theme.spacing(4, 0, 2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: 20,
    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.05)",
  },
  chartContainer: {
    height: 350,
    width: '100%',
    marginTop: theme.spacing(2)
  },
  addButton: {
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1, 3)
  },
  deleteButton: {
    color: theme.palette.error.main,
    "&:hover": {
      backgroundColor: theme.palette.error.light + "22",
    }
  }
}));

const FinanceiroGestao = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalIncomesWeek: 0,
    totalIncomesMonth: 0,
    totalIncomesYear: 0,
    totalExpensesWeek: 0,
    totalExpensesMonth: 0,
    totalExpensesYear: 0,
    topClients: [],
    recentExpenses: [],
    chartData: []
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: "",
    value: "",
    expenseDate: moment().format("YYYY-MM-DD"),
    category: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/financeiro-gestao");
      setData(data);
    } catch (err) {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    try {
      await api.post("/financeiro-gestao", newExpense);
      toast.success("Despesa registrada com sucesso!");
      setOpenDialog(false);
      setNewExpense({
        description: "",
        value: "",
        expenseDate: moment().format("YYYY-MM-DD"),
        category: ""
      });
      fetchData();
    } catch (err) {
      toast.error("Erro ao registrar despesa");
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/financeiro-gestao/${id}`);
      toast.success("Despesa excluída!");
      fetchData();
    } catch (err) {
      toast.error("Erro ao excluir despesa");
    }
  };

  const formatCurrency = (value) => {
    const number = typeof value === "number" ? value : parseFloat(value) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const currentBalance = (data?.totalIncomesMonth || 0) - (data?.totalExpensesMonth || 0);

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" className={classes.title}>
          <AssessmentIcon color="primary" /> Gestão Financeira Premium
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          className={classes.addButton}
          onClick={() => setOpenDialog(true)}
        >
          Nova Despesa
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} sm={4}>
          <Paper className={`${classes.card} ${classes.cardIncome}`}>
            <Typography variant="subtitle1" style={{ opacity: 0.9 }}>Entradas (Mês)</Typography>
            <Typography className={classes.value}>{formatCurrency(data?.totalIncomesMonth)}</Typography>
            <TrendingUpIcon className={classes.cardIcon} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={`${classes.card} ${classes.cardExpense}`}>
            <Typography variant="subtitle1" style={{ opacity: 0.9 }}>Saídas (Mês)</Typography>
            <Typography className={classes.value}>{formatCurrency(data?.totalExpensesMonth)}</Typography>
            <TrendingDownIcon className={classes.cardIcon} />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper className={`${classes.card} ${classes.cardBalance}`}>
            <Typography variant="subtitle1" style={{ opacity: 0.9 }}>Saldo Líquido (Mês)</Typography>
            <Typography className={classes.value}>{formatCurrency(currentBalance)}</Typography>
            <AccountBalanceIcon className={classes.cardIcon} />
          </Paper>
        </Grid>

        {/* Financial Evolution Chart */}
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Evolução Financeira (Últimos 30 Dias)
            </Typography>
            <div className={classes.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${val}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: 15, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                    name="Entradas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#f44336" 
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                    name="Saídas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        </Grid>

        {/* Bottom Tables */}
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.sectionTitle}>
              <GroupIcon /> Top 10 Clientes
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Investido</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                 {(data?.topClients || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {index < 3 ? (index === 0 ? "🥇 " : index === 1 ? "🥈 " : "🥉 ") : ""}
                      {row.contact?.name || "Desconhecido"}
                    </TableCell>
                    <TableCell align="right" style={{ fontWeight: 600, color: "#2e7d32" }}>
                      {formatCurrency(row.totalSpent)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" className={classes.sectionTitle}>
              <TrendingDownIcon /> Últimas Despesas
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                 {(data?.recentExpenses || []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.description}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {row.expenseDate ? moment(row.expenseDate).format("DD/MM/YYYY") : "Sem data"} - {row.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" style={{ color: "#d32f2f", fontWeight: 600 }}>
                      {formatCurrency(row.value)}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Excluir">
                        <IconButton 
                          size="small" 
                          className={classes.deleteButton}
                          onClick={() => handleDeleteExpense(row.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {data.recentExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">Nenhuma despesa registrada</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Expense Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ style: { borderRadius: 20, padding: 10 } }}>
        <DialogTitle style={{ fontWeight: 700 }}>Registrar Nova Despesa</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Descrição"
                fullWidth
                variant="outlined"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valor (R$)"
                type="number"
                fullWidth
                variant="outlined"
                value={newExpense.value}
                onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Data"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={newExpense.expenseDate}
                onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Categoria (ex: Aluguel, Internet, etc)"
                fullWidth
                variant="outlined"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleAddExpense} color="primary" variant="contained" className={classes.addButton}>
            Salvar Despesa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FinanceiroGestao;
