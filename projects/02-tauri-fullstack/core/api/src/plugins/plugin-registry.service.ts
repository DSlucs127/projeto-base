
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';

import type {
  PluginDefinition,
  PluginManifest,
  PluginRoute,
  PluginRuntimeRegistry,
} from './plugin.types';

const CORE_VERSION = '1.0.0';
const idPattern = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const permissionPattern = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/;
const ENTRYPOINT_PATTERN = /^backend\/[A-Za-z0-9_./-]+\.js$/;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isPluginManifest(value: unknown): value is PluginManifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  const backend = candidate.backend;
  const frontend = candidate.frontend;
  const i18n = candidate.i18n;
  const routes =
    typeof frontend === 'object' && frontend !== null
      ? (frontend as Record<string, unknown>).routes
      : undefined;

  return (
    typeof candidate.id === 'string' &&
    idPattern.test(candidate.id) &&
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.description === 'string' &&
    semverPattern.test(String(candidate.version)) &&
    semverPattern.test(String(candidate.coreMinVersion)) &&
    isStringArray(candidate.permissions) &&
    candidate.permissions.length > 0 &&
    candidate.permissions.every((permission) => permissionPattern.test(permission)) &&
    typeof backend === 'object' &&
    backend !== null &&
    typeof (backend as Record<string, unknown>).entrypoint === 'string' &&
    typeof frontend === 'object' &&
    frontend !== null &&
    Array.isArray(routes) &&
    routes.every(
      (route: unknown) =>
        typeof route === 'object' &&
        route !== null &&
        typeof (route as Record<string, unknown>).path === 'string' &&
        typeof (route as Record<string, unknown>).titleKey === 'string',
    ) &&
    typeof i18n === 'object' &&
    i18n !== null &&
    typeof (i18n as Record<string, unknown>)['pt-BR'] === 'string' &&
    typeof (i18n as Record<string, unknown>).en === 'string'
  );
}

function supportsCore(manifest: PluginManifest): boolean {
  return manifest.coreMinVersion === CORE_VERSION;
}

type MessageTree = { [key: string]: string | MessageTree };

function isMessageTree(value: unknown): value is MessageTree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(base: MessageTree, override: MessageTree): MessageTree {
  const out: MessageTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      isMessageTree(value) && isMessageTree(current) ? deepMerge(current, value) : value;
  }
  return out;
}

@Injectable()
export class PluginRegistryService implements OnModuleInit {
  private readonly manifests = new Map<string, PluginManifest>();
  private readonly definitions = new Map<string, PluginDefinition>();
  private readonly extraRoutes = new Map<string, { route: PluginRoute; pluginId: string }>();
  private readonly pluginMessages = new Map<string, { 'pt-BR': MessageTree; en: MessageTree }>();

