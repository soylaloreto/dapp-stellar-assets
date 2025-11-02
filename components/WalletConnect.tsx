"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    freighter?: any;
    freighterApi?: any;
  }
}

type Props = {
  // define props si aplica; deja vacío si no hay props
};

export default function WalletConnect(_: Props) {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    const check = () => {
      if (typeof window !== "undefined" && (window.freighter || window.freighterApi)) {
        if (mounted) setHasFreighter(true);
        return true;
      }
      return false;
    };

    if (!check()) {
      let tries = 0;
      const id = setInterval(() => {
        tries += 1;
        if (check() || tries >= 5) {
          clearInterval(id);
          if (mounted) setChecking(false);
        }
      }, 400);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    } else {
      setChecking(false);
    }
  }, []);

  const handleConnect = async () => {
    const api = window.freighterApi || window.freighter;
    try {
      if (api && typeof api.connect === "function") {
        await api.connect();
        alert("Conectado via freighter.connect()");
        return;
      }
      alert("Freighter detectado pero no soporta connect() en esta versión.");
      console.log("Freighter object:", api);
    } catch (err) {
      console.error("Error al conectar Freighter:", err);
      alert("Error al conectar Freighter: " + (err as any)?.message || String(err));
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
      <button
        onClick={handleConnect}
        disabled={!hasFreighter && checking}
        style={{
          padding: "0.5rem 0.9rem",
          background: hasFreighter ? "#0b7285" : "#94a3b8",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: hasFreighter ? "pointer" : "not-allowed",
        }}
      >
        {hasFreighter ? "Conectar Wallet" : checking ? "Buscando Freighter..." : "Instalar/Activar Freighter"}
      </button>
    </div>
  );
}