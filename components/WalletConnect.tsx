"use client";
import React, { useEffect, useState } from "react";
import StellarSdk from "stellar-sdk";

export default function WalletConnect() {
  const [hasFreighter, setHasFreighter] = useState(false);
  const [checking, setChecking] = useState(true);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let tries = 0;
    const maxTries = 50;
    const t = setInterval(() => {
      const w = window as any;
      const api = w.freighterApi || w.freighter || w.freighterConnect || null;
      if (!mounted) return;
      if (api) {
        setHasFreighter(true);
        setChecking(false);
        if (typeof api.getPublicKey === "function") {
          Promise.resolve(api.getPublicKey())
            .then((k: any) => {
              if (mounted && k) setPublicKey(String(k));
            })
            .catch(() => {});
        }
        clearInterval(t);
        return;
      }
      if (++tries > maxTries) {
        setHasFreighter(false);
        setChecking(false);
        clearInterval(t);
      }
    }, 200);

    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const obtenerBalanceXLM = async (publicKey: string) => {
    try {
      const Server = (StellarSdk as any).Server ?? StellarSdk.default?.Server ?? StellarSdk;
      const server = new Server("https://horizon-testnet.stellar.org");

      const account = await server.loadAccount(publicKey);
      const xlmBalance = account.balances.find((b: { asset_type: string }) => b.asset_type === "native");
      setBalance(xlmBalance ? xlmBalance.balance : "0");
    } catch (err) {
      console.error("Error al obtener balance", err);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (publicKey) {
      obtenerBalanceXLM(publicKey);
    } else {
      setBalance(null);
    }
  }, [publicKey]);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const w = window as any;
      const api = w.freighterApi || w.freighter || w.freighterConnect || null;
      if (!api) throw new Error("Freighter no detectado");

      if (typeof api.connect === "function") {
        await api.connect();
      } else if (typeof api.getPublicKey === "function") {
        await Promise.resolve(api.getPublicKey());
      } else if (typeof api.request === "function") {
        await api.request({ method: "connect" }).catch(() => {});
      } else {
        throw new Error("Proveedor incompatible");
      }
      const k = await Promise.resolve(api.getPublicKey()).catch(() => null);
      setPublicKey(k ? String(k) : null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      console.error("Error de conexión:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setError(null);
    try {
      const w = window as any;
      const api = w.freighterApi || w.freighter || w.freighterConnect || null;
      if (api && typeof api.disconnect === "function") {
        await api.disconnect();
      }
      setPublicKey(null);
    } catch (err: any) {
      setError(err?.message ?? String(err));
      console.warn("Error al desconectar:", err);
    }
  };

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      alert('¡Dirección copiada!');
    }
  };

  const styles: {
    container: React.CSSProperties;
    card: React.CSSProperties;
    info: React.CSSProperties;
    address: React.CSSProperties;
    balance: React.CSSProperties;
    button: (isPrimary: boolean) => React.CSSProperties;
    copyButton: React.CSSProperties;
    error: React.CSSProperties;
  } = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
      padding: "2rem 1rem",
      maxWidth: 400,
      margin: "auto",
      background: "#f8fafc",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    },
    card: {
      width: "100%",
      background: "#fff",
      borderRadius: 8,
      padding: "1rem",
      boxSizing: "border-box",
      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      marginBottom: 10,
      wordBreak: "break-all",
    },
    info: {
      fontSize: 13,
      color: "#64748b",
      marginBottom: 3,
    },
    address: {
      fontFamily: "monospace",
      fontWeight: 600,
      fontSize: 14,
      color: "#0b7285",
      background: "#f1f5f9",
      padding: "6px 10px",
      borderRadius: 8,
      letterSpacing: "1px",
      marginTop: 3,
      display: "inline-block",
    },
    balance: {
      fontSize: 14,
      color: "#334155",
      marginTop: 8,
    },
    button: (isPrimary: boolean) => ({
      padding: "0.5rem 1.2rem",
      background: isPrimary ? "#6366f1" : "#94a3b8",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      minWidth: 160,
      textAlign: "center" as const,
      fontWeight: 700,
      fontSize: 14,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
      transition: "background 150ms",
      marginTop: 6,
      marginBottom: 6,
    }),
    copyButton: {
      padding: "0.3rem 0.6rem",
      background: "#0b7285",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 12,
      marginLeft: 8,
    },
    error: {
      color: "#b00020",
      fontSize: 13,
      padding: "7px 12px",
      background: "#fff0f0",
      borderRadius: 7,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {publicKey ? (
          <>
            <div style={styles.info}>Dirección de tu wallet:</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={styles.address}>{publicKey}</div>
              <button style={styles.copyButton} onClick={copyToClipboard} aria-label="Copiar dirección">
                Copiar
              </button>
            </div>
            <div style={styles.balance}>
              Balance XLM: <strong>{balance === null ? "Cargando..." : balance}</strong>
            </div>
          </>
        ) : (
          <div style={styles.info}>
            {checking ? "Buscando Freighter..." : hasFreighter ? "Freighter disponible" : "Freighter no detectado"}
          </div>
        )}
      </div>
      {publicKey ? (
        <button style={styles.button(false)} onClick={handleDisconnect} aria-label="Desconectar wallet">
          Desconectar
        </button>
      ) : (
        <button
          style={styles.button(true)}
          onClick={handleConnect}
          disabled={(!hasFreighter && checking) || isConnecting}
          aria-label="Conectar wallet"
        >
          {isConnecting ? "Conectando..." : hasFreighter ? "Conectar Wallet" : "Instalar/Activar Freighter"}
        </button>
      )}
      {error && <div style={styles.error}>Error: {error}</div>}
    </div>
  );
}
