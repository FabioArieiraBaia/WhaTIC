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
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import { getBackendURL } from "../../services/config";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ProductModal from "../../components/ProductModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
  if (action.type === "LOAD_PRODUCTS") {
    const products = action.payload;
    const newProducts = [];

    products.forEach((product) => {
      const productIndex = state.findIndex((u) => u.id === product.id);
      if (productIndex !== -1) {
        state[productIndex] = product;
      } else {
        newProducts.push(product);
      }
    });

    return [...state, ...newProducts];
  }

  if (action.type === "UPDATE_PRODUCTS") {
    const product = action.payload;
    const productIndex = state.findIndex((u) => u.id === product.id);

    if (productIndex !== -1) {
      state[productIndex] = product;
      return [...state];
    } else {
      return [product, ...state];
    }
  }

  if (action.type === "DELETE_PRODUCT") {
    const productId = action.payload;
    const productIndex = state.findIndex((u) => u.id === productId);
    if (productIndex !== -1) {
      state.splice(productIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const Products = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [products, dispatch] = useReducer(reducer, []);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchProducts = async () => {
        try {
          const { data } = await api.get("/products/");
          dispatch({ type: "LOAD_PRODUCTS", payload: data });
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  const handleOpenProductModal = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setProductModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success(i18n.t("Produto deletado com sucesso."));
      dispatch({ type: "DELETE_PRODUCT", payload: productId });
    } catch (err) {
      toastError(err);
    }
    setDeletingProduct(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingProduct &&
          `${i18n.t("Deletar Produto")} ${deletingProduct.name}?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteProduct(deletingProduct.id)}
      >
        {i18n.t("Tem certeza que deseja deletar este produto?")}
      </ConfirmationModal>
      <ProductModal
        open={productModalOpen}
        onClose={handleCloseProductModal}
        aria-labelledby="form-dialog-title"
        productId={selectedProduct && selectedProduct.id}
      />
      <MainHeader>
        <Title>{i18n.t("Produtos")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenProductModal}
          >
            {i18n.t("Novo Produto")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Imagem</TableCell>
              <TableCell align="center">{i18n.t("Nome")}</TableCell>
              <TableCell align="center">{i18n.t("Preço")}</TableCell>
              <TableCell align="center">{i18n.t("Link")}</TableCell>
              <TableCell align="center">{i18n.t("Ações")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell align="center">
                    {product.imageUrl ? (
                      <img src={`${getBackendURL()}/public/${product.imageUrl}`} alt={product.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                    ) : (
                      <div style={{ width: 50, height: 50, backgroundColor: '#eee', borderRadius: 4, display: 'inline-block' }}></div>
                    )}
                  </TableCell>
                  <TableCell align="center">{product.name}</TableCell>
                  <TableCell align="center">
                    {product.promotionalPrice ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 8 }}>R$ {product.price}</span>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>R$ {product.promotionalPrice}</span>
                      </>
                    ) : (
                      <span>R$ {product.price}</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer">{product.purchaseUrl}</a>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditProduct(product)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingProduct(product);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Products;
