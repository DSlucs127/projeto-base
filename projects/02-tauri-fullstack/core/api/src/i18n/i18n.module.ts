import { Global, Module } from '@nestjs/common';

import { PluginsModule } from '../plugins/plugins.module';

import { I18nService } from './i18n.service';

@Global()
@Module({
  imports: [PluginsModule],
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {}
