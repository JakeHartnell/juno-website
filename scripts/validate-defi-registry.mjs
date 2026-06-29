#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const strict = args.includes('--strict')
const registryPath = args.find((arg) => !arg.startsWith('--')) ?? 'docs/defi-v1-pool-registry.example.json'
const absolute = path.resolve(process.cwd(), registryPath)

const fail = (message) => {
  console.error(`registry validation failed: ${message}`)
  process.exit(1)
}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const junoAddress = /^juno1[0-9a-z]{38,58}$/
const nativeDenom = /^[a-z][a-z0-9/:._-]{2,127}$/
const ibcDenom = /^ibc\/[A-F0-9]{64}$/
const assetKinds = new Set(['native', 'ibc', 'cw20'])
const poolTypes = new Set(['xyk', 'stable'])
const placeholderPatterns = [
  /juno1([0-9a-z])\1{37,57}/,
  /juno1q{38,58}/,
  /juno1p{38,58}/,
  /ibc\/A{64}/,
]
const allowedTopLevelKeys = new Set(['chainId', 'factory', 'router', 'updatedAt', 'pools'])
const allowedPoolKeys = new Set(['label', 'pair', 'lpToken', 'type', 'feeBps', 'assets', 'explorer', 'notes'])
const allowedAssetKeys = new Set(['kind', 'id', 'symbol', 'decimals'])
const hasPlaceholder = (value) => typeof value === 'string' && placeholderPatterns.some((pattern) => pattern.test(value))
const strictValue = (label, value) => {
  if (strict && hasPlaceholder(value)) fail(`${label} must be a verified mainnet value, not a placeholder`)
}
const rejectUnknownKeys = (label, object, allowedKeys) => {
  for (const key of Object.keys(object)) {
    if (!allowedKeys.has(key)) fail(`${label}.${key} is not allowed by the minimal registry shape`)
  }
}

if (!fs.existsSync(absolute)) fail(`file not found: ${registryPath}`)

let registry
try {
  registry = JSON.parse(fs.readFileSync(absolute, 'utf8'))
} catch (error) {
  fail(`invalid JSON: ${error.message}`)
}

if (!isObject(registry)) fail('top-level registry must be an object')
rejectUnknownKeys('registry', registry, allowedTopLevelKeys)
if (registry.chainId !== 'juno-1') fail('chainId must be juno-1')
if (!junoAddress.test(registry.factory)) fail('factory must be a juno contract address')
strictValue('factory', registry.factory)
if (registry.router !== undefined && !junoAddress.test(registry.router)) fail('router must be a juno contract address when present')
if (registry.router !== undefined) strictValue('router', registry.router)
if (strict && registry.updatedAt === undefined) fail('updatedAt is required in strict mode')
if (registry.updatedAt !== undefined && Number.isNaN(Date.parse(registry.updatedAt))) fail('updatedAt must parse as a date-time')
if (!Array.isArray(registry.pools) || registry.pools.length === 0) fail('pools must be a non-empty array')

const seenPairs = new Set()
for (const [index, pool] of registry.pools.entries()) {
  const label = `pools[${index}]`
  if (!isObject(pool)) fail(`${label} must be an object`)
  rejectUnknownKeys(label, pool, allowedPoolKeys)
  if (typeof pool.label !== 'string' || pool.label.length < 3) fail(`${label}.label must be at least 3 chars`)
  if (!junoAddress.test(pool.pair)) fail(`${label}.pair must be a juno contract address`)
  strictValue(`${label}.pair`, pool.pair)
  if (seenPairs.has(pool.pair)) fail(`${label}.pair duplicates another pool`)
  seenPairs.add(pool.pair)
  if (!(junoAddress.test(pool.lpToken) || nativeDenom.test(pool.lpToken) || ibcDenom.test(pool.lpToken))) fail(`${label}.lpToken must be a juno address, native denom, or IBC denom`)
  strictValue(`${label}.lpToken`, pool.lpToken)
  if (!poolTypes.has(pool.type)) fail(`${label}.type must be xyk or stable`)
  if (pool.feeBps !== undefined && (!Number.isInteger(pool.feeBps) || pool.feeBps < 0 || pool.feeBps > 10000)) fail(`${label}.feeBps must be 0..10000`)
  if (!Array.isArray(pool.assets) || pool.assets.length !== 2) fail(`${label}.assets must contain exactly two assets`)
  const seenAssetIds = new Set()
  for (const [assetIndex, asset] of pool.assets.entries()) {
    const assetLabel = `${label}.assets[${assetIndex}]`
    if (!isObject(asset)) fail(`${assetLabel} must be an object`)
    rejectUnknownKeys(assetLabel, asset, allowedAssetKeys)
    if (!assetKinds.has(asset.kind)) fail(`${assetLabel}.kind must be native, ibc, or cw20`)
    if (!(junoAddress.test(asset.id) || nativeDenom.test(asset.id) || ibcDenom.test(asset.id))) fail(`${assetLabel}.id must be a juno address, native denom, or IBC denom`)
    strictValue(`${assetLabel}.id`, asset.id)
    if (asset.kind === 'native' && !nativeDenom.test(asset.id)) fail(`${assetLabel}.id must be a native denom when kind is native`)
    if (asset.kind === 'ibc' && !ibcDenom.test(asset.id)) fail(`${assetLabel}.id must be an IBC denom when kind is ibc`)
    if (asset.kind === 'cw20' && !junoAddress.test(asset.id)) fail(`${assetLabel}.id must be a Juno contract address when kind is cw20`)
    if (seenAssetIds.has(asset.id)) fail(`${label}.assets must contain two distinct asset ids`)
    seenAssetIds.add(asset.id)
    if (typeof asset.symbol !== 'string' || asset.symbol.length < 2 || asset.symbol.length > 16) fail(`${assetLabel}.symbol must be 2..16 chars`)
    if (!Number.isInteger(asset.decimals) || asset.decimals < 0 || asset.decimals > 18) fail(`${assetLabel}.decimals must be 0..18`)
  }
  if (strict && pool.explorer === undefined) fail(`${label}.explorer is required in strict mode`)
  if (pool.explorer !== undefined) {
    try { new URL(pool.explorer) } catch { fail(`${label}.explorer must be a URI`) }
  }
}

console.log(`ok: ${registry.chainId} registry has ${registry.pools.length} pool(s), ${seenPairs.size} unique pair contract(s)`)
