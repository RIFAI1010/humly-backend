import { BadRequestException, NotFoundException, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto, CreatePostDto } from './dto';
import { StatusPost } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService, private readonly userService: UsersService) { }

    async createPost(userId: string, data: CreatePostDto) {
        try {
            return await this.prisma.$transaction(async (prisma) => {
                const { content, images } = data;
                const post = await prisma.post.create({
                    data: {
                        userId,
                        content,
                        status: 'public',
                        images: {
                            create: images.map((image: string) => ({
                                image,
                            })),
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: true
                            }
                        },
                        images: true,
                    },
                });

                return {
                    ...post,

                    isOwner: post.userId === userId,
                }
            });
        } catch (error) {
            throw error;
        }
    }

    async getPersonalPosts(userId: string, page: number, limit: number) {
        page = page || 1;
        limit = limit || 100;
        const posts = await this.prisma.post.findMany({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }



    async deletePersonalPosts(userId: string, postId: string) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, userId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        await this.prisma.report.deleteMany({
            where: { postId: postId },
        })

        await this.prisma.postImage.deleteMany({
            where: { postId },
        });

        await this.prisma.comment.deleteMany({
            where: { postId },
        });

        await this.prisma.like.deleteMany({
            where: { postId },
        });

        await this.prisma.post.delete({
            where: { id: postId },
        });

        return { message: 'Post deleted successfully' };
    }

    async editPersonalPosts(userId: string, postId: string, data: CreatePostDto) {
        const post = await this.prisma.post.findFirst({
            where: { id: postId, userId },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        await this.prisma.post.update({
            where: { id: postId },
            data: {
                content: data.content,
            },
        });

        return { message: 'Post edited successfully' };
    }

    async getLikedPosts(userId: string, page: number, limit: number) {
        page = page || 1;
        limit = limit || 100;
        const posts = await this.prisma.post.findMany({
            where: { likes: { some: { userId } }, status: 'public' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }

    async getExplorePosts(userId: string, page: number, limit: number) {
        page = page || 1;
        limit = limit || 100;
        const posts = await this.prisma.post.findMany({
            where: { status: 'public' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                images: true,
                likes: {
                    select: {
                        userId: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }

    async getFollowingPosts(userId: string, page: number, limit: number) {
        page = page || 1;
        limit = limit || 100;
        const followedIds = await this.prisma.follow
            .findMany({
                where: { followerId: userId },
                select: { followedId: true },
            })
            .then((follows) => follows.map((follow) => follow.followedId));
        if (followedIds.length === 0) {
            return [];
        }
        const posts = await this.prisma.post.findMany({
            where: {
                status: 'public',
                userId: {
                    in: followedIds,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }

    async getPost(userId: string, id: string) {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: true
                            },
                        },
                    },
                }
            },
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (post.status === 'archive' && userId !== post.userId) {
            throw new NotFoundException('Post Is Archive');
        }
        if (post.user.userDetails.status === 'private' && userId !== post.userId) {
            const follow = await this.prisma.follow.findFirst({
                where: {
                    followerId: userId,
                    followedId: post.userId,
                }
            })
            if (!follow) {
                throw new NotFoundException('User is Private');
            }
        }
        return {
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        };
    }

    async getUserPosts(userId: string, id: string) {
        const user = await this.userService.getProfile(userId, id);
        const posts = await this.prisma.post.findMany({
            where: { userId: id, status: 'public' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }

    async getUserLikedPosts(userId: string, id: string) {
        const user = await this.userService.getProfile(userId, id);
        const posts = await this.prisma.post.findMany({
            where: { likes: { some: { userId: id } }, status: 'public' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                likes: {
                    select: {
                        userId: true
                    }
                },
                images: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return posts.map(post => ({
            ...post,
            likesCount: post._count.likes,
            commentsCount: post._count.comments,
            isOwner: post.userId === userId,
            isLiked: post.likes.some(like => like.userId === userId)
        }));
    }

    async likePost(userId: string, postId: string) {
        const post = await this.getPost(userId, postId);
        const like = await this.prisma.like.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        });
        if (like) {
            throw new BadRequestException('Post already liked');
        }
        await this.prisma.like.create({
            data: {
                userId: userId,
                postId: postId,
            },
        });
        return { message: 'Post liked successfully' };
    }

    async unlikePost(userId: string, postId: string) {
        const post = await this.getPost(userId, postId);
        const like = await this.prisma.like.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        });
        if (!like) {
            throw new BadRequestException('Post not liked');
        }
        await this.prisma.like.delete({
            where: {
                id: like.id,
            },
        });
        return { message: 'Post unliked successfully' };
    }

    async createComment(userId: string, data: CreateCommentDto) {
        const { postId, content, parentId } = data;
        if (parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: {
                    id: parentId,
                },
            })
            if (!parentComment) {
                throw new NotFoundException('Parent comment not found');
            }
        }

        const post = await this.getPost(userId, postId);
        const comment = await this.prisma.comment.create({
            data: {
                userId: userId,
                postId: postId,
                content: content,
                parentId: parentId ?? null,
            },
        });
        return {
            message: 'Comment created successfully',
            comment: comment,
        };
    }

    async getComments(userId: string, postId: string) {
        const post = await this.getPost(userId, postId);
        const comments = await this.prisma.comment.findMany({
            where: {
                postId: postId,
                parentId: null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
                replies: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: true
                            },
                        },
                    },
                }
            }
        })

        return comments;
    }

    async getReplies(userId: string, commentId: string) {
        const comments = await this.prisma.comment.findFirst({
            where: {
                id: commentId,
            },
            include: {
                post: true,
            }
        })
        if (!comments) {
            throw new NotFoundException('Comment not found');
        }
        const post = await this.getPost(userId, comments.post.id);
        const replies = await this.prisma.comment.findMany({
            where: {
                parentId: commentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        userDetails: true
                    },
                },
            }
        })
    }

    async reportPost(userId: string, postId: string) {
        const report = await this.prisma.report.findFirst({
            where: {
                userId: userId,
                postId: postId,
            },
        })

        if (report) {
            throw new BadRequestException('Post already reported');
        }

        await this.prisma.report.create({
            data: {
                userId: userId,
                postId: postId,
            },
        });

        return { message: 'Post reported successfully' };

    }

    async getReportedPosts(userId: string) {

        const user = await this.prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (user.role !== 'Admin') {
            throw new ForbiddenException('Only admin can view reported posts');
        }

        const reports = await this.prisma.report.findMany({
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                userDetails: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    
        // Hitung jumlah report per post
        const reportSummary = reports.reduce((acc, report) => {
            const { post } = report;
            if (!post) return acc; // Jika post null, skip
    
            const key = post.id;
            if (!acc[key]) {
                acc[key] = {
                    postId: post.id,
                    jumlahReport: 0,
                    content: post.content,
                    userName: post.user?.userDetails?.name || post.user?.username || "Unknown"
                };
            }
            acc[key].jumlahReport++;
            return acc;
        }, {} as Record<string, {postId: string, jumlahReport: number, content: string, userName: string }>);
    
        // Konversi hasil ke array
        return Object.values(reportSummary);
    }
    
    async deleteReportPost(userId: string, postId: string) {
        const report = await this.prisma.report.findFirst({
            where: {
                postId: postId,
            },
        });

        if (!report) {
            throw new NotFoundException('Post not found');
        }

        await this.prisma.report.deleteMany({
            where: { postId: postId },
        })
        await this.prisma.postImage.deleteMany({
            where: { postId },
        });

        await this.prisma.comment.deleteMany({
            where: { postId },
        });

        await this.prisma.like.deleteMany({
            where: { postId },
        });

        await this.prisma.post.delete({
            where: { id: postId },
        });
    }
}
