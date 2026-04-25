import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid"; 
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { i18n } from "../../translate/i18n";

import { AuthContext } from "../../context/Auth/AuthContext";
import useSettings from "../../hooks/useSettings";

const useStyles = makeStyles(theme => ({
	root: {
		width: "100vw",
		height: "100vh",
		background: theme.mode === "light" 
      ? `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`
      : `linear-gradient(135deg, #1e1e2f 0%, #10101b 100%)`,
		backgroundRepeat: "no-repeat",
		backgroundSize: "cover",
		backgroundPosition: "center",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
	},
	paper: {
		backgroundColor: theme.mode === "light" ? "rgba(255, 255, 255, 0.85)" : "rgba(30, 30, 47, 0.85)",
    backdropFilter: "blur(10px)",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		padding: "40px 30px",
		borderRadius: "16px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
	},
	avatar: {
		margin: theme.spacing(1),  
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	powered: {
		color: "white"
	},
	
	logoImg: {
    width: "100%",
    margin: "0 auto",
    content: `url("${theme.calculatedLogo()}")`
  }
	
}));

const Login = () => {
	const classes = useStyles();
  const { getPublicSetting } = useSettings();

	const [user, setUser] = useState({ email: "", password: "" });
	const [allowSignup, setAllowSignup] = useState(false);

	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = e => {
		setUser({ ...user, [e.target.name]: e.target.value.trim() });
	};

	const handlSubmit = e => {
		e.preventDefault();
		handleLogin(user);
	};

  useEffect(() => {
    getPublicSetting("allowSignup").then(
      (data) => {
        setAllowSignup(data === "enabled");
      }
    ).catch((error) => {
      console.log("Error reading setting",error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	return (
		<div className={classes.root}>
		<Container component="main" maxWidth="xs">
			<CssBaseline/>
			<div className={classes.paper}>
				<div>
					<img className={classes.logoImg} />
				</div>
				<form className={classes.form} noValidate onSubmit={handlSubmit}>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label={i18n.t("login.form.email")}
						name="email"
						value={user.email}
						onChange={handleChangeInput}
						autoComplete="email"
						autoFocus
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						name="password"
						label={i18n.t("login.form.password")}
						type="password"
						id="password"
						value={user.password}
						onChange={handleChangeInput}
						autoComplete="current-password"
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
					>
						{i18n.t("login.buttons.submit")}
					</Button>
					{ allowSignup && 
					  <Grid container>
						<Grid item>
							<Link
								href="#"
								variant="body2"
								component={RouterLink}
								to="/signup"
							>
								{i18n.t("login.buttons.register")}
							</Link>
						</Grid>
					</Grid> }
				</form>
			
			</div>
			
			
		</Container>
		</div>
	);
};

export default Login;
