import type {
  AssetInfo,
  DexPoolRegistryEntry,
  DexPoolResponse,
  DexRegistryAsset,
  DexRegistryV1,
  DexSimulationResponse,
  JunoDexPair,
  JunoDexPairsResponse,
  JunoDexRuntimeConfig,
  JunoDexSwapDraft,
  JunoDexWalletState,
  NativeAssetInfo,
  TokenAssetInfo
} from '@/types/dex'

interface KeplrLike {
  enable: (chainId: string) => Promise<void>
  experimentalSuggestChain?: (chainInfo: Record<string, unknown>) => Promise<void>
  getKey: (chainId: string) => Promise<{ bech32Address: string, name: string }>
}

interface CosmWasmRestSmartQueryResponse<T> {
  data: T
}

declare global {
  interface Window {
    keplr?: KeplrLike
  }
}

function encodeSmartQuery(query: Record<string, unknown>) {
  if (process.client) return window.btoa(JSON.stringify(query))

  return Buffer.from(JSON.stringify(query)).toString('base64')
}

function isConfiguredAddress(address?: string) {
  return Boolean(address?.startsWith('juno1')) && !String(address).includes('replace')
}

function nativeAsset(denom: string): NativeAssetInfo {
  return { native_token: { denom } }
}

function tokenAsset(contract: string): TokenAssetInfo {
  return { token: { contract_addr: contract } }
}

function assetInfoFromRegistry(asset: DexRegistryAsset): AssetInfo {
  if (asset.kind === 'cw20') return tokenAsset(asset.id)

  return nativeAsset(asset.id)
}

function assetLabel(asset: AssetInfo) {
  if ('native_token' in asset) return asset.native_token.denom

  return asset.token.contract_addr
}

function shortAddress(address: string) {
  return `${address.slice(0, 10)}…${address.slice(-6)}`
}

function trimEndpoint(endpoint: string) {
  return endpoint.replace(/\/$/, '')
}

function registryHasLaunchValues(registry: DexRegistryV1) {
  if (!isConfiguredAddress(registry.factory) || !registry.pools.length) return false

  return registry.pools.every(pool => (
    isConfiguredAddress(pool.pair) &&
    pool.assets.length === 2 &&
    pool.assets.every(asset => asset.id && !asset.id.toLowerCase().includes('replace'))
  ))
}

function registryNativeDenoms(registry: DexRegistryV1) {
  const denoms = new Set<string>()

  if (registry.nativeDenom) denoms.add(registry.nativeDenom)

  registry.pools
    .filter(pool => pool.enabled)
    .forEach((pool) => {
      pool.assets
        .filter(asset => asset.kind === 'native')
        .forEach(asset => denoms.add(asset.id))
    })

  return [...denoms]
}

