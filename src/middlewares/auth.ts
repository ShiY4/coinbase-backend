import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const JWT_SECRET = process.env.JWT_SECRET

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization

  if(!authorization) {
    return res.status(201).json('User is not logged in')
  }

  const token = authorization.split(" ")[1]

  try{
    const payload = jwt.verify(token, JWT_SECRET) as {userId: number}
    req.userId = payload.userId
    next()
  } catch(error){
    return res.status(401).json("Invalid token" );
  }
}