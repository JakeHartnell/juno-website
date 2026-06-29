<script setup lang="ts">
const { loadRegistry, registryPools, wallet } = useJunoDex()

onMounted(() => {
  loadRegistry()
})

useSeoMeta({
  title: 'Juno DEX Liquidity',
  description: 'Juno DEX v1 liquidity management entry point for verified pools.'
})
</script>

<template>
  <DexAppShell>
    <div class="grid gap-6 lg:grid-cols-[.8fr_1fr]">
      <article class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <p class="text-xs uppercase tracking-[0.24em] text-orange-100">
          Liquidity
        </p>
        <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
          Manage LP positions by verified pool
        </h2>
        <p class="mt-3 text-grey-100">
          Connect Keplr to prepare LP balance checks. Without an indexer, v1 links you to each pool detail instead of inventing a portfolio or APR.
        </p>
        <p class="mt-5 rounded-2xl bg-black/20 p-4 text-sm text-grey-100">
          Wallet: {{ wallet ? wallet.address : 'not connected' }}
        </p>
      </article>

      <section class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
        <h3 class="font-neue-haas text-2xl text-beige-100">
          Supported pools
        </h3>
        <div v-if="registryPools.length" class="mt-5 space-y-3">
          <NuxtLink v-for="pool in registryPools" :key="pool.pair" :to="`/dex/pools/${pool.pair}`" class="block rounded-2xl bg-brown-400 p-4 transition hover:bg-brown-300">
            <p class="font-semibold text-beige-100">
              {{ pool.label }}
            </p>
            <p class="mt-1 break-all text-xs text-grey-100">
              LP: {{ pool.lpToken }}
            </p>
          </NuxtLink>
        </div>
        <p v-else class="mt-5 rounded-2xl bg-brown-400 p-4 text-sm text-grey-100">
          Add real launch pools to the registry before displaying LP actions.
        </p>
      </section>
    </div>
  </DexAppShell>
</template>
