import test from 'node:test'
import assert from 'node:assert/strict'
import { language, setLanguage, translate } from '../src/localization/index.js'

test('Russian translations for the home screen', () => {
  assert.equal(translate('本地短剧助手', 'ru'), 'Студия мини-сериалов')
  assert.equal(translate('快速开始', 'ru'), 'Быстрый старт')
  assert.equal(translate('  新建项目  ', 'ru'), '  Новый проект  ')
})

test('English and original Chinese are available', () => {
  assert.equal(translate('导入项目', 'en'), 'Import project')
  assert.equal(translate('导入项目', 'zh'), '导入项目')
})

test('Missing translations and authored content are not erased', () => {
  assert.equal(translate('不存在的独特短语', 'ru'), '不存在的独特短语')
  assert.equal(translate('My Project', 'ru'), 'My Project')
})

test('Language selection is reactive and rejects invalid values', () => {
  setLanguage('en')
  assert.equal(language.value, 'en')
  assert.equal(translate('保存'), 'Save')
  setLanguage('invalid')
  assert.equal(language.value, 'en')
  setLanguage('ru')
  assert.equal(language.value, 'ru')
})
