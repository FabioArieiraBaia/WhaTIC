import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Chip from "@material-ui/core/Chip";
import Typography from "@material-ui/core/Typography";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ServiceOrderModal from "../ServiceOrderModal";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: "inline",
  },
}));

const ContactServiceOrders = ({ open, onClose, contactId }) => {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  useEffect(() => {
    if (contactId) {
      fetchOrders();
    }
  }, [contactId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/service-orders/${contactId}`);
      setOrders(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleEditOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setOrderModalOpen(true);
  };

  const renderList = () => (
    <List>
      {orders.length === 0 && !loading && (
        <Typography variant="body2" style={{ padding: 10 }}>Nenhum pedido encontrado.</Typography>
      )}
      {orders.map((order) => (
        <ListItem key={order.id} alignItems="flex-start" divider>
          <ListItemText
            primary={`Pedido #${order.id}`}
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2" color="textPrimary">
                  {order.product?.name || "Produto N/A"} - R$ {order.value}
                </Typography>
                <br />
                <Chip 
                  label={order.status} 
                  size="small" 
                  variant="outlined" 
                  color={order.status === "EM_ANDAMENTO" ? "primary" : "default"}
                />
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" aria-label="edit" onClick={() => handleEditOrder(order.id)}>
              <EditIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );

  return (
    <>
      <ServiceOrderModal
        open={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          fetchOrders();
        }}
        orderId={selectedOrderId}
      />
      {open !== undefined ? (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
          <DialogTitle>Pedidos do Cliente</DialogTitle>
          <DialogContent dividers>
            {renderList()}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} color="primary">Fechar</Button>
          </DialogActions>
        </Dialog>
      ) : renderList()}
    </>
  );
};

export default ContactServiceOrders;
