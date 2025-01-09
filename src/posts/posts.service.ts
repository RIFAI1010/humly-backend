import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto';
import { StatusPost } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) { }

    async createPost(userId: string, data: CreatePostDto) {
        const { content, status, images } = data;


        // Buat post baru
        const post = await this.prisma.post.create({
            data: {
                userId,
                content,
                status: status as StatusPost,
            },
        });

        // Simpan gambar menggunakan createMany
        if (images && images.length > 0) {
            await this.prisma.postImage.createMany({
                data: images.map((image: string) => ({
                    postId: post.id,
                    image,
                })),
            });
        }

        return post;
    }

    async getExplorePosts(page: number, limit: number) {
        page = page || 1;
        limit = limit || 10;
        const posts = await this.prisma.post.findMany({
            skip: (page - 1) * limit,  // Pagination skip
            take: limit,  // Limit jumlah posts
            include: {
                user: {
                    select: {
                        username: true,
                        id: true,
                    },
                },
                images: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return posts;
    }

    async getFollowingPosts(userId: string, page: number, limit: number) {
        page = page || 1;
        limit = limit || 10;
        const followedIds = await this.prisma.follow
            .findMany({
                where: { followerId: userId },
                select: { followedId: true },
            })
            .then((follows) => follows.map((follow) => follow.followedId));

        if (followedIds.length === 0) {
            return []; // Return empty array jika tidak ada yang di-follow
        }

        return this.prisma.post.findMany({
            where: {
                userId: {
                    in: followedIds,
                },
            },
            skip: (page - 1) * limit,  // Pagination skip
            take: limit,  // Limit jumlah posts
            include: {
                user: {
                    select: {
                        username: true,
                        id: true,
                    },
                },
                images: true,
            },
        });
    }

    async getPost(userId: string, id: string) {

        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        username: true,
                        id: true,
                        userDetails: true
                    },
                },
                images: true,
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        if (post.status === 'archive') {
            const follow = await this.prisma.follow.findFirst({
                where: {
                    followerId: userId,
                    followedId: post.userId,
                }
            })
            if (!follow) {
                throw new ForbiddenException('User is Private');
            }
            throw new ForbiddenException('Post Is Archive');
        }

        return post;
    }

    async getUserPosts(userId: string, id: string) {

        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: {
                username: true,
                id: true,
                userDetails: true
            }
        })

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.userDetails.status === 'private') {
            const follow = await this.prisma.follow.findFirst({
                where: {
                    followerId: userId,
                    followedId: user.id,
                }
            })
            if (!follow) {
                throw new ForbiddenException('User is Private');
            }
        }

        const posts = await this.prisma.post.findMany({
            where: { userId: id, status: 'public' },
            include: {
                user: {
                    select: {
                        username: true,
                        id: true,
                        userDetails: true
                    },
                },
                images: true,
            },
        });

        return posts;
    }
}
