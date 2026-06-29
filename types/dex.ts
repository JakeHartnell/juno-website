export type DexAssetKind = 'native' | 'ibc' | 'cw20'

export interface JunoDexRuntimeConfig {
  chainId: string
  chainName: string
  rpcEndpoint: string
  restEndpoint: string
  feeDenom: string
  displayDenom: string
  nativeDenom: string
  factoryAddress: string
  routerAddress: string
  coinRegistryAddress: string
  incentivesAddress: string
  registryUrl: string
  explorerBaseUrl: string
}

export interface NativeAssetInfo {
  native_token: {
    denom: string
  }
}

export interface TokenAssetInfo {
  token: {
    contract_addr: string
  }
}

export type AssetInfo = NativeAssetInfo | TokenAssetInfo

export interface DexRegistryAsset {
  kind: DexAssetKind
  id: string
  symbol: string
  decimals: number
  logoURI?: string
  denomTrace?: string
  coingeckoId?: string
}

export interface DexPoolRegistryEntry {
  id: string
  label: string
  pair: string
  lpToken: string
  type: 'xyk'
  feeBps?: number
  assets: [DexRegistryAsset, DexRegistryAsset]
  explorer: string
  enabled: boolean
  featured?: boolean
  notes?: string
}

export interface DexRegistryV1 {
  chainId: string
  updatedAt: string
  rpcEndpoint: string
  restEndpoint: string
  factory: string
  nativeCoinRegistry?: string
  router?: string
  incentives?: string
  pools: DexPoolRegistryEntry[]
}

export interface PoolAsset {
  amount: string
  info: AssetInfo
}

export interface JunoDexPair {
  asset_infos: [AssetInfo, AssetInfo]
  contract_addr: string
  liquidity_token?: string
  pair_type?: Record<string, unknown>
}

export interface JunoDexPairsResponse {
  pairs: JunoDexPair[]
}

export interface DexPoolResponse {
  assets: [PoolAsset, PoolAsset]
  total_share: string
}

export interface DexSimulationResponse {
  return_amount: string
  spread_amount: string
  commission_amount: string
}

export interface JunoDexWalletState {
  address: string
  name: string
  chainId: string
}

export interface JunoDexSwapDraft {
  offerAssetId: string
  askAssetId: string
  amount: string
  slippageBps: number
}

export interface DexPoolView extends DexPoolRegistryEntry {
  live?: DexPoolResponse
  liveError?: string
}
