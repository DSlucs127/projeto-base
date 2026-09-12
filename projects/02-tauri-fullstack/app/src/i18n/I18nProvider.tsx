import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  loadI18n,
  translate,
  type I18nRuntime,
  type Locale,
} from './i18n';

interface I18nContextValue extends I18nRuntime {
  setLocale(locale: Locale): Promise<void>;
  t(key: string): string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({
  initial,
  children,
}: PropsWithChildren<{ initial: I18nRuntime }>) {
  const [runtime, setRuntime] = useState(initial);
  const setLocale = useCallback(async (locale: Locale) => {
    setRuntime(await loadI18n(locale));
    document.documentElement.lang = locale;
  }, []);
  const value = useMemo<I18nContextValue>(
    () => ({
      ...runtime,
      setLocale,
      t: (key) => translate(runtime.messages, key),
    }),
    [runtime, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}
