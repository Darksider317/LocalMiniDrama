<template>
  <div class="interface-language">
    <span class="language-icon" aria-hidden="true">🌐</span>
    <select
      :value="language"
      :aria-label="labels[language]"
      :title="labels[language]"
      @change="setLanguage($event.target.value)"
    >
      <option value="ru">Русский</option>
      <option value="en">English</option>
      <option value="zh">中文</option>
    </select>
  </div>
</template>

<script setup>
import { language, setLanguage } from '@/localization'

const labels = {
  ru: 'Язык интерфейса',
  en: 'Interface language',
  zh: '界面语言',
}
</script>

<style scoped>
.interface-language {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 1800;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid var(--border-color, #4c4e6b);
  border-radius: 8px;
  color: var(--text-primary, #e9eaf7);
  background: var(--bg-card, #171727);
  box-shadow: 0 2px 12px rgba(0, 0, 0, .22);
  font-size: 13px;
}
.language-icon { font-size: 15px; }
.interface-language select {
  color: inherit;
  background: transparent;
  border: 0;
  outline-offset: 3px;
  font: inherit;
  cursor: pointer;
}
.interface-language option {
  color: #202033;
  background: white;
}
</style>
