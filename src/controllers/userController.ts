import { Request, Response } from "express";
import { prisma } from "@/db/prisma";
import { Prisma } from "@generated/client";

export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await prisma.user.create({
      data: { firstName, lastName, email, password },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};
