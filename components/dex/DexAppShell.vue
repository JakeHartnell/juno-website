<script setup lang="ts">
const {
  connectWallet,
  dexConfig,
  isFactoryReady,
  launchRegistryReady,
  loadRegistry,
  poolCount,
  registryError,
  registryLoading,
  shortAddress,
  wallet,
  walletError
} = useJunoDex()

const navItems = [
  { label: 'Swap', to: '/dex/swap' },
  { label: 'Pools', to: '/dex/pools' },
  { label: 'Liquidity', to: '/dex/liquidity' }
]

onMounted(() => {
  loadRegistry()
})
</script>

<template>
  <main class="min-h-screen bg-brown-500 text-beige-100">
    <section class="relative overflow-hidden border-b border-beige-200/10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,118,119,.24),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(61,254,214,.16),_transparent_30%)]" />

      <div class="relative mx-auto max-w-screen-xl px-5 py-8 sm:px-6 lg:py-10">
        <nav class="flex flex-wrap items-center justify-between gap-4">
          <NuxtLink to="/" class="text-xl font-semibold text-salmon-200">
            Juno
          </NuxtLink>

          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-full px-4 py-2 text-sm font-semibold text-beige-100 transition hover:bg-beige-100/10"
              active-class="bg-cyan-200 text-cyan-500 hover:bg-cyan-200"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>

        <div class="grid gap-8 py-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:py-16">
          <div>
            <p class="mb-5 inline-flex rounded-full border border-cyan-200/30 bg-cyan-500/40 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-100">
              Experimental Juno DEX v1
            </p>
            <h1 class="max-w-4xl font-neue-haas text-5xl-mobile font-medium leading-none text-beige-100 md:text-5xl">
              Swap and seed Juno liquidity.
            </h1>
            <p class="mt-6 max-w-2xl text-base text-grey-100 md:text-lg">
              Verified pools only, direct Astroport-Juno contract queries, no hidden routing, no invented APR.
            </p>
          </div>

          <div class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 shadow-2xl backdrop-blur">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.24em] text-grey-100">
                  {{ dexConfig.chainName }}
                </p>
                <p class="mt-1 text-sm text-beige-100">
                  {{ wallet ? shortAddress(wallet.address) : 'Read-only mode' }}
                </p>
              </div>
              <button
                class="rounded-full bg-salmon-200 px-5 py-3 text-sm font-semibold text-brown-500 transition hover:bg-salmon-100"
                type="button"
                @click="connectWallet"
              >
                {{ wallet ? 'Wallet connected' : 'Connect Keplr' }}
              </button>
            </div>

            <p v-if="walletError" class="mt-4 rounded-2xl border border-salmon-200/20 bg-salmon-400/20 p-3 text-sm text-salmon-100">
              {{ walletError }}
            </p>
            <p v-if="registryError" class="mt-4 rounded-2xl border border-yellow-100/20 bg-yellow-200/30 p-3 text-sm text-yellow-100">
              Registry warning: {{ registryError }}
            </p>

            <dl class="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div class="rounded-2xl bg-brown-400 p-4">
                <dt class="text-grey-100">
                  Factory
                </dt>
                <dd class="mt-2 text-beige-100">
                  {{ isFactoryReady ? 'ready' : 'not set' }}
                </dd>
              </div>
              <div class="rounded-2xl bg-brown-400 p-4">
                <dt class="text-grey-100">
                  Registry
                </dt>
                <dd class="mt-2 text-beige-100">
                  {{ registryLoading ? 'loading' : launchRegistryReady ? 'strict' : 'pending' }}
                </dd>
              </div>
              <div class="rounded-2xl bg-brown-400 p-4">
                <dt class="text-grey-100">
                  Pools
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

    <section class="mx-auto max-w-screen-xl px-5 py-10 sm:px-6 lg:py-14">
      <div class="mb-6 rounded-[1.5rem] border border-yellow-100/20 bg-yellow-200/20 p-5 text-sm text-yellow-100">
        Liquidity may be thin. Verify every contract before signing. v1 intentionally excludes DEX token, incentives APR, stables, LSTs, perps, lending, and multi-hop routing.
      </div>

      <slot />
    </section>
  </main>
</template>
