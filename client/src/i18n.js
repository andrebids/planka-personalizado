/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import formatDate from 'date-fns/format';
import parseDate from 'date-fns/parse';
import {
  registerLocale as registerDatepickerLocale,
  setDefaultLocale as setDefaultDatepickerLocale,
} from 'react-datepicker';
import timeAgoDefaultLocale from 'javascript-time-ago/locale/en';
import TimeAgo from 'javascript-time-ago';
import ptPTLocale from 'javascript-time-ago/locale/pt-PT';
import { configure as configureMarkdownEditor } from '@gravity-ui/markdown-editor';
// eslint-disable-next-line import/no-unresolved
import { i18n as markdownEditorI18n } from '@gravity-ui/markdown-editor/_/i18n/i18n';

import { embeddedLocales, languages } from './locales';

const FALLBACK_LANGUAGE = 'pt-PT';

i18n.dateFns = {
  locales: {},
  init() {},
  addLocale(language, locale) {
    this.locales[language] = locale;
    registerDatepickerLocale(language, locale);
  },
  setLanguage(language) {
    setDefaultDatepickerLocale(language);
  },
  getLocale(language = i18n.resolvedLanguage) {
    return this.locales[language];
  },
  format(date, format, { language, ...options } = {}) {
    return formatDate(date, format, {
      locale: this.getLocale(language),
      ...options,
    });
  },
  parse(dateString, format, backupDate, { language, ...options } = {}) {
    return parseDate(dateString, format, backupDate, {
      locale: this.getLocale(language),
      ...options,
    });
  },
};

i18n.timeAgo = {
  init() {
    TimeAgo.addDefaultLocale(timeAgoDefaultLocale);
    // Adicionar o locale pt-PT explicitamente
    console.log('Registando locale pt-PT no i18n:', ptPTLocale);
    TimeAgo.addLocale(ptPTLocale);
  },
  addLocale(_, locale) {
    TimeAgo.addLocale(locale);
  },
  setLanguage() {},
};

i18n.markdownEditor = {
  init() {
    markdownEditorI18n.setFallbackLang(FALLBACK_LANGUAGE);

    // Verificar se o locale pt-PT está disponível antes de tentar registrá-lo
    try {
      if (
        embeddedLocales[FALLBACK_LANGUAGE] &&
        embeddedLocales[FALLBACK_LANGUAGE].markdownEditor
      ) {
        this.addLocale(
          FALLBACK_LANGUAGE,
          embeddedLocales[FALLBACK_LANGUAGE].markdownEditor
        );
        console.log('✅ Locale pt-PT registado com sucesso no markdown editor');
      } else {
        console.warn(
          '⚠️ Locale pt-PT não encontrado no markdown editor, usando fallback'
        );
        // Usar um locale alternativo como fallback
        const fallbackLocale = 'en-US';
        if (
          embeddedLocales[fallbackLocale] &&
          embeddedLocales[fallbackLocale].markdownEditor
        ) {
          this.addLocale(
            FALLBACK_LANGUAGE,
            embeddedLocales[fallbackLocale].markdownEditor
          );
        }
      }
    } catch (error) {
      console.error(
        '❌ Erro ao registar locale pt-PT no markdown editor:',
        error
      );
      // Usar locale padrão como fallback
      const fallbackLocale = 'en-US';
      if (
        embeddedLocales[fallbackLocale] &&
        embeddedLocales[fallbackLocale].markdownEditor
      ) {
        this.addLocale(
          FALLBACK_LANGUAGE,
          embeddedLocales[fallbackLocale].markdownEditor
        );
      }
    }
  },
  addLocale(language, locale) {
    try {
      Object.entries(locale).forEach(([keyset, data]) => {
        markdownEditorI18n.registerKeyset(language, keyset, data);
      });
      console.log('✅ Locale registado no markdown editor:', language);
    } catch (error) {
      console.error(
        '❌ Erro ao registar locale no markdown editor:',
        language,
        error
      );
    }
  },
  setLanguage(language) {
    try {
      configureMarkdownEditor({
        lang: language,
      });
    } catch (error) {
      console.error(
        '❌ Erro ao configurar idioma do markdown editor:',
        language,
        error
      );
    }
  },
};

