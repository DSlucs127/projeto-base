/**
 * Plugin template. Copie esta pasta para criar um novo plugin.
 *
 * O `registerPlugin` recebe o registry do core e adiciona suas callables
 * + i18n + permissoes. Nenhum codigo deste arquivo deve importar do core
 * diretamente alem do registry.
 */
import type { PluginRegistrar } from '../../../../core/functions/src/pluginsRegistry';
import en from '../../locales/en.json';
import ptBR from '../../locales/pt-BR.json';

export const registerPlugin: PluginRegistrar = (registry) => {
  registry.addI18n('en', en);
  registry.addI18n('pt-BR', ptBR);

  registry.addCallable('example.echo', async (req) => {
    const message = (req.data?.message as string) ?? '';
    return { echoed: message };
  });
};

export default registerPlugin;