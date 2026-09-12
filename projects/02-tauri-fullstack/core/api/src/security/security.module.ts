import { Global, Module } from '@nestjs/common';

import { AuditService } from './audit.service';
import { CsrfOriginGuard } from './csrf-origin.guard';
import { PermissionGuard } from './permission.guard';

@Global()
@Module({
  providers: [AuditService, CsrfOriginGuard, PermissionGuard],
  exports: [AuditService, CsrfOriginGuard, PermissionGuard],
})
export class SecurityModule {}
