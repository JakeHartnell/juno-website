#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const [, , inputArg = 'docs/storyblok-agent-heartbeat-entry-draft.json', outputArg = 'docs/storyblok-agent-heartbeat-preview.html'] = process.argv
const inputPath = resolve(inputArg)
const outputPath = resolve(outputArg)

const story = JSON.parse(await readFile(inputPath, 'utf8'))
const root = story.content ?? story

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const richTextToPlain = (node) => {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(richTextToPlain).join(node.type === 'paragraph' ? ' ' : '')
}

const slug = (value = 'unknown') => String(value).replaceAll(/[^a-z0-9_-]/gi, '-').toLowerCase()
const componentClass = (blok) => {
  const base = `sb-${slug(blok.component)}`
  return blok.variant ? `${base} ${base}--${slug(blok.variant)}` : base
}

const renderBlok = (blok) => {
  const uid = escapeHtml(blok._uid ?? '')
  const attrs = `class="${componentClass(blok)}" data-component="${escapeHtml(blok.component ?? '')}" data-uid="${uid}"`

  switch (blok.component) {
    case 'AppSection':
      return `<section ${attrs}>${renderBody(blok.body)}</section>`
    case 'AppHeadline': {
      const tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(blok.element) ? blok.element : 'p'
      return `<${tag} ${attrs}>${escapeHtml(blok.text ?? '')}</${tag}>`
    }
    case 'RichText':
      return `<p ${attrs}>${escapeHtml(richTextToPlain(blok.body))}</p>`
    case 'AppGrid':
      return `<div ${attrs}>${renderBody(blok.body)}</div>`
    case 'GridItem':
      return `<article ${attrs}>${renderBody(blok.body)}</article>`
    case 'AppInfobox':
      return `<div ${attrs}>${renderBody(blok.headline)}<p>${escapeHtml(blok.text ?? '')}</p></div>`
    case 'AppButton': {
      const href = escapeHtml(blok.link?.url ?? '#')
      return `<a ${attrs} href="${href}">${escapeHtml(blok.text ?? 'Button')}</a>`
    }
    default:
      return `<div ${attrs}>${renderBody(blok.body)}</div>`
  }
}

const renderBody = (body = []) => body.map(renderBlok).join('\n')
const componentCounts = {}
const collect = (blok) => {
  componentCounts[blok.component] = (componentCounts[blok.component] ?? 0) + 1
  for (const key of ['body', 'headline']) {
    if (Array.isArray(blok[key])) blok[key].forEach(collect)
  }
}
collect(root)

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(story.name ?? 'Storyblok fixture preview')}</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #140f0c; color: #fff7ed; }
    body { margin: 0; padding: 32px; }
    .fixture-meta { max-width: 1040px; margin: 0 auto 24px; color: #d6c1ad; font-size: 14px; }
    .sb-appsection { max-width: 1040px; margin: 0 auto; padding: 48px; border: 1px solid #8b5e3c; border-radius: 28px; background: linear-gradient(135deg, #3b2418, #19110d); box-shadow: 0 20px 80px rgba(0,0,0,.35); }
    .sb-appheadline { margin: 0 0 16px; }
    h2.sb-appheadline { max-width: 720px; font-size: clamp(40px, 7vw, 80px); line-height: .95; letter-spacing: -0.06em; }
    p.sb-appheadline { color: #f59e0b; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .sb-richtext { max-width: 760px; color: #f4dcc8; font-size: 18px; line-height: 1.65; }
    .sb-appgrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin: 32px 0; }
    .sb-appinfobox { min-height: 150px; padding: 24px; border: 1px solid rgba(245,158,11,.35); border-radius: 20px; background: rgba(255,255,255,.06); }
    .sb-appinfobox p { color: #ead7c7; line-height: 1.5; }
    .sb-appbutton { display: inline-flex; margin-right: 12px; margin-bottom: 12px; padding: 14px 20px; border-radius: 999px; background: #f59e0b; color: #160f0a; font-weight: 800; text-decoration: none; }
    .sb-appbutton--secondary { border: 1px solid rgba(245,158,11,.55); background: transparent; color: #fff7ed; }
    @media (max-width: 760px) { body { padding: 16px; } .sb-appsection { padding: 28px; } .sb-appgrid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="fixture-meta">
    <strong>Local Storyblok fixture preview.</strong>
    Source: ${escapeHtml(inputArg)} · Components: ${escapeHtml(JSON.stringify(componentCounts))}
  </div>
  ${renderBlok(root)}
</body>
</html>
`

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, html)
console.log(`OK: rendered Storyblok fixture preview to ${outputArg}`)
console.log(`components=${JSON.stringify(componentCounts)}`)
