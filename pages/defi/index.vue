<script setup lang="ts">
import type { JunoDexSwapDraft } from '@/types/dex'

const {
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
} = useJunoDex()

type DexPanel = 'swap' | 'pools' | 'liquidity'

const panels: DexPanel[] = ['swap', 'pools', 'liquidity']
const activePanel = ref<DexPanel>('swap')
const swapDraft = reactive<JunoDexSwapDraft>({
  offerDenom: 'ujunox',
  askDenom: 'ibc/REPLACE_COUNTERPARTY_DENOM_HASH',
  amount: '1000000'
})

const pairQueryPreview = computed(() => JSON.stringify(buildPairQuery(swapDraft), null, 2))
const swapMsgPreview = computed(() => JSON.stringify(buildSwapDraft(swapDraft), null, 2))
const shortAddress = computed(() => {
  if (!wallet.value) return ''

  return `${wallet.value.address.slice(0, 10)}…${wallet.value.address.slice(-6)}`
})

useSeoMeta({
  title: 'Juno DeFi v1',
  description: 'Juno-native DEX interface for Astroport-Juno v1 swaps, pools, and liquidity.'
})
</script>

<template>
  <main class="min-h-screen bg-brown-500 text-beige-100">
    <section class="relative overflow-hidden border-b border-beige-200/10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,118,119,.24),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(61,254,214,.16),_transparent_30%)]" />

      <div class="relative mx-auto max-w-screen-xl px-5 py-8 sm:px-6 lg:py-10">
        <nav class="flex items-center justify-between gap-4">
          <NuxtLink
            to="/"
            class="text-xl font-semibold text-salmon-200"
          >
            Juno
          </NuxtLink>

          <div class="flex items-center gap-3 text-xs uppercase tracking-[0.24em] text-grey-100">
            <span>Swaps</span>
            <span>Pools</span>
            <span>Liquidity</span>
          </div>
        </nav>

        <div class="grid gap-10 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:py-24">
          <div>
            <p class="mb-5 inline-flex rounded-full border border-cyan-200/30 bg-cyan-500/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
              Astroport-Juno v1 frontend slice
            </p>
            <h1 class="max-w-4xl font-neue-haas text-5xl-mobile font-medium leading-none text-beige-100 md:text-5xl">
              Trade and seed Juno-native liquidity without leaving Juno.
            </h1>
            <p class="mt-6 max-w-2xl text-base text-grey-100 md:text-lg">
              A scoped DEX shell for swaps, pools, and liquidity only. It is wired for factory-driven pool discovery and Keplr connection; real contract addresses can be injected at launch.
            </p>
          </div>

          <div class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 shadow-2xl backdrop-blur">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-grey-100">
                  Network
                </p>
                <p class="mt-1 text-xl text-beige-100">
                  {{ dexConfig.chainName }}
                </p>
              </div>
              <button
                class="rounded-full bg-salmon-200 px-5 py-3 text-sm font-semibold text-brown-500 transition hover:bg-salmon-100"
                type="button"
                @click="connectWallet"
              >
                {{ wallet ? shortAddress : 'Connect Keplr' }}
              </button>
            </div>

            <p
              v-if="walletError"
              class="mt-4 rounded-2xl border border-salmon-200/20 bg-salmon-400/20 p-3 text-sm text-salmon-100"
            >
              {{ walletError }}
            </p>

            <dl class="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl bg-brown-400 p-4">
                <dt class="text-grey-100">
                  Factory
                </dt>
                <dd class="mt-2 break-all text-beige-100">
                  {{ isFactoryReady ? dexConfig.factoryAddress : 'Awaiting deploy config' }}
                </dd>
              </div>
              <div class="rounded-2xl bg-brown-400 p-4">
                <dt class="text-grey-100">
                  Discovered pools
                </dt>
                <dd class="mt-2 text-2xl text-beige-100">
                  {{ poolCount }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-screen-xl px-5 py-10 sm:px-6 lg:py-16">
        <div class="mb-8 flex flex-wrap gap-3">
          <button
            v-for="panel in panels"
            :key="panel"
            :class="[
              'rounded-full px-5 py-3 text-sm font-semibold capitalize transition',
              activePanel === panel ? 'bg-cyan-200 text-cyan-500' : 'bg-brown-300 text-beige-200 hover:bg-brown-200'
            ]"
            type="button"
            @click="activePanel = panel"
          >
            {{ panel }}
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <article
            v-if="activePanel === 'swap'"
            class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8"
          >
            <p class="text-xs uppercase tracking-[0.24em] text-salmon-100">
              Swap path
            </p>
            <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
              Prepare a native swap
            </h2>
            <p class="mt-3 text-grey-100">
              v1 keeps routing narrow: one native-offer swap operation, pool lookup through the Astroport factory, then router execution once addresses are live.
            </p>

            <div class="mt-6 space-y-4">
              <label class="block text-sm text-grey-100">
                Offer denom
                <input
                  v-model="swapDraft.offerDenom"
                  class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100 outline-none focus:border-cyan-200"
                >
              </label>
              <label class="block text-sm text-grey-100">
                Ask denom
                <input
                  v-model="swapDraft.askDenom"
                  class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100 outline-none focus:border-cyan-200"
                >
              </label>
              <label class="block text-sm text-grey-100">
                Amount (micro denom)
                <input
                  v-model="swapDraft.amount"
                  class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100 outline-none focus:border-cyan-200"
                >
              </label>
            </div>
          </article>

          <article
            v-else-if="activePanel === 'pools'"
            class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8"
          >
            <p class="text-xs uppercase tracking-[0.24em] text-cyan-100">
              Pool discovery
            </p>
            <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
              Query the factory, never hardcode pools
            </h2>
            <p class="mt-3 text-grey-100">
              This calls the CosmWasm LCD smart query endpoint for <code>{ pairs: { limit: 30 } }</code> against the configured Astroport factory.
            </p>

            <button
              class="mt-6 rounded-full bg-cyan-200 px-5 py-3 text-sm font-semibold text-cyan-500 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="poolsLoading"
              type="button"
              @click="discoverPools"
            >
              {{ poolsLoading ? 'Discovering…' : 'Discover pools' }}
            </button>

            <p
              v-if="poolsError"
              class="mt-4 rounded-2xl border border-yellow-100/20 bg-yellow-200/30 p-4 text-sm text-yellow-100"
            >
              {{ poolsError }}
            </p>
          </article>

          <article
            v-else
            class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8"
          >
            <p class="text-xs uppercase tracking-[0.24em] text-orange-100">
              Liquidity
            </p>
            <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
              Add and remove liquidity scope
            </h2>
            <p class="mt-3 text-grey-100">
              The v1 liquidity surface stays XYK-only. Pair creation uses the Astroport deployment template, while existing pool positions come from discovered factory pairs.
            </p>

            <ul class="mt-6 space-y-3 text-sm text-beige-200">
              <li class="rounded-2xl bg-black/20 p-4">
                Native JUNO pair create template: enabled after code IDs and factory are live.
              </li>
              <li class="rounded-2xl bg-black/20 p-4">
                LP add/remove forms: bind to selected pair contract from factory discovery.
              </li>
              <li class="rounded-2xl bg-black/20 p-4">
                Explicitly excluded: DEX token, stablecoin, LSTs, perps, lending, yield vaults.
              </li>
            </ul>
          </article>

          <aside class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
            <div v-if="activePanel === 'pools'">
              <div class="mb-4 flex items-center justify-between">
                <h3 class="font-neue-haas text-2xl text-beige-100">
                  Pools
                </h3>
                <span class="text-sm text-grey-100">{{ poolCount }} loaded</span>
              </div>

              <div
                v-if="pools.length"
                class="space-y-3"
              >
                <div
                  v-for="pool in pools"
                  :key="pool.contract_addr"
                  class="rounded-2xl bg-brown-400 p-4"
                >
                  <p class="break-all text-sm text-beige-100">
                    {{ pool.contract_addr }}
                  </p>
                  <p class="mt-2 text-xs text-grey-100">
                    {{ assetLabel(pool.asset_infos[0]) }} / {{ assetLabel(pool.asset_infos[1]) }}
                  </p>
                </div>
              </div>

              <p
                v-else
                class="rounded-2xl bg-brown-400 p-4 text-sm text-grey-100"
              >
                No pools loaded yet. Configure the factory address, then click Discover pools.
              </p>
            </div>

            <div v-else>
              <h3 class="font-neue-haas text-2xl text-beige-100">
                Integration preview
              </h3>
              <p class="mt-2 text-sm text-grey-100">
                The UI builds concrete CosmWasm payloads now; signing/broadcasting remains gated on final deployed addresses.
              </p>

              <div class="mt-5 space-y-4">
                <div>
                  <p class="mb-2 text-xs uppercase tracking-[0.2em] text-grey-100">
                    Pair query
                  </p>
                  <pre class="overflow-auto rounded-2xl bg-brown-500 p-4 text-xs text-cyan-100">{{ pairQueryPreview }}</pre>
                </div>
                <div>
                  <p class="mb-2 text-xs uppercase tracking-[0.2em] text-grey-100">
                    Router execute draft
                  </p>
                  <pre class="overflow-auto rounded-2xl bg-brown-500 p-4 text-xs text-salmon-100">{{ swapMsgPreview }}</pre>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>
