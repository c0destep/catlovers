import Translator from "@andreasremdt/simple-translator"
import portuguese from "../languages/pt_BR.json"
import english from "../languages/en_US.json"
import spanish from "../languages/es_ES.json"

// --- State and Config ---
const THEME_KEY = "preferred_theme"
const LANG_KEY = "preferred_language"
const supportedLanguages = ["pt_BR", "en_US", "es_ES"]
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)")

// --- DOM Elements ---
const themeToggle = document.querySelector(".theme-toggle")
const languageButtons = document.querySelectorAll(".language-switch__button, .language-dropdown__option")
const languageDropdown = document.querySelector(".language-dropdown")
const languageDropdownTrigger = document.querySelector(".language-dropdown__trigger")
const languageDropdownMenu = document.querySelector(".language-dropdown__menu")
const backTop = document.getElementById("backTop")
const nav = document.querySelector("nav")
const toggleButton = document.querySelector(".navbar__toggle--button")

// --- Functions ---

/**
 * Applies the selected theme (light/dark)
 */
const applyTheme = (theme, persist = true) => {
  const resolvedTheme = theme === "dark" ? "dark" : "light"
  document.documentElement.dataset.theme = resolvedTheme
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", resolvedTheme === "dark")
  }
  if (persist) {
    localStorage.setItem(THEME_KEY, resolvedTheme)
  } else {
    localStorage.removeItem(THEME_KEY)
  }
}

/**
 * Determines the user's theme preference
 */
const resolveThemePreference = () => {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme
  }
  return systemPrefersDark.matches ? "dark" : "light"
}

/**
 * Maps language code to HTML lang attribute
 */
const toHtmlLang = (language) => {
  const mapping = {
    "en_US": "en-US",
    "es_ES": "es-ES",
    "pt_BR": "pt-BR"
  }
  return mapping[language] || "pt-BR"
}

/**
 * Resolves the initial language based on saved preference or browser settings
 */
const resolveLanguage = () => {
  const preferredLanguage = localStorage.getItem(LANG_KEY)
  if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
    return preferredLanguage
  }
  const browserLanguage = (navigator.language || "").toLowerCase()
  if (browserLanguage.startsWith("es")) return "es_ES"
  if (browserLanguage.startsWith("en")) return "en_US"
  return "pt_BR"
}

/**
 * Updates UI state for active language
 */
const setActiveLanguageButton = (language) => {
  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === language)
    button.setAttribute("aria-pressed", button.dataset.language === language)
  })
  if (languageDropdown) {
    languageDropdown.querySelectorAll(".language-dropdown__option").forEach((option) => {
      option.setAttribute("aria-selected", option.dataset.language === language)
    })
  }
  document.documentElement.lang = toHtmlLang(language)
}

const closeLanguageDropdown = () => {
  if (!languageDropdown || !languageDropdownTrigger) return
  languageDropdown.classList.remove("is-open")
  languageDropdownTrigger.setAttribute("aria-expanded", "false")
}

const toggleLanguageDropdown = () => {
  if (!languageDropdown || !languageDropdownTrigger || !languageDropdownMenu) return
  const isOpen = languageDropdown.classList.contains("is-open")
  if (isOpen) {
    closeLanguageDropdown()
  } else {
    languageDropdown.classList.add("is-open")
    languageDropdownTrigger.setAttribute("aria-expanded", "true")
    languageDropdownMenu.focus()
  }
}

const handleScroll = () => {
  if (!backTop) return
  if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
    backTop.classList.add("page-top__visible")
  } else {
    backTop.classList.remove("page-top__visible")
  }
}

// --- Initialization ---

// 1. Theme
applyTheme(resolveThemePreference(), Boolean(localStorage.getItem(THEME_KEY)))

// 2. Internationalization
const translator = new Translator({
  defaultLanguage: "pt_BR",
  detectLanguage: true,
  persist: true,
  persistKey: LANG_KEY
})

translator
  .add("pt_BR", portuguese)
  .add("en_US", english)
  .add("es_ES", spanish)

const initialLanguage = resolveLanguage()
translator.translatePageTo(initialLanguage)
setActiveLanguageButton(initialLanguage)

// --- Event Listeners ---

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetLanguage = button.dataset.language
    if (targetLanguage) {
      translator.translatePageTo(targetLanguage)
      localStorage.setItem(LANG_KEY, targetLanguage)
      setActiveLanguageButton(targetLanguage)
      closeLanguageDropdown()
    }
  })
})

if (languageDropdownTrigger) {
  languageDropdownTrigger.addEventListener("click", (event) => {
    event.stopPropagation()
    toggleLanguageDropdown()
  })
}

document.addEventListener("click", (event) => {
  if (languageDropdown && !languageDropdown.contains(event.target)) {
    closeLanguageDropdown()
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLanguageDropdown()
  }
})

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme
    applyTheme(currentTheme === "dark" ? "light" : "dark", true)
  })
}

systemPrefersDark.addEventListener("change", (event) => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(event.matches ? "dark" : "light", false)
  }
})

window.addEventListener("scroll", handleScroll)
handleScroll()

if (backTop) {
  backTop.addEventListener("click", (event) => {
    event.preventDefault()
    window.scrollTo({top: 0, behavior: "smooth"})
  })
}

if (toggleButton && nav) {
  toggleButton.addEventListener("click", () => {
    nav.classList.toggle("navbar--open")
    toggleButton.setAttribute("aria-expanded", nav.classList.contains("navbar--open"))
  })
}
