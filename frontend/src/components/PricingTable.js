
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    background: "rgba(30, 41, 59, 0.4)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    marginTop: "20px",
    overflow: "hidden"
  },
  table: {
    minWidth: 300,
  },
  headCell: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#00d2ff",
    fontWeight: "bold",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: "1rem"
  },
  bodyCell: {
    color: "#f8fafc",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    fontSize: "0.95rem"
  },
  priceCell: {
    color: "#00ffc3",
    fontWeight: "bold",
    fontSize: "1.1rem"
  }
}));

const PricingTable = ({ data }) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper} className={classes.tableContainer}>
      <Table className={classes.table} aria-label="pricing table">
        <TableHead>
          <TableRow>
            <TableCell className={classes.headCell}>Duração</TableCell>
            <TableCell className={classes.headCell}>Preço</TableCell>
            <TableCell className={classes.headCell}>Ideal para</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className={classes.bodyCell}>{row.duration}</TableCell>
              <TableCell className={`${classes.bodyCell} ${classes.priceCell}`}>{row.price}</TableCell>
              <TableCell className={classes.bodyCell}>{row.ideal}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PricingTable;
