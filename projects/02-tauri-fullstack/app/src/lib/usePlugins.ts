import { useEffect, useState } from 'react';

import type { PluginRoute } from './api';
import { api } from './api';

interface PluginsState {
  routes: PluginRoute[];
  unavailable: boolean;
}

/**
 * Consome `/v1/plugins/routes`. As rotas exigem sessao autenticada; sem
 * sessao (ou API fora do ar) o hook sinaliza indisponivel em vez de quebrar.
 */
export function usePlugins(locale: string): PluginsState {
  const [state, setState] = useState<PluginsState>({ routes: [], unavailable: false });

  useEffect(() => {
    let active = true;
    setState({ routes: [], unavailable: false });
    api
      .pluginRoutes(locale)
      .then((routes) => active && setState({ routes, unavailable: false }))
      .catch(() => active && setState({ routes: [], unavailable: true }));
    return () => {
      active = false;
    };
  }, [locale]);

  return state;
}