  async onModuleInit(): Promise<void> {
    const pluginsDirectory = path.resolve(
      process.env.PLUGINS_DIRECTORY ?? path.resolve(process.cwd(), '../../plugins'),
    );
    for (const entry of readdirSync(pluginsDirectory, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) {
        continue;
      }

      const pluginDirectory = path.resolve(pluginsDirectory, entry.name);
      const manifestPath = path.resolve(pluginDirectory, 'plugin.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown;
      if (!isPluginManifest(manifest)) {
        throw new Error(`Invalid plugin manifest: ${manifestPath}`);
      }
      if (!supportsCore(manifest)) {
        throw new Error(
          `Plugin ${manifest.id} requires core ${manifest.coreMinVersion}, current is ${CORE_VERSION}`,
        );
      }
      if (this.manifests.has(manifest.id)) {
        throw new Error(`Duplicate plugin id: ${manifest.id}`);
      }

      this.pluginMessages.set(manifest.id, {
        'pt-BR': this.readLocaleFile(pluginDirectory, manifest.i18n['pt-BR'], manifest.id),
        en: this.readLocaleFile(pluginDirectory, manifest.i18n.en, manifest.id),
      });
      this.manifests.set(manifest.id, manifest);
      this.loadEntrypoint(manifest, pluginDirectory);
    }
  }

  /**
   * Executa o entrypoint backend do plugin (CommonJS puro, sem acesso a
   * segredos do core). Falha o boot em caso de erro: fail closed.
   */
  private loadEntrypoint(manifest: PluginManifest, pluginDirectory: string): void {
    const { entrypoint } = manifest.backend;
    if (!ENTRYPOINT_PATTERN.test(entrypoint)) {
      throw new Error(
        `Plugin ${manifest.id}: backend.entrypoint must match ${ENTRYPOINT_PATTERN} (got "${entrypoint}")`,
      );
    }
    const entryPath = path.resolve(pluginDirectory, entrypoint);
    const baseDirectory = `${path.resolve(pluginDirectory)}${path.sep}`;
    if (!entryPath.startsWith(baseDirectory)) {
      throw new Error(`Plugin ${manifest.id}: entrypoint escapes the plugin directory`);
    }
    if (!existsSync(entryPath)) {
      throw new Error(`Plugin ${manifest.id}: entrypoint not found at ${entrypoint}`);
    }

    const registry: PluginRuntimeRegistry = {
      addRoute: (route: PluginRoute) => {
        const conflict = this.extraRoutes.get(route.path);
        if (conflict && conflict.pluginId !== manifest.id) {
          throw new Error(
            `Plugin ${manifest.id}: route ${route.path} already registered by ${conflict.pluginId}`,
          );
        }
        this.extraRoutes.set(route.path, { route, pluginId: manifest.id });
      },
    };

    try {
      // createRequire carrega CommonJS puro; o manifesto so permite .js local.
      const entryRequire = createRequire(entryPath);
      const loaded = entryRequire(entryPath) as {
        plugin?: PluginDefinition;
        default?: { register?: unknown };
        register?: unknown;
      };
      const candidate = loaded.plugin ?? loaded.default ?? loaded;
      if (typeof candidate?.register !== 'function') {
        throw new Error('module must export { plugin } with a register(registry) function');
      }
      (candidate as PluginDefinition).register(registry);
      this.definitions.set(manifest.id, candidate as PluginDefinition);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      throw new Error(`Plugin ${manifest.id}: failed to load ${entrypoint} (${reason})`);
    }
  }

  private readLocaleFile(pluginDirectory: string, relativePath: string, pluginId: string): MessageTree {
    const filePath = path.resolve(pluginDirectory, relativePath);
    const baseDirectory = `${path.resolve(pluginDirectory)}${path.sep}`;
    if (!filePath.startsWith(baseDirectory)) {
      throw new Error(`Plugin ${pluginId}: locale path escapes the plugin directory (${relativePath})`);
    }
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as unknown;
    if (!isMessageTree(parsed)) {
      throw new Error(`Plugin ${pluginId}: locale file ${relativePath} must contain an object`);
    }
    return parsed;
  }

  visibleFor(user: AuthenticatedUser): PluginManifest[] {
    return [...this.manifests.values()].filter((manifest) =>
      manifest.permissions.every((permission) => user.permissions.includes(permission)),
    );
  }

  routesFor(user: AuthenticatedUser): PluginRoute[] {
    const declared = this.visibleFor(user).flatMap((manifest) => manifest.frontend.routes);
    const declaredPaths = new Set(declared.map((route) => route.path));
    const runtimeRoutes = [...this.extraRoutes.values()]
      .filter(({ route, pluginId }) => !declaredPaths.has(route.path) && this.canSee(user, pluginId))
      .map(({ route }) => route);
    return [...declared, ...runtimeRoutes];
  }

  private canSee(user: AuthenticatedUser, pluginId: string): boolean {
    const manifest = this.manifests.get(pluginId);
    return manifest !== undefined && this.visibleFor(user).includes(manifest);
  }

  /** Mensagens i18n de todos os plugins ativos, mescladas por locale. */
  messagesFor(locale: 'pt-BR' | 'en'): MessageTree {
    let merged: MessageTree = {};
    for (const messages of this.pluginMessages.values()) {
      merged = deepMerge(merged, messages[locale]);
    }
    return merged;
  }
}
