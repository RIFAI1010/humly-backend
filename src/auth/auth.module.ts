import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { SECRET } from '../config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        UsersModule,  // Mengimpor UsersModule agar bisa digunakan di AuthService
        JwtModule.register({
            secret: SECRET,
            signOptions: { expiresIn: '60m' }, // Token access expires in 60 minutes
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
