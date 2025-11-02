"use client";

import { useState } from "react";
import { HORIZON_URLS } from "../lib/constants";
import Spinner from "./Spinner";

export default function CreateTrustline({ publicKey, asset }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrustline = async (): Promise<void> => {
    if (!publicKey) {
      setError("Conecta tu wallet primero");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import dinámico defensivo para que stellar-sdk no entre en el bundle SSR
      const mod = await import("stellar-sdk");
      const sdk = (mod as any).default ?? mod;
      const { Server, TransactionBuilder, Networks, Operation, Asset } = sdk;

      const server = new Server(HORIZON_URLS.testnet);
      const account = await server.loadAccount(publicKey);

      // Construye transacción mínima para crear trustline (AJUSTA según tu flow)
      const tx = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.changeTrust({
            asset: new Asset(asset.code, asset.issuer),
            limit: "1000000",
          })
        )
        .setTimeout(30)
        .build();

      // Aquí deberías pedir al usuario que firme con su wallet (Freighter u otra)
      // Placeholder: implementar firmado externo y envío a Horizon
      // Ejemplo conceptual:
      // const signedXDR = await window.freighterApi.signTransaction(tx.toXDR());
      // await server.submitTransaction(signedXDR);

      // Para demo simplemente mostramos éxito
      setLoading(false);
      alert("Trustline creada (simulación). Implementa el firmado con Freighter.");
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : String(err);
      setError(msg);
      console.error("Error creando trustline:", err);
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={createTrustline} disabled={loading || !publicKey}>
        {loading ? <Spinner /> : `Crear trustline ${asset?.code ?? ""}`}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}