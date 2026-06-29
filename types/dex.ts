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

export interface JunoDexWalletState {
  address: string
  name: string
  chainId: string
}

export interface JunoDexSwapDraft {
  offerDenom: string
  askDenom: string
  amount: string
}
