import "dotenv/config";

import { Request, Response } from "express";

import { prisma } from "@/db/prisma";
import { Prisma } from "@generated/client";

import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH_SECRETis not defined in environment variables"
  );
}

export async function registration(req: Request, res: Response) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExists) {
      return res.status(400).json("User already exists");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: { firstName, lastName, email, password: hashedPassword },
      });

      return res.status(201).json({ email, firstName, lastName });
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(400).json({
        prismaErrorCode: error.code,
        error: "User with this email already exists",
      });
    }
    console.error(error);
    return res.status(500).json({ error: "Failed to create user" });
  }
}


