import type {
  AssetInfo,
  JunoDexPair,
  JunoDexPairsResponse,
  JunoDexRuntimeConfig,
  JunoDexSwapDraft,
  JunoDexWalletState,
  NativeAssetInfo
} from '@/types/dex'

interface KeplrLike {
  enable: (chainId: string) => Promise<void>
  experimentalSuggestChain?: (chainInfo: Record<string, unknown>) => Promise<void>
  getKey: (chainId: string) => Promise<{ bech32Address: string, name: string }>
}

declare global {
  interface Window {
    keplr?: KeplrLike
  }
}

function encodeSmartQuery(query: Record<string, unknown>) {
  return btoa(JSON.stringify(query))
}

function isConfiguredAddress(address: string) {
  return address.startsWith('juno1') && !address.includes('replace')
}

function nativeAsset(denom: string): NativeAssetInfo {
  return {
    native_token: {
      denom
    }
  }
}

function assetLabel(asset: AssetInfo) {
  if ('native_token' in asset) return asset.native_token.denom

  return asset.token.contract_addr
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
    incentivesAddress: runtimeConfig.public.junoDexIncentivesAddress as string
  }))

  const pools = ref<JunoDexPair[]>([])
  const poolsError = ref('')
  const poolsLoading = ref(false)
  const wallet = ref<JunoDexWalletState | null>(null)
  const walletError = ref('')

  const isFactoryReady = computed(() => isConfiguredAddress(dexConfig.value.factoryAddress))
  const poolCount = computed(() => pools.value.length)

  async function queryFactory<T>(query: Record<string, unknown>) {
    if (!isFactoryReady.value)
      throw new Error('Set NUXT_PUBLIC_JUNO_DEX_FACTORY_ADDRESS to query live Astroport-Juno pools.')

    const encoded = encodeSmartQuery(query)

    return await $fetch<T>(`${dexConfig.value.restEndpoint}/cosmwasm/wasm/v1/contract/${dexConfig.value.factoryAddress}/smart/${encoded}`)
  }

  async function discoverPools() {
    poolsLoading.value = true
    poolsError.value = ''

    try {
      const response = await queryFactory<JunoDexPairsResponse>({ pairs: { limit: 30 } })

      pools.value = response.pairs ?? []
    } catch (error) {
      pools.value = []
      poolsError.value = error instanceof Error ? error.message : 'Pool discovery failed.'
    } finally {
      poolsLoading.value = false
    }
  }

  async function connectWallet() {
    walletError.value = ''

    if (!window.keplr) {
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

  function buildPairQuery(draft: JunoDexSwapDraft) {
    return {
      pair: {
        asset_infos: [
          nativeAsset(draft.offerDenom),
          nativeAsset(draft.askDenom)
        ]
      }
    }
  }

  function buildSwapDraft(draft: JunoDexSwapDraft) {
    return {
      contract: dexConfig.value.routerAddress,
      msg: {
        execute_swap_operations: {
          operations: [{
            astro_swap: {
              offer_asset_info: nativeAsset(draft.offerDenom),
              ask_asset_info: nativeAsset(draft.askDenom)
            }
          }],
          minimum_receive: null,
          to: wallet.value?.address ?? null
        }
      },
      funds: [{
        denom: draft.offerDenom,
        amount: draft.amount
      }]
    }
  }

  return {
    assetLabel,
    buildPairQuery,
    buildSwapDraft,
    connectWallet,
    dexConfig,
    discoverPools,
    isFactoryReady,
    poolCount,
    pools,
    poolsError,
    poolsLoading,
    wallet,
    walletError
  }
}
