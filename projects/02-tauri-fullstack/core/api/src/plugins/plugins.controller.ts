import { Controller, Get } from '@nestjs/common';

import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';

import type { PluginRegistryService } from './plugin-registry.service';
import type { PluginManifest, PluginRoute } from './plugin.types';

@Controller('plugins')
export class PluginsController {
  constructor(private readonly registry: PluginRegistryService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser): PluginManifest[] {
    return this.registry.visibleFor(user);
  }

  @Get('routes')
  routes(@CurrentUser() user: AuthenticatedUser): PluginRoute[] {
    return this.registry.routesFor(user);
  }
}