export function useJunoDex() {
  const runtimeConfig = useRuntimeConfig()
  const dexConfig = computed<JunoDexRuntimeConfig>(() => ({
    chainId: runtimeConfig.public.junoDexChainId as string,
    chainName: runtimeConfig.public.junoDexChainName as string,
    rpcEndpoint: runtimeConfig.public.junoDexRpcEndpoint as string,
    restEndpoint: runtimeConfig.public.junoDexRestEndpoint as string,
    feeDenom: runtimeConfig.public.junoDexFeeDenom as string,
    displayDenom: runtimeConfig.public.junoDexDisplayDenom as string,
    nativeDenom: runtimeConfig.public.junoDexNativeDenom as string,
    factoryAddress: runtimeConfig.public.junoDexFactoryAddress as string,
    routerAddress: runtimeConfig.public.junoDexRouterAddress as string,
    coinRegistryAddress: runtimeConfig.public.junoDexCoinRegistryAddress as string,
    incentivesAddress: runtimeConfig.public.junoDexIncentivesAddress as string,
    registryUrl: runtimeConfig.public.junoDexRegistryUrl as string,
    explorerBaseUrl: runtimeConfig.public.junoDexExplorerBaseUrl as string
  }))

  const registry = ref<DexRegistryV1 | null>(null)
  const registryError = ref('')
  const registryLoading = ref(false)
  const livePairs = ref<JunoDexPair[]>([])
  const poolsError = ref('')
  const poolsLoading = ref(false)
  const wallet = ref<JunoDexWalletState | null>(null)
  const walletError = ref('')

  const registryPools = computed(() => registry.value?.pools.filter(pool => pool.enabled) ?? [])
  const tokens = computed(() => {
    const map = new Map<string, DexRegistryAsset>()

    registryPools.value.forEach((pool) => {
      pool.assets.forEach(asset => map.set(asset.id, asset))
    })

    const fallbackDenom = registry.value ? registryNativeDenoms(registry.value)[0] : dexConfig.value.nativeDenom

    if (fallbackDenom && !map.has(fallbackDenom))
      map.set(fallbackDenom, {
        kind: 'native',
        id: fallbackDenom,
        symbol: fallbackDenom === dexConfig.value.nativeDenom ? dexConfig.value.displayDenom : fallbackDenom.toUpperCase(),
        decimals: 6
      })

    return [...map.values()]
  })
  const isFactoryReady = computed(() => isConfiguredAddress(dexConfig.value.factoryAddress || registry.value?.factory))
  const launchRegistryReady = computed(() => registry.value ? registryHasLaunchValues(registry.value) : false)
  const registryConfigError = computed(() => {
    if (!registry.value) return ''

    const nativeDenoms = registryNativeDenoms(registry.value)
    const primaryNativeDenom = nativeDenoms[0]

    const mismatches = [
      registry.value.chainId !== dexConfig.value.chainId
        ? `chainId runtime=${dexConfig.value.chainId} registry=${registry.value.chainId}`
        : '',
      trimEndpoint(registry.value.rpcEndpoint) !== trimEndpoint(dexConfig.value.rpcEndpoint)
        ? `rpcEndpoint runtime=${dexConfig.value.rpcEndpoint} registry=${registry.value.rpcEndpoint}`
        : '',
      trimEndpoint(registry.value.restEndpoint) !== trimEndpoint(dexConfig.value.restEndpoint)
        ? `restEndpoint runtime=${dexConfig.value.restEndpoint} registry=${registry.value.restEndpoint}`
        : '',
      primaryNativeDenom && !nativeDenoms.includes(dexConfig.value.nativeDenom)
        ? `nativeDenom runtime=${dexConfig.value.nativeDenom} registry=${nativeDenoms.join(',')}`
        : '',
      primaryNativeDenom && dexConfig.value.feeDenom !== primaryNativeDenom
        ? `feeDenom runtime=${dexConfig.value.feeDenom} registryNativeDenom=${primaryNativeDenom}`
        : ''
    ].filter(Boolean)

    return mismatches.length
      ? `DEX live queries disabled: runtime config does not match ${dexConfig.value.registryUrl} (${mismatches.join('; ')}).`
      : ''
  })
  const liveQueriesDisabled = computed(() => Boolean(registryConfigError.value))
  const poolCount = computed(() => registryPools.value.length || livePairs.value.length)

  function poolByPair(pair: string) {
    return registryPools.value.find(pool => pool.pair === pair)
  }

  function tokenById(id: string) {
    return tokens.value.find(token => token.id === id)
  }

  function displayAmount(amount: string, asset?: DexRegistryAsset) {
    const decimals = asset?.decimals ?? 6
    const value = Number(amount) / (10 ** decimals)

    if (!Number.isFinite(value)) return amount

    return value.toLocaleString(undefined, { maximumFractionDigits: 6 })
  }

  function explorerLink(path: string) {
    return `${dexConfig.value.explorerBaseUrl.replace(/\/$/, '')}/${path}`
  }

  async function loadRegistry() {
    registryLoading.value = true
    registryError.value = ''

    try {
      registry.value = await $fetch<DexRegistryV1>(dexConfig.value.registryUrl)
    } catch (error) {
      registry.value = null
      registryError.value = error instanceof Error ? error.message : 'DEX registry could not be loaded.'
    } finally {
      registryLoading.value = false
    }
  }

  async function querySmart<T>(contractAddress: string, query: Record<string, unknown>) {
    if (!isConfiguredAddress(contractAddress)) throw new Error('A real Juno contract address is required for live queries.')
    if (registryConfigError.value) throw new Error(registryConfigError.value)

    const encoded = encodeURIComponent(encodeSmartQuery(query))
    const restEndpoint = trimEndpoint(registry.value?.restEndpoint || dexConfig.value.restEndpoint)

    const response = await $fetch<CosmWasmRestSmartQueryResponse<T>>(`${restEndpoint}/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encoded}`)

    return response.data
  }

  async function queryFactory<T>(query: Record<string, unknown>) {
    const factory = dexConfig.value.factoryAddress || registry.value?.factory || ''

    return await querySmart<T>(factory, query)
  }

  async function discoverPools() {
    poolsLoading.value = true
    poolsError.value = ''

    try {
      const response = await queryFactory<JunoDexPairsResponse>({ pairs: { limit: 30 } })

      livePairs.value = response.pairs ?? []
    } catch (error) {
      livePairs.value = []
      poolsError.value = error instanceof Error ? error.message : 'Pool discovery failed.'
    } finally {
      poolsLoading.value = false
    }
  }

  async function queryPool(pool: DexPoolRegistryEntry | string) {
    const pair = typeof pool === 'string' ? pool : pool.pair

    return await querySmart<DexPoolResponse>(pair, { pool: {} })
  }

  async function simulateSwap(pool: DexPoolRegistryEntry, draft: JunoDexSwapDraft) {
    const offerAsset = tokenById(draft.offerAssetId)

    if (!offerAsset) throw new Error('Choose an offer asset from the verified registry.')
    if (!draft.amount || Number(draft.amount) <= 0) throw new Error('Enter an amount in base units.')

    return await querySmart<DexSimulationResponse>(pool.pair, {
      simulation: {
        offer_asset: {
          info: assetInfoFromRegistry(offerAsset),
          amount: draft.amount
        },
        ask_asset_info: draft.askAssetId ? assetInfoFromRegistry(tokenById(draft.askAssetId) || offerAsset) : null
      }
    })
  }

  async function connectWallet() {
    walletError.value = ''

    if (!process.client || !window.keplr) {
      walletError.value = 'Keplr is not available in this browser.'

      return
    }

    try {
      await window.keplr.experimentalSuggestChain?.({
        chainId: dexConfig.value.chainId,
        chainName: dexConfig.value.chainName,
        rpc: dexConfig.value.rpcEndpoint,
        rest: dexConfig.value.restEndpoint,
        bip44: { coinType: 118 },
        bech32Config: {
          bech32PrefixAccAddr: 'juno',
          bech32PrefixAccPub: 'junopub',
          bech32PrefixValAddr: 'junovaloper',
          bech32PrefixValPub: 'junovaloperpub',
          bech32PrefixConsAddr: 'junovalcons',
          bech32PrefixConsPub: 'junovalconspub'
        },
        currencies: [{ coinDenom: dexConfig.value.displayDenom, coinMinimalDenom: dexConfig.value.feeDenom, coinDecimals: 6 }],
        feeCurrencies: [{ coinDenom: dexConfig.value.displayDenom, coinMinimalDenom: dexConfig.value.feeDenom, coinDecimals: 6 }],
        stakeCurrency: { coinDenom: dexConfig.value.displayDenom, coinMinimalDenom: dexConfig.value.feeDenom, coinDecimals: 6 }
      })

      await window.keplr.enable(dexConfig.value.chainId)

      const key = await window.keplr.getKey(dexConfig.value.chainId)

      wallet.value = {
        address: key.bech32Address,
        name: key.name,
        chainId: dexConfig.value.chainId
      }
    } catch (error) {
      wallet.value = null
      walletError.value = error instanceof Error ? error.message : 'Wallet connection failed.'
    }
  }

  function buildPairQuery(pool: DexPoolRegistryEntry) {
    return {
      pair: {
        asset_infos: pool.assets.map(assetInfoFromRegistry)
      }
    }
  }

  function buildSwapExecute(pool: DexPoolRegistryEntry, draft: JunoDexSwapDraft, quote?: DexSimulationResponse) {
    const offerAsset = tokenById(draft.offerAssetId) || pool.assets[0]
    const askAsset = tokenById(draft.askAssetId) || pool.assets[1]
    const minReceive = quote
      ? String(Math.floor(Number(quote.return_amount) * (10000 - draft.slippageBps) / 10000))
      : null

    return {
      contract: pool.pair,
      msg: {
        swap: {
          offer_asset: {
            info: assetInfoFromRegistry(offerAsset),
            amount: draft.amount
          },
          ask_asset_info: assetInfoFromRegistry(askAsset),
          belief_price: null,
          max_spread: String(draft.slippageBps / 10000),
          to: wallet.value?.address ?? null
        }
      },
      funds: offerAsset.kind === 'cw20' ? [] : [{ denom: offerAsset.id, amount: draft.amount }],
      minimumReceive: minReceive
    }
  }

  return {
    assetInfoFromRegistry,
    assetLabel,
    buildPairQuery,
    buildSwapExecute,
    connectWallet,
    dexConfig,
    discoverPools,
    displayAmount,
    explorerLink,
    isFactoryReady,
    launchRegistryReady,
    livePairs,
    liveQueriesDisabled,
    loadRegistry,
    poolByPair,
    poolCount,
    poolsError,
    poolsLoading,
    queryPool,
    registry,
    registryConfigError,
    registryError,
    registryLoading,
    registryPools,
    shortAddress,
    simulateSwap,
    tokenById,
    tokens,
    wallet,
    walletError
  }
}
