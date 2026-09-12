'use strict';

/**
 * Template de backend de plugin (Tauri fullstack).
 *
 * O entrypoint e CommonJS puro, carregado pelo PluginRegistryService no boot.
 * Regras:
 * - Nao importe modulos do core (`@nestjs/*`, Prisma, segredos). O registro
 *   recebe apenas `addRoute`.
 * - Mantenha este arquivo fino: logica de dominio pesada precisa virar parte
 *   revisada do core, nao codigo de plugin.
 * - Toda rota registrada aqui deve existir tambem no `plugin.json` (rotas em
 *   tempo de execucao sao um recurso extra, nao um substituto do manifesto).
 */
const plugin = {
  register(registry) {
    registry.addRoute({
      path: '/plugins/example-notes',
      titleKey: 'exampleNotes.title',
    });
  },
};

module.exports = { plugin };