i18n.dateFns.init();
i18n.timeAgo.init();
i18n.markdownEditor.init();

i18n.on('languageChanged', () => {
  i18n.dateFns.setLanguage(i18n.resolvedLanguage);
  i18n.timeAgo.setLanguage(i18n.resolvedLanguage);
  i18n.markdownEditor.setLanguage(i18n.resolvedLanguage);
});

const formatDatePostProcessor = {
  type: 'postProcessor',
  name: 'formatDate',
  process(value, _, options) {
    return i18n.dateFns.format(options.value, value);
  },
};

const parseDatePostProcessor = {
  type: 'postProcessor',
  name: 'parseDate',
  process(value, _, options) {
    return i18n.dateFns.parse(options.value, value, new Date());
  },
};

i18n
  .use(LanguageDetector)
  .use(formatDatePostProcessor)
  .use(parseDatePostProcessor)
  .use(initReactI18next)
  .init({
    resources: embeddedLocales,
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: languages,
    load: 'currentOnly',
    interpolation: {
      escapeValue: false,
      format(value, format, language) {
        if (value instanceof Date) {
          return i18n.dateFns.format(value, format, {
            language,
          });
        }

        return value;
      },
    },
    react: {
      useSuspense: true,
    },
    debug: import.meta.env.DEV,
  })
  .then(() => {
    console.log('i18n inicializado com sucesso');
    // Carregar o locale padrão pt-PT
    i18n.loadCoreLocale(FALLBACK_LANGUAGE).then(() => {
      console.log('Locale pt-PT carregado com sucesso');
    });
  });

i18n.loadCoreLocale = async (language = i18n.resolvedLanguage) => {
  if (language === FALLBACK_LANGUAGE) {
    console.log('Carregando locale padrão pt-PT');
    // Carregar o locale pt-PT mesmo sendo o padrão
    const { default: locale } = await import(`./locales/${language}/core.js`);

    Object.keys(locale).forEach(namespace => {
      switch (namespace) {
        case 'dateFns':
        case 'timeAgo':
        case 'markdownEditor':
          i18n[namespace].addLocale(language, locale[namespace]);
          break;
        default:
          i18n.addResourceBundle(
            language,
            namespace,
            locale[namespace],
            true,
            true
          );
      }
    });

    // Verificar se as traduções foram carregadas corretamente
    console.log('Verificando traduções carregadas:');
    console.log('boardActions_title:', i18n.t('common.boardActions_title'));
    console.log('expandPanel:', i18n.t('action.expandPanel'));
    console.log('collapsePanel:', i18n.t('action.collapsePanel'));
    console.log('openActivityHistory:', i18n.t('action.openActivityHistory'));

    return;
  }

  const { default: locale } = await import(`./locales/${language}/core.js`);

  Object.keys(locale).forEach(namespace => {
    switch (namespace) {
      case 'dateFns':
      case 'timeAgo':
      case 'markdownEditor':
        console.log(
          `Registando ${namespace} para ${language}:`,
          locale[namespace]
        );
        i18n[namespace].addLocale(language, locale[namespace]);
        break;
      default:
        i18n.addResourceBundle(
          language,
          namespace,
          locale[namespace],
          true,
          true
        );
    }
  });
};

i18n.detectLanguage = () => {
  const {
    services: { languageDetector, languageUtils },
  } = i18n;

  localStorage.removeItem(languageDetector.options.lookupLocalStorage);
  const detectedLanguages = languageDetector.detect();

  // Priorizar pt-PT se estiver disponível, caso contrário usar a detecção normal
  const preferredLanguages = ['pt-PT', ...detectedLanguages];
  i18n.language = languageUtils.getBestMatchFromCodes(preferredLanguages);
  i18n.languages = languageUtils.toResolveHierarchy(i18n.language);

  i18n.resolvedLanguage = undefined;
  i18n.setResolvedLanguage(i18n.language);
};

export default i18n;
