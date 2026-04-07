import { useEffect, Suspense } from 'react';
import type { Preview, StoryContext } from '@storybook/react-vite'
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/core/i18n';
import '../src/index.css';

const withI18n = (Story: any, context: StoryContext) => {
  const { locale } = context.globals;

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    </Suspense>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo'
    }
  },

  decorators: [withI18n],

  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'pt-BR', right: '🇧🇷', title: 'Português (Brasil)' },
          { value: 'es-ES', right: '🇪🇸', title: 'Español' },
          { value: 'ja', right: '🇯🇵', title: '日本語' },
        ],
      },
    },
  },
};

export default preview;