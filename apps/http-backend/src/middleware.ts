import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
const auth = (req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization token missing or malformed' });
        return;
    }
    const token = authHeader.split(' ')[1] as string;
    try{
    const decodedData = jwt.verify(token,JWT_SECRET) as JwtPayload;
    if(decodedData){
        req.userId = decodedData.id;
        next();
    }
    else{
        res.status(403).json({
            message:"Invalid Token"
        })
    }}
    catch(e){
        res.status(403).json({
            message:"Invalid Token"
        })
    }
}
export default auth;