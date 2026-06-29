<script setup lang="ts">
import type { DexPoolRegistryEntry, DexSimulationResponse, JunoDexSwapDraft } from '@/types/dex'

const {
  buildPairQuery,
  buildSwapExecute,
  displayAmount,
  loadRegistry,
  poolByPair,
  registryPools,
  simulateSwap,
  tokenById,
  tokens,
  wallet
} = useJunoDex()

const selectedPair = ref('')
const quote = ref<DexSimulationResponse | null>(null)
const quoteError = ref('')
const quoteLoading = ref(false)
const swapDraft = reactive<JunoDexSwapDraft>({
  offerAssetId: '',
  askAssetId: '',
  amount: '1000000',
  slippageBps: 50
})

const currentPool = computed(() => poolByPair(selectedPair.value) || registryPools.value[0])
const canQuote = computed(() => Boolean(currentPool.value && swapDraft.offerAssetId && swapDraft.askAssetId && swapDraft.amount))
const pairQueryPreview = computed(() => currentPool.value ? JSON.stringify(buildPairQuery(currentPool.value), null, 2) : '{}')
const swapMsgPreview = computed(() => currentPool.value ? JSON.stringify(buildSwapExecute(currentPool.value, swapDraft, quote.value || undefined), null, 2) : '{}')
const minReceive = computed(() => {
  if (!quote.value) return ''

  return String(Math.floor(Number(quote.value.return_amount) * (10000 - swapDraft.slippageBps) / 10000))
})

function selectPool(pool: DexPoolRegistryEntry) {
  selectedPair.value = pool.pair
  swapDraft.offerAssetId = pool.assets[0].id
  swapDraft.askAssetId = pool.assets[1].id
  quote.value = null
  quoteError.value = ''
}

async function refreshQuote() {
  if (!currentPool.value) return

  quoteLoading.value = true
  quoteError.value = ''

  try {
    quote.value = await simulateSwap(currentPool.value, swapDraft)
  } catch (error) {
    quote.value = null
    quoteError.value = error instanceof Error ? error.message : 'Quote failed.'
  } finally {
    quoteLoading.value = false
  }
}

onMounted(async () => {
  await loadRegistry()

  if (registryPools.value[0]) selectPool(registryPools.value[0])
})

useSeoMeta({
  title: 'Juno DEX Swap',
  description: 'Direct Astroport-Juno swap quotes and execution payloads for verified Juno pools.'
})
</script>

