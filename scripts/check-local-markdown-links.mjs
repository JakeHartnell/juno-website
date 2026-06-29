#!/usr/bin/env node
import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, join, normalize, resolve } from 'node:path'

const repoRoot = process.cwd()
const args = process.argv.slice(2)
const scanAll = args.includes('--all')
const files = args.filter((arg) => arg !== '--all')
const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g
let failures = 0
let checked = 0

const collectMarkdownFiles = async (dir) => {
  const entries = await readdir(resolve(repoRoot, dir), { withFileTypes: true })
  const found = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...await collectMarkdownFiles(path))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      found.push(path)
    }
  }

  return found
}

if (scanAll) {
  files.push('README.md')
  files.push(...await collectMarkdownFiles('docs'))
} else if (files.length === 0) {
  files.push('README.md')
}

const isExternal = (href) => /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#') || href.startsWith('mailto:')

for (const file of files) {
  const absoluteFile = resolve(repoRoot, file)
  const text = await readFile(absoluteFile, 'utf8')
  const baseDir = dirname(absoluteFile)

  for (const match of text.matchAll(markdownLinkPattern)) {
    const href = match[1].trim()
    if (!href || isExternal(href)) continue

    const [pathPart] = href.split('#')
    if (!pathPart) continue

    checked += 1
    const target = normalize(join(baseDir, decodeURIComponent(pathPart)))
    try {
      await access(target)
    } catch {
      failures += 1
      console.error(`BROKEN ${file}: ${href} -> ${target}`)
    }
  }
}

if (failures > 0) {
  console.error(`FAIL: ${failures}/${checked} local markdown links missing`)
  process.exit(1)
}

console.log(`OK: ${checked} local markdown links resolve across ${files.length} file(s)`)
