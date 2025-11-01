// src/app/page.jsx

'use client';

import { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import AssetBalance from '../components/AssetBalance';
import CreateTrustline from '../components/CreateTrustline';

// Configuración del asset USDC en testnet (definido fuera del componente)
const USDC_TESTNET = {
  code: 'USDC',
  issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
};

export default function Home() {
  // Estado para guardar la public key cuando el usuario conecta
  const [publicKey, setPublicKey] = useState(null);

  // Estado para forzar refresh del balance después de crear trustline
  const [refreshKey, setRefreshKey] = useState(0);

  // Callback cuando la wallet se conecta
  const handleWalletConnect = (key) => {
    setPublicKey(key);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Wallet connected:', key);
    }
  };

  // Callback cuando la trustline se crea exitosamente
  const handleTrustlineSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  // useEffect: Refresh automático del balance cada 10 segundos solo si hay wallet conectada
  useEffect(() => {
    if (!publicKey) return undefined;

    let mounted = true;
    const intervalId = setInterval(() => {
      if (!mounted) return;
      setRefreshKey(prev => prev + 1);
    }, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [publicKey]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Assets Nativos en Stellar
          </h1>
          <p className="text-gray-600">
            Tu primera dApp de stablecoins en blockchain
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <WalletConnect onConnect={handleWalletConnect} />

          {publicKey && (
            <>
              <CreateTrustline
                asset={USDC_TESTNET}
                onSuccess={handleTrustlineSuccess}
              />

              <AssetBalance
                publicKey={publicKey}
                asset={USDC_TESTNET}
                refreshKey={refreshKey}
              />
            </>
          )}
        </div>

        <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
          <h3 className="font-bold text-lg mb-3 text-gray-800">
            📝 Instrucciones:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>
              <strong>Instala Freighter:</strong>{' '}
              <a
                href="https://www.freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://www.freighter.app
              </a>
            </li>
            <li>
              <strong>Configura Freighter en testnet</strong> Settings → Network → Testnet
            </li>
            <li>
              <strong>Obtén XLM gratis:</strong>{' '}
              <a
                href="https://laboratory.stellar.org/#account-creator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                https://laboratory.stellar.org/#account-creator
              </a>
            </li>
            <li><strong>Conecta tu wallet</strong> con el botón de arriba</li>
            <li><strong>Crea una trustline</strong> para USDC</li>
            <li><strong>Verifica tu balance</strong> (debería aparecer 0 USDC)</li>
          </ol>

          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Puedes usar{' '}
              <a
                href="https://laboratory.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stellar Laboratory
              </a>
              {' '}para enviar USDC de testnet a tu cuenta y probar que funciona.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 text-center text-sm text-gray-500">
        <p>Construido con 💙 por Tiburonas Builders</p>
        <p className="mt-2">
          Clase 7: Assets Nativos en Stellar
        </p>
      </div>
    </main>
  );
}// tmp: force update