<template>
  <DexAppShell>
    <div class="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <article class="rounded-[2rem] border border-beige-200/10 bg-brown-400 p-6 lg:p-8">
        <p class="text-xs uppercase tracking-[0.24em] text-salmon-100">
          Direct pair swap
        </p>
        <h2 class="mt-3 font-neue-haas text-3xl text-beige-100">
          Quote a verified pool
        </h2>
        <p class="mt-3 text-grey-100">
          Quotes call the selected pair contract with <code>{ simulation: ... }</code>. v1 does not route multi-hop.
        </p>

        <div v-if="registryPools.length" class="mt-6 space-y-4">
          <label class="block text-sm text-grey-100">
            Pool
            <select v-model="selectedPair" class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100" @change="quote = null">
              <option v-for="pool in registryPools" :key="pool.pair" :value="pool.pair">
                {{ pool.label }} — {{ pool.pair }}
              </option>
            </select>
          </label>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="block text-sm text-grey-100">
              Offer asset
              <select v-model="swapDraft.offerAssetId" class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100" @change="quote = null">
                <option v-for="token in tokens" :key="token.id" :value="token.id">
                  {{ token.symbol }} — {{ token.id }}
                </option>
              </select>
            </label>
            <label class="block text-sm text-grey-100">
              Ask asset
              <select v-model="swapDraft.askAssetId" class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100" @change="quote = null">
                <option v-for="token in tokens" :key="token.id" :value="token.id">
                  {{ token.symbol }} — {{ token.id }}
                </option>
              </select>
            </label>
          </div>

          <label class="block text-sm text-grey-100">
            Amount in base units
            <input v-model="swapDraft.amount" class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100 outline-none focus:border-cyan-200">
          </label>

          <label class="block text-sm text-grey-100">
            Slippage tolerance
            <select v-model.number="swapDraft.slippageBps" class="mt-2 w-full rounded-2xl border border-beige-200/10 bg-black/30 px-4 py-3 text-beige-100">
              <option :value="10">
                0.10%
              </option>
              <option :value="50">
                0.50%
              </option>
              <option :value="100">
                1.00%
              </option>
            </select>
          </label>

          <button class="w-full rounded-full bg-cyan-200 px-5 py-3 text-sm font-semibold text-cyan-500 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50" :disabled="quoteLoading || !canQuote" type="button" @click="refreshQuote">
            {{ quoteLoading ? 'Querying pair…' : 'Get live quote' }}
          </button>
        </div>

        <div v-else class="mt-6 rounded-2xl bg-black/20 p-5 text-sm text-grey-100">
          No verified pools are in the launch registry yet. Add real pair contracts to <code>public/dex/registry.juno-1.json</code> or set <code>NUXT_PUBLIC_JUNO_DEX_REGISTRY_URL</code>.
        </div>
      </article>

      <aside class="space-y-6">
        <div class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
          <h3 class="font-neue-haas text-2xl text-beige-100">
            Quote result
          </h3>

          <p v-if="quoteError" class="mt-4 rounded-2xl border border-salmon-200/20 bg-salmon-400/20 p-4 text-sm text-salmon-100">
            {{ quoteError }}
          </p>

          <dl v-if="quote" class="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <div class="rounded-2xl bg-brown-400 p-4">
              <dt class="text-grey-100">
                Return
              </dt>
              <dd class="mt-2 text-xl text-beige-100">
                {{ displayAmount(quote.return_amount, tokenById(swapDraft.askAssetId)) }}
              </dd>
            </div>
            <div class="rounded-2xl bg-brown-400 p-4">
              <dt class="text-grey-100">
                Minimum receive
              </dt>
              <dd class="mt-2 text-xl text-beige-100">
                {{ displayAmount(minReceive, tokenById(swapDraft.askAssetId)) }}
              </dd>
            </div>
            <div class="rounded-2xl bg-brown-400 p-4">
              <dt class="text-grey-100">
                Spread
              </dt>
              <dd class="mt-2 text-beige-100">
                {{ quote.spread_amount }}
              </dd>
            </div>
            <div class="rounded-2xl bg-brown-400 p-4">
              <dt class="text-grey-100">
                Commission
              </dt>
              <dd class="mt-2 text-beige-100">
                {{ quote.commission_amount }}
              </dd>
            </div>
          </dl>

          <p v-else class="mt-4 rounded-2xl bg-brown-400 p-4 text-sm text-grey-100">
            Select a registry pool and run a live quote. Wallet connection is only required before signing.
          </p>

          <p class="mt-4 text-xs text-grey-100">
            Wallet: {{ wallet ? wallet.address : 'not connected' }}
          </p>
        </div>

        <div class="rounded-[2rem] border border-beige-200/10 bg-black/30 p-6 lg:p-8">
          <h3 class="font-neue-haas text-2xl text-beige-100">
            Contract payloads
          </h3>
          <p class="mt-2 text-sm text-grey-100">
            Preview only until the user signs in Keplr.
          </p>

          <div class="mt-5 space-y-4">
            <div>
              <p class="mb-2 text-xs uppercase tracking-[0.2em] text-grey-100">
                Factory pair query
              </p>
              <pre class="overflow-auto rounded-2xl bg-brown-500 p-4 text-xs text-cyan-100">{{ pairQueryPreview }}</pre>
            </div>
            <div>
              <p class="mb-2 text-xs uppercase tracking-[0.2em] text-grey-100">
                Pair swap execute
              </p>
              <pre class="overflow-auto rounded-2xl bg-brown-500 p-4 text-xs text-salmon-100">{{ swapMsgPreview }}</pre>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </DexAppShell>
</template>
