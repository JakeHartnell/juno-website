#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const validator = path.join(root, 'scripts/validate-defi-registry.mjs')
const tmp = mkdtempSync(path.join(tmpdir(), 'juno-defi-registry-'))

const baseRegistry = {
  chainId: 'juno-1',
  factory: 'juno1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  updatedAt: '2026-06-29T00:00:00Z',
  pools: [
    {
      label: 'JUNO / USDC',
      pair: 'juno1pppppppppppppppppppppppppppppppppppppp',
      lpToken: 'factory/juno1pppppppppppppppppppppppppppppppppppppp/astroport/share',
      type: 'xyk',
      feeBps: 30,
      assets: [
        { kind: 'native', id: 'ujuno', symbol: 'JUNO', decimals: 6 },
        { kind: 'ibc', id: `ibc/${'A'.repeat(64)}`, symbol: 'USDC', decimals: 6 },
      ],
      explorer: 'https://www.mintscan.io/juno/wasm/contract/juno1pppppppppppppppppppppppppppppppppppppp',
      notes: 'Test fixture: placeholders are allowed outside strict mode.',
    },
  ],
}

const writeFixture = (name, registry) => {
  const file = path.join(tmp, name)
  writeFileSync(file, `${JSON.stringify(registry, null, 2)}\n`)
  return file
}

const run = (args) => spawnSync(process.execPath, [validator, ...args], {
  cwd: root,
  encoding: 'utf8',
})

try {
  const valid = writeFixture('valid-placeholder.json', baseRegistry)
  const validResult = run([valid])
  assert.equal(validResult.status, 0, validResult.stderr || validResult.stdout)
  assert.match(validResult.stdout, /ok: juno-1 registry has 1 pool\(s\), 1 unique pair contract\(s\)/)

  const strictResult = run(['--strict', valid])
  assert.equal(strictResult.status, 1, strictResult.stderr || strictResult.stdout)
  assert.match(strictResult.stderr, /factory must be a verified mainnet value/)

  const duplicateAsset = structuredClone(baseRegistry)
  duplicateAsset.pools[0].assets[1] = { kind: 'native', id: 'ujuno', symbol: 'JUNO2', decimals: 6 }
  const duplicateAssetResult = run([writeFixture('duplicate-assets.json', duplicateAsset)])
  assert.equal(duplicateAssetResult.status, 1, duplicateAssetResult.stderr || duplicateAssetResult.stdout)
  assert.match(duplicateAssetResult.stderr, /assets must contain two distinct asset ids/)

  const duplicatePair = structuredClone(baseRegistry)
  duplicatePair.pools.push(structuredClone(baseRegistry.pools[0]))
  duplicatePair.pools[1].label = 'JUNO / USDC duplicate'
  const duplicatePairResult = run([writeFixture('duplicate-pair.json', duplicatePair)])
  assert.equal(duplicatePairResult.status, 1, duplicatePairResult.stderr || duplicatePairResult.stdout)
  assert.match(duplicatePairResult.stderr, /pair duplicates another pool/)

  const strictRouter = structuredClone(baseRegistry)
  strictRouter.factory = 'juno1abcdefabcdefabcdefabcdefabcdefabcdefab'
  strictRouter.pools[0].pair = 'juno1bcdefabcdefabcdefabcdefabcdefabcdefabc'
  strictRouter.pools[0].lpToken = 'factory/juno1bcdefabcdefabcdefabcdefabcdefabcdefabc/astroport/share'
  strictRouter.pools[0].assets[1].id = `ibc/${'B'.repeat(64)}`
  strictRouter.pools[0].explorer = 'https://www.mintscan.io/juno/wasm/contract/juno1bcdefabcdefabcdefabcdefabcdefabcdefabc'
  strictRouter.router = 'juno1rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'
  const strictRouterResult = run(['--strict', writeFixture('strict-router-placeholder.json', strictRouter)])
  assert.equal(strictRouterResult.status, 1, strictRouterResult.stderr || strictRouterResult.stdout)
  assert.match(strictRouterResult.stderr, /router must be a verified mainnet value/)

  const scopeCreep = structuredClone(baseRegistry)
  scopeCreep.pools[0].incentives = []
  const scopeResult = run([writeFixture('scope-creep.json', scopeCreep)])
  assert.equal(scopeResult.status, 1, scopeResult.stderr || scopeResult.stdout)
  assert.match(scopeResult.stderr, /incentives is not allowed by the minimal registry shape/)

  console.log('ok: validator smoke tests passed (valid, strict placeholders, duplicate assets, duplicate pairs, strict router, scope guard)')
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
