import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from '../auth/dto';
import { generateAccessToken, generateRefreshToken } from '../common/utils/jwt.util';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { REFRESH_SECRET } from '../config';
import { log } from 'console';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    async register(data: RegisterDto) {
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { username: data.username }],
            },
        });
        if (existingUser) {
            throw new BadRequestException(
                existingUser.email === data.email
                    ? 'Email is already taken'
                    : 'Username is already taken',
            );
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                userDetails:  {
                    create: {
                        status: 'public',
                    },
                }
            },
        });
        return { message: 'User registered successfully' };
    }

    async login(data: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: data.email },
        })
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { id: user.id, email: user.email, username: user.username, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        return { accessToken, refreshToken };
    }

    async refresh(refreshToken: string) {
        // let decode = jwt.decode(refreshToken) as any;
        try {
            const payload = jwt.verify(refreshToken, REFRESH_SECRET) as any;
            // Optional: Check refresh token validity in database
            const user = await this.prisma.user.findUnique({
                where: { id: payload.id },
            });
            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }
            // Generate new access token
            const accessToken = generateAccessToken({ id: user.id, email: user.email, username: user.username, role: user.role });
            return { accessToken };
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                // await this.prisma.user.update({
                //     where: { id: decode.id },
                //     data: { refreshToken: null },
                // })
                throw new UnauthorizedException('Refresh token expired');
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new BadRequestException('Invalid refresh token');
            }
            throw error;
        }
    }
}
