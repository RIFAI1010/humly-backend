import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthMiddleware } from 'src/common/middlewares/auth.middleware';

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaService],
    exports: [UsersService], // Agar bisa digunakan di Auth Module
})
export class UsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes('*'); // Terapkan untuk semua rute
    }
}
