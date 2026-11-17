import { ref, watch } from 'vue'
import { translations } from './translations.js'

const STORAGE_KEY = 'localminidrama:interface-language'
const SUPPORTED = new Set(['ru', 'en', 'zh'])

function readSavedLanguage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return SUPPORTED.has(saved) ? saved : 'ru'
  } catch {
    return 'ru'
  }
}

export const language = ref(readSavedLanguage())

export function setLanguage(next) {
  if (!SUPPORTED.has(next)) return
  language.value = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // The interface still works when storage is unavailable.
  }
}

const chinese = /[\u3400-\u9fff]/
const words = Object.keys(translations)
  .filter((key) => key.length >= 4)
  .sort((a, b) => b.length - a.length)

export function translate(source, target = language.value) {
  if (target === 'zh' || !source || !chinese.test(source)) return source

  // Keep spaces around inline labels. Only known UI strings are translated.
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(source)
  const [, prefix, text, suffix] = match
  const exact = translations[text]?.[target]
  if (exact) return prefix + exact + suffix

  // Legacy screens contain many longer messages assembled from smaller labels.
  // Only replace longer, known phrases; unknown content stays untouched.
  let result = text
  for (const key of words) {
    const replacement = translations[key][target]
    if (replacement && result.includes(key)) result = result.split(key).join(replacement)
  }
  return prefix + result + suffix
}

// Progressive support for legacy Chinese Vue templates. New screens should
// call translate() directly instead of depending on the DOM adapter.
const EXCLUDED = 'script,style,textarea,pre,code,[contenteditable],.monaco-editor,.cm-editor,.CodeMirror,.ProseMirror,.ace_editor,.el-textarea__inner,.project-title,.project-desc'
const ATTRIBUTES = ['title', 'placeholder', 'aria-label']
const textSources = new WeakMap()
const attributeSources = new WeakMap()

function excluded(node) {
  const el = node.nodeType === 1 ? node : node.parentElement
  return Boolean(el?.closest(EXCLUDED))
}

function localizeText(node) {
  if (excluded(node)) return
  const current = node.nodeValue || ''
  const previous = textSources.get(node)
  const source = previous && current === previous.rendered ? previous.source : current
  if (!chinese.test(source)) return
  const rendered = translate(source)
  textSources.set(node, { source, rendered })
  if (current !== rendered) node.nodeValue = rendered
}

function localizeAttributes(element) {
  if (excluded(element)) return
  let attrs = attributeSources.get(element)
  if (!attrs) {
    attrs = new Map()
    attributeSources.set(element, attrs)
  }
  for (const name of ATTRIBUTES) {
    const current = element.getAttribute(name)
    if (current == null) continue
    const previous = attrs.get(name)
    const source = previous && current === previous.rendered ? previous.source : current
    if (!chinese.test(source)) continue
    const rendered = translate(source)
    attrs.set(name, { source, rendered })
    if (rendered !== current) element.setAttribute(name, rendered)
  }
}

function scan(root) {
  if (root.nodeType === 3) {
    localizeText(root)
    return
  }
  if (root.nodeType !== 1 || excluded(root)) return
  localizeAttributes(root)
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  )
  while (walker.nextNode()) {
    const node = walker.currentNode
    if (node.nodeType === 3) localizeText(node)
    else localizeAttributes(node)
  }
}

export function startInterfaceLocalization() {
  const root = document.documentElement
  document.documentElement.lang = language.value
  scan(root)

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') {
        localizeText(record.target)
      } else if (record.type === 'attributes') {
        localizeAttributes(record.target)
      } else {
        for (const node of record.addedNodes) scan(node)
      }
    }
  })
  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ATTRIBUTES,
  })
  const stopWatch = watch(language, () => {
    document.documentElement.lang = language.value
    scan(root)
  })
  return () => {
    observer.disconnect()
    stopWatch()
  }
}
