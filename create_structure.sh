#!/bin/bash

# Root directory
ROOT="src"

# Directories
declare -a DIRECTORIES=(
    "$ROOT/auth"
    "$ROOT/auth/dto"
    "$ROOT/auth/guards"
    "$ROOT/users"
    "$ROOT/common/decorators"
    "$ROOT/common/middlewares"
    "$ROOT/common/exceptions"
    "$ROOT/common/utils"
    "$ROOT/prisma"
)

# Files
declare -A FILES=(
    # Auth module
    ["$ROOT/auth/auth.controller.ts"]="import { Controller } from '@nestjs/common';\n"
    ["$ROOT/auth/auth.service.ts"]="import { Injectable } from '@nestjs/common';\n"
    ["$ROOT/auth/auth.module.ts"]="import { Module } from '@nestjs/common';\n"
    ["$ROOT/auth/dto/register.dto.ts"]="import { IsNotEmpty, IsEmail } from 'class-validator';\n"
    ["$ROOT/auth/dto/login.dto.ts"]="import { IsNotEmpty, IsEmail } from 'class-validator';\n"
    ["$ROOT/auth/guards/jwt-auth.guard.ts"]="import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';\n"
    
    # Users module
    ["$ROOT/users/users.controller.ts"]="import { Controller } from '@nestjs/common';\n"
    ["$ROOT/users/users.service.ts"]="import { Injectable } from '@nestjs/common';\n"
    ["$ROOT/users/users.module.ts"]="import { Module } from '@nestjs/common';\n"
    
    # Common utilities
    ["$ROOT/common/decorators/user.decorator.ts"]="import { createParamDecorator, ExecutionContext } from '@nestjs/common';\n"
    ["$ROOT/common/middlewares/auth.middleware.ts"]="import { Injectable, NestMiddleware } from '@nestjs/common';\n"
    ["$ROOT/common/exceptions/http-exception.filter.ts"]="import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';\n"
    ["$ROOT/common/utils/jwt.util.ts"]="import * as jwt from 'jsonwebtoken';\nconst SECRET = 'your_secret_key';\n"
    
    # Prisma setup
    ["$ROOT/prisma/prisma.service.ts"]="import { Injectable } from '@nestjs/common';\n"
    ["$ROOT/prisma/prisma.module.ts"]="import { Module } from '@nestjs/common';\n"

    # Root level files
    ["main.ts"]="import { NestFactory } from '@nestjs/core';\n"
)

# Create directories
for dir in "${DIRECTORIES[@]}"; do
    mkdir -p "$dir"
    echo "Created directory: $dir"
done

# Create files
for file in "${!FILES[@]}"; do
    echo -e "${FILES[$file]}" > "$file"
    echo "Created file: $file"
done

echo "Project structure and files created successfully!"
