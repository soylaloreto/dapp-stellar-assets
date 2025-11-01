export default function WalletConnect(){ return null; }
export default function WalletConnect(){
  const handleConnect = async () => {
    if (typeof window.freighterApi !== 'undefined' || typeof window.freighter !== 'undefined') {
      console.log('Freighter detected', window.freighter || window.freighterApi);
      alert('Freighter detectado (abre consola para más info)');
    } else {
      alert('No se detectó Freighter. Instálalo y configúralo en Testnet.');
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'flex-end', padding: '1rem'}}>
      <button
        onClick={handleConnect}
        style={{padding:'0.5rem 0.9rem', background:'#0b7285', color:'#fff', border:'none', borderRadius:6}}
      >
        Conectar Wallet
      </button>
    </div>
  );
}