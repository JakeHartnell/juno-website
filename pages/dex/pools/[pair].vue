<script setup lang="ts">
import type { DexPoolResponse } from '@/types/dex'

const route = useRoute()
const {
  displayAmount,
  explorerLink,
  loadRegistry,
  poolByPair,
  queryPool,
  tokenById
} = useJunoDex()

const livePool = ref<DexPoolResponse | null>(null)
const liveError = ref('')
const liveLoading = ref(false)
const pairAddress = computed(() => String(route.params.pair || ''))
const pool = computed(() => poolByPair(pairAddress.value))

async function refreshPool() {
  liveLoading.value = true
  liveError.value = ''

  try {
    livePool.value = await queryPool(pairAddress.value)
  } catch (error) {
    livePool.value = null
    liveError.value = error instanceof Error ? error.message : 'Pool query failed.'
  } finally {
    liveLoading.value = false
  }
}

onMounted(async () => {
  await loadRegistry()
  await refreshPool()
})

useSeoMeta({
  title: 'Juno DEX Pool Detail',
  description: 'Live Astroport-Juno pool reserves, LP supply, and liquidity actions.'
})
</script>

<template>
  <DexAppShell>
    <div class="grid gap-6 lg:grid-cols-[1fr_.8fr]">
      <article class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <p class="text-xs uppercase tracking-[0.24em] text-cyan-100">
          Pool detail
        </p>
        <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
          {{ pool?.label ?? 'Unregistered pair' }}
        </h2>
        <p class="mt-3 break-all text-sm text-grey-100">
          {{ pairAddress }}
        </p>

        <div v-if="pool" class="mt-6 grid gap-3 md:grid-cols-2">
          <div class="rounded-2xl bg-black/20 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-grey-100">
              Asset 0
            </p>
            <p class="mt-2 text-beige-100">
              {{ pool.assets[0].symbol }} — {{ pool.assets[0].id }}
            </p>
          </div>
          <div class="rounded-2xl bg-black/20 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-grey-100">
              Asset 1
            </p>
            <p class="mt-2 text-beige-100">
              {{ pool.assets[1].symbol }} — {{ pool.assets[1].id }}
            </p>
          </div>
          <div class="rounded-2xl bg-black/20 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-grey-100">
              LP token
            </p>
            <p class="mt-2 break-all text-beige-100">
              {{ pool.lpToken }}
            </p>
          </div>
          <div class="rounded-2xl bg-black/20 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-grey-100">
              Type / fee
            </p>
            <p class="mt-2 text-beige-100">
              {{ pool.type }} / {{ pool.feeBps ?? '—' }} bps
            </p>
          </div>
        </div>

        <p v-else class="mt-6 rounded-2xl border border-yellow-100/20 bg-yellow-200/30 p-4 text-sm text-yellow-100">
          This contract is not in the verified registry. Live query is allowed for diagnostics, but trading should stay disabled.
        </p>
      </article>

      <aside class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="font-neue-haas text-2xl text-beige-100">
              Live reserves
            </h3>
            <p class="mt-2 text-sm text-grey-100">
              Queries <code>{ pool: {} }</code> directly from the pair contract.
            </p>
          </div>
          <button class="rounded-full bg-cyan-200 px-4 py-2 text-xs font-semibold text-cyan-500 disabled:opacity-50" :disabled="liveLoading" type="button" @click="refreshPool">
            Refresh
          </button>
        </div>

        <p v-if="liveError" class="mt-4 rounded-2xl border border-salmon-200/20 bg-salmon-400/20 p-4 text-sm text-salmon-100">
          {{ liveError }}
        </p>

        <dl v-if="livePool" class="mt-5 grid gap-3 text-sm">
          <div v-for="asset in livePool.assets" :key="JSON.stringify(asset.info)" class="rounded-2xl bg-brown-400 p-4">
            <dt class="text-grey-100">
              {{ 'native_token' in asset.info ? asset.info.native_token.denom : asset.info.token.contract_addr }}
            </dt>
            <dd class="mt-2 text-xl text-beige-100">
              {{ displayAmount(asset.amount, tokenById('native_token' in asset.info ? asset.info.native_token.denom : asset.info.token.contract_addr)) }}
            </dd>
          </div>
          <div class="rounded-2xl bg-brown-400 p-4">
            <dt class="text-grey-100">
              Total LP share
            </dt>
            <dd class="mt-2 break-all text-xl text-beige-100">
              {{ livePool.total_share }}
            </dd>
          </div>
        </dl>

        <a class="mt-5 inline-flex rounded-full border border-cyan-200/50 px-4 py-2 text-sm text-cyan-100" :href="explorerLink(`contracts/${pairAddress}`)" target="_blank" rel="noreferrer">
          View on explorer
        </a>
      </aside>
    </div>

    <div class="mt-6 grid gap-6 md:grid-cols-2">
      <section class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <h3 class="font-neue-haas text-2xl text-beige-100">
          Add liquidity
        </h3>
        <p class="mt-3 text-sm text-grey-100">
          v1 shows the verified pair and live reserves first. Submit wiring should use Astroport pair provide-liquidity once launch signing is enabled.
        </p>
      </section>
      <section class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <h3 class="font-neue-haas text-2xl text-beige-100">
          Remove liquidity
        </h3>
        <p class="mt-3 text-sm text-grey-100">
          LP balance lookup uses wallet bank/CW20 balance by LP token; APR and rewards are intentionally hidden in v1.
        </p>
      </section>
    </div>
  </DexAppShell>
</template>
