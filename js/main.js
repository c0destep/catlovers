import Translator from "@andreasremdt/simple-translator"
import portuguese from "../languages/pt_BR.json"
import english from "../languages/en_US.json"
import spanish from "../languages/es_ES.json"

// Import helpers
import { translationHelper } from "./translation-helper.js"
import { throttleHelper } from "./throttle-helper.js"

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
 * Applies the selected theme (light/dark) to the document
 * @param { 'dark' | 'light' } theme - The theme to apply
 * @param { boolean } [persist=true] - Whether to save the preference to localStorage
 */
const applyTheme = (theme, persist = true) => {
  const resolvedTheme = theme === "dark" ? "dark" : "light"
  document.documentElement.dataset.theme = resolvedTheme
  themeToggle?.setAttribute("aria-pressed", resolvedTheme === "dark")
  if (persist) {
    localStorage.setItem(THEME_KEY, resolvedTheme)
  } else {
    localStorage.removeItem(THEME_KEY)
  }
}

/**
 * Determines the user's theme preference from localStorage or system settings
 * @returns { 'dark' | 'light' } The resolved theme preference
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
 * @param { string } language - The language code (e.g., 'pt_BR')
 * @returns { string } The BCP 47 language tag
 */
const toHtmlLang = (language) => {
  const mapping = {
    "en_US": "en-US",
    "es_ES": "es-ES",
    "pt_BR": "pt-BR"
  }
  return mapping[language] ?? "pt-BR"
}

/**
 * Resolves the initial language based on saved preference or browser settings
 * @returns { string } The resolved language code
 */
const resolveLanguage = () => {
  const preferredLanguage = localStorage.getItem(LANG_KEY)
  if (preferredLanguage && supportedLanguages.includes(preferredLanguage)) {
    return preferredLanguage
  }
  const browserLanguage = (navigator.language ?? "").toLowerCase()
  if (browserLanguage.startsWith("es")) return "es_ES"
  if (browserLanguage.startsWith("en")) return "en_US"
  return "pt_BR"
}

/**
 * Updates UI state for active language button and dropdown
 * @param { string } language - The language code to set as active
 */
const setActiveLanguageButton = (language) => {
  languageButtons.forEach((button) => {
    const isActive = button.dataset.language === language
    button.classList.toggle("is-active", isActive)
    button.setAttribute("aria-pressed", isActive)
  })
  if (languageDropdown) {
    languageDropdown.querySelectorAll(".language-dropdown__option").forEach((option) => {
      option.setAttribute("aria-selected", option.dataset.language === language)
    })
  }
  document.documentElement.lang = toHtmlLang(language)
}

/**
 * Closes the language dropdown menu
 */
const closeLanguageDropdown = () => {
  languageDropdown?.classList.remove("is-open")
  languageDropdownTrigger?.setAttribute("aria-expanded", "false")
}

/**
 * Toggles the language dropdown menu open/closed
 */
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

/**
 * Handles scroll events to show/hide back-to-top button
 */
const handleScroll = () => {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop
  if (scrollTop > 300) {
    backTop?.classList.add("page-top__visible")
  } else {
    backTop?.classList.remove("page-top__visible")
  }
}

// --- Initialization ---

// 1. Internationalization (MUST be first - translationHelper depends on it)
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

// Expose translator globally BEFORE using translationHelper
window.catloversTranslator = translator;

const initialLanguage = resolveLanguage()
translationHelper.translatePage(initialLanguage)
setActiveLanguageButton(initialLanguage)

// 2. Theme
applyTheme(resolveThemePreference(), Boolean(localStorage.getItem(THEME_KEY)))

// --- Event Listeners ---

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetLanguage = button.dataset.language
    if (targetLanguage) {
      translationHelper.translatePage(targetLanguage)
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

// Throttle scroll event to improve performance
const throttledHandleScroll = throttleHelper.throttle(handleScroll, 100)
window.addEventListener("scroll", throttledHandleScroll)
throttledHandleScroll()

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

/**
 * Global error handler for uncaught errors
 * @param {ErrorEvent} errorEvent
 */
const globalErrorHandler = (errorEvent) => {
  console.error('[Global Error]', errorEvent.error || errorEvent.message);
  // Could send to error tracking service here
  // Example: sendErrorToAnalytics(errorEvent.error);
};

/**
 * Global unhandled rejection handler
 * @param {PromiseRejectionEvent} rejectionEvent
 */
const globalRejectionHandler = (rejectionEvent) => {
  console.error('[Unhandled Promise Rejection]', rejectionEvent.reason);
  // Could send to error tracking service here
};

// Register global error handlers
window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', globalRejectionHandler);

// --- Scroll Animations with IntersectionObserver ---
/**
 * Initializes scroll-triggered animations using IntersectionObserver
 */
const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (!('IntersectionObserver' in window) || animatedElements.length === 0) {
    // Fallback: show all elements immediately if Observer not supported
    animatedElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optionally unobserve after animation to improve performance
        animationObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => {
    animationObserver.observe(el);
  });
};

// Initialize scroll animations after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch((error) => {
      console.log('ServiceWorker registration failed: ', error);
    });
  });
}

// --- Active Menu Link ---
const highlightActiveMenuLink = () => {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll('.menu__link');
  
  menuLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
      link.classList.add('menu__link--active');
      link.setAttribute('aria-current', 'page');
    }
  });
};

document.addEventListener('DOMContentLoaded', highlightActiveMenuLink);
