import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import {
  createEncryptedPrismaClient,
  type EncryptedPrismaClient,
} from './prisma-crypto.extension';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client: EncryptedPrismaClient = createEncryptedPrismaClient();

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
