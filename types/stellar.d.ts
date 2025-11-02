export interface Balance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
  limit?: string;
}

export interface Asset {
  code?: string;
  issuer?: string;
  type: string;
}

export interface AssetBalanceProps {
  accountId: string;
  asset: Asset;
  onChange?: (b: Balance[]) => void;
}
