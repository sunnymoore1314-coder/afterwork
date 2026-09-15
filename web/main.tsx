import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import ResultPage from "../app/result/page";
import ManualPage from "../app/manual/page";
import HistoryPage from "../app/history/page";
import FocusPage from "../app/focus/page";
import { LanguageProvider } from "../components/LanguageProvider";
import "../app/globals.css";

function App() {
  const [route, setRoute] = useState(window.location.hash);
  useEffect(() => {
    const navigate = () => {
      setRoute(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  return route === "#/result" ? <ResultPage /> : route === "#/manual" ? <ManualPage /> : route === "#/history" ? <HistoryPage /> : route === "#/focus" ? <FocusPage /> : <Home />;
}
createRoot(document.getElementById("root")!).render(<StrictMode><LanguageProvider><App /></LanguageProvider></StrictMode>);
