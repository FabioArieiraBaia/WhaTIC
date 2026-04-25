import React, { useState, useEffect, useMemo } from "react";

import "react-toastify/dist/ReactToastify.css";
import { QueryClient, QueryClientProvider } from "react-query";

import { ptBR } from "@material-ui/core/locale";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import ColorModeContext from "./layout/themeContext";
import { PhoneCallProvider } from "./context/PhoneCall/PhoneCallContext";
import { SocketContext, socketManager } from './context/Socket/SocketContext';
import useSettings from "./hooks/useSettings";
import Favicon from "react-favicon";
import { getBackendURL } from "./services/config";

import Routes from "./routes";

const queryClient = new QueryClient();
const defaultLogoLight = "/vector/logo.png";
const defaultLogoDark = "/vector/logo-dark.png";
const defaultLogoFavicon = "/vector/favicon.svg";

function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      const h = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${h}px`);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh);
      window.visualViewport.addEventListener("scroll", setVh);
    }
    window.addEventListener("resize", setVh);

    setVh(); // initial

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
        window.visualViewport.removeEventListener("scroll", setVh);
      }
      window.removeEventListener("resize", setVh);
    };
  }, []);
}

const App = () => {
  const [locale, setLocale] = useState();

  const prefersDarkMode = !!(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light");
  const [primaryColorLight, setPrimaryColorLight] = useState("#888");
  const [primaryColorDark, setPrimaryColorDark] = useState("#888");
  const [appLogoLight, setAppLogoLight] = useState("");
  const [appLogoDark, setAppLogoDark] = useState("");
  const [appLogoFavicon, setAppLogoFavicon] = useState("");
  const [appName, setAppName] = useState("");
  const { getPublicSetting } = useSettings();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      setPrimaryColorLight: (color) => {
        setPrimaryColorLight(color);
      },
      setPrimaryColorDark: (color) => {
        setPrimaryColorDark(color);
      },
      setAppLogoLight: (file) => {
        setAppLogoLight(file); 
      },
      setAppLogoDark: (file) => {
        setAppLogoDark(file); 
      },
      setAppLogoFavicon: (file) => {
        setAppLogoFavicon(file);
      },
      setAppName: (name) => {
        setAppName(name);
      }
    }),
    []
  );

  const calculatedLogoDark = () => {
    if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
      return appLogoLight;
    }
    return appLogoDark;
  };
  const calculatedLogoLight = () => {
    if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
      return appLogoDark;
    }
    return appLogoLight;
  };

  const theme = useMemo(() => createTheme(
    {
      typography: {
        fontFamily: '"Outfit", "Inter", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 12,
      },
      overrides: {
        MuiButton: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(45deg, ${mode === "light" ? primaryColorLight : primaryColorDark} 30%, ${mode === "light" ? primaryColorLight : primaryColorDark} 90%)`,
          },
        },
        MuiPaper: {
          rounded: {
            borderRadius: 16,
          },
          elevation1: {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          },
        },
        MuiDrawer: {
          paper: {
            backgroundColor: mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.8)",
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
          },
        },
        MuiAppBar: {
          root: {
            backgroundColor: mode === "light" ? "rgba(255, 255, 255, 0.7)" : "rgba(15, 23, 42, 0.7)",
            backdropFilter: 'blur(12px)',
            color: mode === "light" ? "#1e293b" : "#f8fafc",
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          },
        },
        MuiTab: {
          root: {
            borderRadius: 8,
            margin: '4px',
            minHeight: '40px',
          },
        },
      },
      scrollbarStyles: {
        "&::-webkit-scrollbar": {
          width: '8px',
          height: '8px',
        },
        "&::-webkit-scrollbar-thumb": {
          boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.3)',
          backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
        },
      },
      scrollbarStylesSoft: {
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: mode === "light" ? "#F3F3F3" : "#333333",
        },
      },
      palette: {
        type: mode,
        primary: { main: mode === "light" ? primaryColorLight : primaryColorDark },
        secondary: { main: '#f43f5e' },
        textPrimary: mode === "light" ? "#1e293b" : "#f1f5f9",
        textCommon: mode === "light" ? "#000" : "#fff",
        borderPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
        background: {
          default: mode === "light" ? "#f8fafc" : "#0f172a",
          paper: mode === "light" ? "#ffffff" : "#1e293b"
        },
        backgroundContrast: {
          default: mode === "light" ? "#f1f5f9" : "#1e293b",
          paper: mode === "light" ? "#f1f5f9" : "#1e293b",
          border: mode === "light" ? "#e2e8f0" : "#334155",
        },
        dark: { main: mode === "light" ? "#1e293b" : "#f1f5f9" },
        light: { main: mode === "light" ? "#f1f5f9" : "#1e293b" },
        chatBubbleFromMe: { main: mode === "light" ? "#6366f1" : "#4f46e5" },
        chatBubbleReceived: { main: mode === "light" ? "#ffffff" : "#334155" },
        chatBackground: { main: mode === "light" ? "#f1f5f9" : "#0f172a" },
        tabHeaderBackground: mode === "light" ? "#f1f5f9" : "#1e293b",
        optionsBackground: mode === "light" ? "#ffffff" : "#1e293b",
        options: mode === "light" ? "#ffffff" : "#1e293b",
        fontecor: mode === "light" ? primaryColorLight : primaryColorDark,
        fancyBackground: mode === "light" ? "#ffffff" : "#1e293b",
        bordabox: mode === "light" ? "#e2e8f0" : "#334155",
        newmessagebox: mode === "light" ? "#f1f5f9" : "#334155",
        inputdigita: mode === "light" ? "#ffffff" : "#1e293b",
        contactdrawer: mode === "light" ? "#ffffff" : "#1e293b",
        announcements: mode === "light" ? "#f1f5f9" : "#1e293b",
        login: mode === "light" ? "#ffffff" : "#0f172a",
        announcementspopover: mode === "light" ? "#ffffff" : "#1e293b",
        chatlist: { main: mode === "light" ? "#f1f5f9" : "#1e293b" },
        boxlist: mode === "light" ? "#f1f5f9" : "#1e293b",
        boxchatlist: mode === "light" ? "#f1f5f9" : "#1e293b",
        total: mode === "light" ? "#1e293b" : "#f1f5f9",
        messageIcons: mode === "light" ? "#64748b" : "#94a3b8",
        inputBackground: mode === "light" ? "#ffffff" : "#1e293b",
        barraSuperior: mode === "light" ? "#ffffff" : "#1e293b",
        boxticket: mode === "light" ? "#f1f5f9" : "#1e293b",
        campaigntab: mode === "light" ? "#f1f5f9" : "#1e293b",
        ticketzproad: { main: "#6366f1", contrastText: "white" }
      },
      mode,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      calculatedLogoLight,
      calculatedLogoDark,
      calculatedLogo: () => {
        if (mode === "light") {
          return calculatedLogoLight();
        }
        return calculatedLogoDark();
      }
    },
    locale
  ), [appLogoLight, appLogoDark, appLogoFavicon, appName, locale, mode, primaryColorDark, primaryColorLight]);

  useEffect(() => {
    const i18nlocale = localStorage.getItem("language");
    if (!i18nlocale) {
      return;
    }
    
    const browserLocale =
      i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    getPublicSetting("primaryColorLight")
      .then((color) => { setPrimaryColorLight(color || "#0000FF") })
      .catch((error) => { console.log("Error reading setting", error); });
    getPublicSetting("primaryColorDark")
      .then((color) => { setPrimaryColorDark(color || "#39ACE7") })
      .catch((error) => { console.log("Error reading setting", error); });
    getPublicSetting("appLogoLight")
      .then((file) => { setAppLogoLight(file ? (`${getBackendURL()}/public/${file}`) : defaultLogoLight) }, (_) => { })
      .catch((error) => { console.log("Error reading setting", error); });
    getPublicSetting("appLogoDark")
      .then((file) => { setAppLogoDark(file ? (`${getBackendURL()}/public/${file}`) : defaultLogoDark) })
      .catch((error) => { console.log("Error reading setting", error); });
    getPublicSetting("appLogoFavicon")
      .then((file) => { setAppLogoFavicon(file ? (`${getBackendURL()}/public/${file}`) : null) })
      .catch((error) => { console.log("Error reading setting", error); });
    getPublicSetting("appName").then((name) => { setAppName(name || "ticketz") })
      .catch((error) => { console.log("Error reading setting", error); setAppName("whitelabel chat") });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useViewportHeight();

  return (
    <>
    <Favicon url={ ((appLogoFavicon) ? theme.appLogoFavicon : defaultLogoFavicon ) } />
    <ColorModeContext.Provider value={{ colorMode }}>
      <PhoneCallProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <SocketContext.Provider value={socketManager}>
            <Routes />
          </SocketContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
      </PhoneCallProvider>
    </ColorModeContext.Provider>
    </>
  );
};

export default App;
