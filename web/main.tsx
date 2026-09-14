import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import ResultPage from "../app/result/page";
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
  return route === "#/result" ? <ResultPage /> : <Home />;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
