import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PrismaService],
    exports: [PostsService]
})
export class PostsModule {
    configure(consumer: MiddlewareConsumer) {
            consumer.apply(AuthMiddleware).forRoutes('*'); // Terapkan untuk semua rute
        }
}
