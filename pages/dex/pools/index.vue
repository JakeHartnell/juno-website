<script setup lang="ts">
const {
  assetLabel,
  discoverPools,
  explorerLink,
  livePairs,
  loadRegistry,
  poolsError,
  poolsLoading,
  registryPools
} = useJunoDex()

const search = ref('')
const filteredPools = computed(() => registryPools.value.filter(pool => (
  pool.label.toLowerCase().includes(search.value.toLowerCase()) ||
  pool.assets.some(asset => asset.symbol.toLowerCase().includes(search.value.toLowerCase()))
)))

onMounted(() => {
  loadRegistry()
})

useSeoMeta({
  title: 'Juno DEX Pools',
  description: 'Verified Astroport-Juno pool registry with optional live factory discovery.'
})
</script>

<template>
  <DexAppShell>
    <div class="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <article class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-cyan-100">
              Verified pools
            </p>
            <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
              Registry-first pool list
            </h2>
          </div>
          <input v-model="search" placeholder="Filter token or pool" class="rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-sm text-beige-100 outline-none focus:border-cyan-200">
        </div>

        <div v-if="filteredPools.length" class="mt-6 overflow-hidden rounded-2xl border border-beige-200/10">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-black/30 text-xs uppercase tracking-[0.18em] text-grey-100">
              <tr>
                <th class="p-4">
                  Pool
                </th>
                <th class="p-4">
                  Assets
                </th>
                <th class="p-4">
                  Fee
                </th>
                <th class="p-4">
                  Pair
                </th>
                <th class="p-4">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pool in filteredPools" :key="pool.pair" class="border-t border-beige-200/10">
                <td class="p-4 font-semibold text-beige-100">
                  {{ pool.label }}
                </td>
                <td class="p-4 text-grey-100">
                  {{ pool.assets[0].symbol }} / {{ pool.assets[1].symbol }}
                </td>
                <td class="p-4 text-grey-100">
                  {{ pool.feeBps ?? '—' }} bps
                </td>
                <td class="break-all p-4 text-xs text-grey-100">
                  {{ pool.pair }}
                </td>
                <td class="p-4">
                  <NuxtLink class="rounded-full bg-cyan-200 px-4 py-2 text-xs font-semibold text-cyan-500" :to="`/dex/pools/${pool.pair}`">
                    Details
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="mt-6 rounded-2xl bg-black/20 p-5 text-sm text-grey-100">
          No enabled launch pools are in the registry. v1 will not show placeholder pools.
        </p>
      </article>

      <aside class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
        <h3 class="font-neue-haas text-2xl text-beige-100">
          Live factory discovery
        </h3>
        <p class="mt-3 text-sm text-grey-100">
          This check queries the configured Astroport factory for <code>{ pairs: { limit: 30 } }</code>. It is a smoke path, not a replacement for the strict launch registry.
        </p>
        <button class="mt-5 rounded-full bg-salmon-200 px-5 py-3 text-sm font-semibold text-brown-500 transition hover:bg-salmon-100 disabled:cursor-not-allowed disabled:opacity-50" :disabled="poolsLoading" type="button" @click="discoverPools">
          {{ poolsLoading ? 'Querying…' : 'Discover live pools' }}
        </button>

        <p v-if="poolsError" class="mt-4 rounded-2xl border border-yellow-100/20 bg-yellow-200/30 p-4 text-sm text-yellow-100">
          {{ poolsError }}
        </p>

        <div v-if="livePairs.length" class="mt-5 space-y-3">
          <div v-for="pool in livePairs" :key="pool.contract_addr" class="rounded-2xl bg-brown-400 p-4">
            <p class="break-all text-sm text-beige-100">
              {{ pool.contract_addr }}
            </p>
            <p class="mt-2 text-xs text-grey-100">
              {{ assetLabel(pool.asset_infos[0]) }} / {{ assetLabel(pool.asset_infos[1]) }}
            </p>
            <a class="mt-2 inline-flex text-xs text-cyan-100" :href="explorerLink(`contracts/${pool.contract_addr}`)" target="_blank" rel="noreferrer">
              Explorer
            </a>
          </div>
        </div>
      </aside>
    </div>
  </DexAppShell>
</template>
