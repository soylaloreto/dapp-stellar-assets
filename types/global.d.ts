// types/global.d.ts
export {}; // convierte el archivo en un módulo

declare global {
  interface Window {
    freighter?: any;
    freighterApi?: any;
    freighterConnect?: any;
    __ethereum_backup_for_local_dev?: any;
  }
}