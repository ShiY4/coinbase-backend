import "dotenv/config";
import { Request, Response } from "express";
import { prisma } from "@/db/prisma";
import { Prisma } from "@generated/client";
import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function registration(req: Request, res: Response) {
  const { firstName, lastName, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExists) {
      return res.status(400).json("User already exists" );
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
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(400).json("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json("Invalid credentials" );
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "User has been loggined", token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
}
