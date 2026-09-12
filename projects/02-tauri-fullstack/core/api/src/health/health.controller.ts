import { Controller, Get } from '@nestjs/common';

import { configurationFingerprint } from '../config';
import { Public } from '../security/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  status(): { status: 'ok'; configuration: string } {
    return { status: 'ok', configuration: configurationFingerprint() };
  }
}
