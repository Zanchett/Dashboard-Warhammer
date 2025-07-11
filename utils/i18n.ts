"use client"

import { useState, useEffect } from "react"

type TranslationKey = string
type TranslationValue = string | ((args: Record<string, string | number>) => string)
type Translations = Record<TranslationKey, TranslationValue>

const translationsCache: { [key: string]: Translations } = {}

export function useTranslation(namespace = "translation") {
  const [currentLocale, setCurrentLocale] = useState("en") // Default locale
  const [translations, setTranslations] = useState<Translations>({})

  useEffect(() => {
    const loadTranslations = async () => {
      if (translationsCache[currentLocale]?.[namespace]) {
        setTranslations(translationsCache[currentLocale][namespace])
        return
      }

      try {
        const response = await fetch(`/locales/${currentLocale}/${namespace}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load translations for ${currentLocale}/${namespace}.json`)
        }
        const data: Translations = await response.json()
        if (!translationsCache[currentLocale]) {
          translationsCache[currentLocale] = {}
        }
        translationsCache[currentLocale][namespace] = data
        setTranslations(data)
      } catch (error) {
        console.error("Error loading translations:", error)
        // Fallback to empty translations or default English if loading fails
        setTranslations({})
      }
    }

    loadTranslations()
  }, [currentLocale, namespace])

  const t = (key: TranslationKey, args?: Record<string, string | number>): string => {
    const value = translations[key]
    if (typeof value === "function") {
      return value(args || {})
    }
    let translatedText = typeof value === "string" ? value : key

    if (args) {
      for (const argKey in args) {
        translatedText = translatedText.replace(new RegExp(`{{${argKey}}}`, "g"), String(args[argKey]))
      }
    }
    return translatedText
  }

  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale)
  }

  return { t, currentLocale, changeLanguage }
}
