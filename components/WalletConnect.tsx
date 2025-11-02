"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    freighter?: any;
    freighterApi?: any;
    freighterConnect?: any;
  }
}

type Props = {
  // define props si aplica; deja vacío si no hay props
};

export default function WalletConnect(_: Props) {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [checking, setChecking] = useState(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Polling para detectar la API de Freighter (espera hasta timeout)
  useEffect(() => {
    let mounted = true;
    let tries = 0;
    const maxTries = 50; // ~10s (50 * 200ms)
    const interval = setInterval(() => {
      const api = window.freighterApi || window.freighter || window.freighterConnect || null;
      if (!mounted) return;
      if (api) {
        setHasFreighter(true);
        setChecking(false);
        // si la API expone getPublicKey usamos eso para rellenar publicKey
        if (typeof api.getPublicKey === "function") {
          try {
            Promise.resolve(api.getPublicKey()).then((k: any) => {
              if (mounted && k) setPublicKey(String(k));
            });
          } catch (e) {
            // ignore
          }
        }
        clearInterval(interval);
        return;
      }
      if (++tries > maxTries) {
        setHasFreighter(false);
        setChecking(false);
        clearInterval(interval);
      }
    }, 200);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Actualiza refreshKey periódicamente cuando publicKey existe
  useEffect(() => {
    if (!publicKey) return;
    const t = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(t);
  }, [publicKey]);

  const handleConnect = async () => {
    const api = window.freighterApi || window.freighter || window.freighterConnect;
    try {
      if (!api) {
        alert("Freighter no detectado. Asegúrate de que la extensión esté instalada y tenga permisos para este sitio.");
        return;
      }

      if (typeof api.connect === "function") {
        await api.connect();
        alert("Conectado via freighter.connect()");
        // intentar obtener publicKey si está disponible
        if (typeof api.getPublicKey === "function") {
          try {
            const k = await Promise.resolve(api.getPublicKey());
            setPublicKey(k ? String(k) : null);
          } catch {}
        }
        return;
      }

      // Fallbacks según métodos expuestos
      if (typeof api.getPublicKey === "function") {
        try {
          const k = await Promise.resolve(api.getPublicKey());
          setPublicKey(k ? String(k) : null);
          alert("Conectado (obtenida publicKey) via getPublicKey()");
          return;
        } catch (err) {
          console.warn("getPublicKey falló:", err);
        }
      }

      if (typeof api.request === "function") {
        try {
          const res = await api.request({ method: "connect" }).catch(() => null);
          if (res) {
            alert("Conectado via api.request()");
            // intenta extraer publicKey de la respuesta si existe
            if (res?.publicKey) setPublicKey(String(res.publicKey));
            return;
          }
        } catch (err) {
          console.warn("request(connect) falló:", err);
        }
      }

      alert("Freighter detectado pero no soporta connect() en esta versión. Actualiza la extensión o revisa la consola para detalles.");
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