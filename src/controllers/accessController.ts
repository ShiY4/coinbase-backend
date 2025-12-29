import "dotenv/config";

import { Request, Response } from "express";

import { prisma } from "@/db/prisma";
import { Prisma } from "@generated/client";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET and JWT_REFRESH_SECRETis not defined in environment variables"
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

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
      return res.status(400).json("Invalid credentials");
    }

    const accessToken = jwt.sign({ userId: user.uid }, JWT_SECRET, {
      expiresIn: "15min",
    });
    const refreshToken = jwt.sign({ userId: user.uid }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    await prisma.user.update({
      where: { uid: user.uid },
      data: { refreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });

    return res
      .status(200)
      .json({ message: "User has been loggined", accessToken });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        prismaErrorCode: error.code,
        error: "Prisma Error",
      });
    }
    return res.status(500).json({
      error: "Failed to login",
    });
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json("No refresh token");
  }

  try {
    const tokenPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: number;
    };
    const user = await prisma.user.findUnique({
      where: { uid: tokenPayload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json("Invalid refresh token");
    }

    const newAccessToken = jwt.sign({ userId: user.uid }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ userId: user.uid }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    await prisma.user.update({
      where: { uid: user.uid },
      data: { refreshToken: newRefreshToken },
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Token's will be refreshed",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        prismaErrorCode: error.code,
        error: "Prisma Error",
      });
    }
    return res.status(403).json("Invalid refresh token");
  }
}
