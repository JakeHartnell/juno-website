#!/usr/bin/env node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const [, , inputArg = 'docs/storyblok-agent-heartbeat-entry-draft.json'] = process.argv
const inputPath = resolve(inputArg)
const story = JSON.parse(await readFile(inputPath, 'utf8'))
const root = story.content ?? story

const errors = []
const warnings = []
const componentCounts = {}
const texts = []
const buttons = []

const visit = (blok, path = 'content') => {
  if (!blok || typeof blok !== 'object') {
    errors.push(`${path}: expected Storyblok object`)
    return
  }

  if (!blok.component) errors.push(`${path}: missing component`)
  if (!blok._uid) warnings.push(`${path}: missing _uid`)

  componentCounts[blok.component] = (componentCounts[blok.component] ?? 0) + 1

  if (typeof blok.text === 'string') texts.push(blok.text)
  if (blok.component === 'AppButton') {
    buttons.push({ text: blok.text ?? '', url: blok.link?.url ?? '', path })
  }

  for (const key of ['body', 'headline']) {
    if (Array.isArray(blok[key])) {
      blok[key].forEach((child, index) => visit(child, `${path}.${key}[${index}]`))
    }
  }
}

visit(root)

const requireComponent = (name, min = 1) => {
  if ((componentCounts[name] ?? 0) < min) {
    errors.push(`expected at least ${min} ${name} component(s), found ${componentCounts[name] ?? 0}`)
  }
}

requireComponent('AppSection')
requireComponent('AppHeadline', 2)
requireComponent('RichText')
requireComponent('AppGrid')
requireComponent('GridItem', 3)
requireComponent('AppInfobox', 3)
requireComponent('AppButton', 2)

const combinedText = texts.join(' ').toLowerCase()
for (const phrase of ['agent', 'governance', 'voters']) {
  if (!combinedText.includes(phrase)) {
    errors.push(`copy should include governance-boundary phrase: ${phrase}`)
  }
}

for (const expected of [
  ['Run a Juno agent', '/docs/run-a-juno-agent.md'],
  ['Browse agent heartbeats', '/docs/agent-heartbeat-index.md'],
]) {
  const [text, url] = expected
  const match = buttons.find((button) => button.text === text)
  if (!match) {
    errors.push(`missing CTA button: ${text}`)
  } else if (match.url !== url) {
    errors.push(`CTA ${text} should point to ${url}, found ${match.url || '(empty)'}`)
  }
}

if (!story.notes?.governanceBoundary) {
  errors.push('missing notes.governanceBoundary for importer context')
}

if (errors.length) {
  console.error(`FAIL: ${inputArg}`)
  for (const error of errors) console.error(`- ${error}`)
  if (warnings.length) {
    console.error('warnings:')
    for (const warning of warnings) console.error(`- ${warning}`)
  }
  process.exit(1)
}

console.log(`OK: ${inputArg} passes heartbeat fixture checks`)
console.log(`components=${JSON.stringify(componentCounts)}`)
if (warnings.length) {
  console.log(`warnings=${JSON.stringify(warnings)}`)
}
