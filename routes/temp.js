import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import bcrypt from "bcryptjs";

config();
const prisma = new PrismaClient();

//principal signin signup routes
const func = async () => {
    try {
        const hashedPassword = await bcrypt.hash('Admin', 10);
    
        const user = await prisma.User.create({
            data: {
            name: 'Principal',
            email: 'principal@classroom.com',
            password: hashedPassword,
            role: 'PRINCIPAL',
            },
        });
    
        const token = await jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET
        );
        console.log(token);
        } catch (err) {
        console.log(err);
        
        }
}

func();

