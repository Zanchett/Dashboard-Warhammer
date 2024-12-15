import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      system: {
        title: "System",
        language: "Language"
      },
      dashboard: {
        title: "Dashboard",
        welcome: "Welcome to the Imperium's Dataslate",
        stats: {
          title: "Statistics",
          missions: "Missions Completed",
          rank: "Current Rank",
          experience: "Experience Points"
        }
      },
      common: {
        loading: "Loading...",
        error: "An error occurred",
        save: "Save",
        cancel: "Cancel"
      }
    }
  },
  'pt-BR': {
    translation: {
      system: {
        title: "Sistema",
        language: "Idioma"
      },
      dashboard: {
        title: "Painel de Controle",
        welcome: "Bem-vindo ao Dataslate do Imperium",
        stats: {
          title: "Estatísticas",
          missions: "Missões Concluídas",
          rank: "Classificação Atual",
          experience: "Pontos de Experiência"
        }
      },
      common: {
        loading: "Carregando...",
        error: "Ocorreu um erro",
        save: "Salvar",
        cancel: "Cancelar"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;

