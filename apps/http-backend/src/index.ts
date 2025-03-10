import express from "express"
import jwt from "jsonwebtoken"
import auth from "./middleware"
import {CreateUserSchema,SigninSchema,CreateRoomSchema} from "@repo/common/types"
const app = express()
app.use(express.json());
import db from "@repo/db/client"
import cors from "cors";
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string
const generateRoomID = (): string => {
  return uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
};
app.use(
    cors({
      origin: [
        "http://localhost:3000", 
        "https://coscribe.onrender.com"
      ], // Allow both local and deployed frontend
      credentials: true, // Allow cookies/auth headers
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
      allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    })
  );
app.post("/signup",async (req,res)=>{
    
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(401).json({
            message:"Invalid Credentials"
        })
        return;
    }
    const { email, password, name, photo } = parsedData.data;
    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.user.create({
            data: {
              email,
              password: hashedPassword,
              name,
              photo,
            },
          });
        res.status(200).json({
            message:"User created successfully"
        })
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:"email already exist"
        })
    }
})
app.post("/signin",async (req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(401).json({
            message:"Invalid Credentials"
        })
        return;
    }
    const email = parsedData.data.email;
    const password = parsedData.data.password;
    try{
        const user = await db.user.findFirst({ where: { email } });

        if (!user) {
          res.status(401).json({ message: "Incorrect Credentials" });
          return;
        }
    
        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Password is incorrect" });
            return;
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            token
        })
    }
    catch(e){
        console.log(e);
        res.status(500).json({
            message:"server error"
        })
    }
})
app.use(auth);

app.post("/create-room",async (req,res)=>{
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(401).json({
            message:"Invalid Credentials"
        })
        return;
    }
    const userId = req.userId;
    if(!userId) {
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    try{
        const roomId = generateRoomID();
        const room = await db.room.create({
            data:{
                id:roomId,
                slug: parsedData.data.name,
                adminId: userId,
                users: {
                    connect: [{ id: userId }]
                }
            }
        })
        res.status(200).json({
            message:"room created successfully",
            roomId:room.id

        })
    }
    catch(e){
        res.status(401).json({
            message: "room creation failed"
        });
        return;
    }
}) 
app.get('/join-room/:roomId',async(req,res)=>{
    const roomId = (req.params.roomId);
    try{
        const room = await db.room.findUnique({
            where:{
                id:roomId
            }
        })
        if(room)res.status(200).json({message:"Room exist"})
        else{
            res.status(404).json({message:"Room doesn't exist"})
            return;
        }
    }catch(e){
        console.log("doesnt exist");
        res.status(404).json({message:"Room doesn't exist"})
    }
})
app.get('/chats/:roomId',async (req,res)=>{
    const roomId = (req.params.roomId);
    try{
        const messages = await db.chat.findMany({
            where:{
                roomId
            },
            orderBy:{
                id:"asc"
            },
            take: 100
        })
        res.status(200).json({
            messages
        })
    }
    catch(e){
        console.log(e);
    }
    
});
app.get("/room/:roomId",async (req,res)=>{
    const roomId = (req.params.roomId);
    if(!roomId || roomId==""){
        res.status(404).json({message:"Room doesnt exist"});
        return;
    }
    
    try{
        const room = await db.room.findFirst({
            where:{id:roomId}
        });
        if(!room){
            res.status(404).json({message:"Room doesnt exist"});
            return;
        }
        res.status(200).json({message:"RoomExist"});
    }
    catch(e){
        console.log(e);
    }
})
app.get("/rooms", async (req, res) => {
    const userId = req.userId;
    try {
        const user = await db.user.findUnique({
            where: {
                id: userId
            },
            select: {
                id: true,
                name: true,
                rooms: {
                    include: {
                        users: {
                            select: {
                                id:true,
                                name: true, // Include only the `name` of the participants
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" }
                },
            },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const data = {
            userId: user.id,
            userName: user.name,
            rooms: user.rooms.map((room:any) => ({
                roomId: room.id,
                slug: room.slug,
                createdAt: room.createdAt.toISOString().slice(0, 10).split('-').reverse().join('-'),
                participants: room.users.map((participant:any) => 
                    participant.id === user.id ? "You" : participant.name // Replace current user's name with "You"
                ),
                noOfParticipants: room.users.length
            })),
        };
        res.status(200).json({
            messages: data
        });
    } catch (e) {
        console.log("An error occurred");
        console.log(e);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/clear",async(req,res)=>{
    const roomId = (req.body.roomId);

    if (!roomId || roomId==="") { 
        res.status(400).json({ message: "Invalid or missing roomId" });
        return
    }

    try{
        await db.chat.deleteMany({
            where:{
                roomId
            }})
        res.status(200).json({message:"Canvas Cleared Successfully"});
    }
    catch(e){
        res.status(500).json({message:"DB server error"});
    }
})
app.post("/leave-room",async(req,res)=>{
    const userId = req.userId;
    const roomId = (req.body.roomId);
    if (!roomId || roomId=="") { 
        res.status(400).json({ message: "Invalid or missing roomId" });
        return
    }
    try{
        const room = await db.room.findUnique({
            where: { id: roomId },
            include: { users: true } // Include the users array
        });
    
        if (!room){
            res.status(404).json({ message: "Invalid or missing roomId" });
            return;
        }
    
        const updatedUsers = room.users.filter((u:any) => u.id !== userId);
        if (updatedUsers.length === 0) {
            await db.chat.deleteMany({
                where: { roomId }
            });
            await db.room.delete({
                where: { id: roomId }
            });
            res.status(200).json({message:"Room Deleted Successfully"});
            return;
        }
        await db.room.update({
            where: { id: roomId },
            data: { users: { set: updatedUsers.map((u:any )=> ({ id: u.id })) } }
        });
        res.status(200).json({message:"Room Deleted Successfully"})
    }catch(e){
        console.log(e)
        res.status(401).json({message:"Server error"});
    }
    
})
app.listen(8000, () => {
    console.log("server is listening ");
});


