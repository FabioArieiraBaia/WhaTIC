import React, { useState, useEffect, useReducer } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import Chip from "@material-ui/core/Chip";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ServiceOrderModal from "../../components/ServiceOrderModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const getStatusColor = (status) => {
  switch (status) {
    case "PENDENTE": return "default";
    case "EM_ANDAMENTO": return "primary";
    case "REVISAO": return "secondary";
    case "AGUARDANDO_PAGAMENTO": return "secondary";
    case "PAGO": return "primary";
    case "CONCLUIDO": return "primary";
    default: return "default";
  }
};

const ServiceOrders = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/service-orders");
      setOrders(data);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.delete(`/service-orders/${orderId}`);
      toast.success(i18n.t("Pedido deletado com sucesso."));
      fetchOrders();
    } catch (err) {
      toastError(err);
    }
    setDeletingOrder(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingOrder && `Deletar Pedido #${deletingOrder.id}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteOrder(deletingOrder.id)}
      >
        {i18n.t("Tem certeza que deseja deletar este pedido?")}
      </ConfirmationModal>
      
      <ServiceOrderModal
        open={orderModalOpen}
        onClose={() => {
            setOrderModalOpen(false);
            fetchOrders();
        }}
        orderId={selectedOrder && selectedOrder.id}
      />

      <MainHeader>
        <Title>{i18n.t("Gestão de Pedidos")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setSelectedOrder(null);
              setOrderModalOpen(true);
            }}
          >
            {i18n.t("Adicionar Pedido")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Cliente</TableCell>
              <TableCell align="center">Produto</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Valor</TableCell>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell align="center">#{order.id}</TableCell>
                  <TableCell align="center">{order.contact?.name}</TableCell>
                  <TableCell align="center">{order.product?.name}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={order.status} 
                      size="small" 
                      color={getStatusColor(order.status) === "default" ? "default" : "primary"}
                      style={{ 
                          backgroundColor: getStatusColor(order.status) === "secondary" ? "#ff9800" : undefined,
                          color: getStatusColor(order.status) === "secondary" ? "white" : undefined
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">R$ {order.value}</TableCell>
                  <TableCell align="center">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditOrder(order)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingOrder(order);
                    }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={7} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default ServiceOrders;
