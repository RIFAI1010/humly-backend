import { MiddlewareConsumer, Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';


@Module({
    controllers: [FollowsController],
    providers: [FollowsService, PrismaService],
    exports: [FollowsService]
})
export class FollowsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(FollowsController);
    }
}
