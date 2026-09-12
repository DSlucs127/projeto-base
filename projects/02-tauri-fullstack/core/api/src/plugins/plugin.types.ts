export interface PluginRoute {
  path: string;
  titleKey: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  coreMinVersion: string;
  permissions: string[];
  backend: {
    entrypoint: string;
  };
  frontend: {
    routes: PluginRoute[];
  };
  i18n: {
    'pt-BR': string;
    en: string;
  };
}

export interface PluginDefinition {
  manifest: PluginManifest;
  register(registry: PluginRuntimeRegistry): void;
}

export interface PluginRuntimeRegistry {
  addRoute(route: PluginRoute): void;
}
