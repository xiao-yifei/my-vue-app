import { ref } from 'vue'

const THEME_KEY = 'appTheme'

function getStored() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

const theme = ref(getStored())

export function useTheme() {
  function setTheme(value) {
    const v = value === 'light' ? 'light' : 'dark'
    theme.value = v
    try {
      localStorage.setItem(THEME_KEY, v)
    } catch (_) {}
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
