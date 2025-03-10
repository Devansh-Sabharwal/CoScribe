import axios from "axios";
import { HTTP_URL } from "@/config";
export async function getExistingChats(roomId: string){
    const token = localStorage.getItem('token');
    const res = await axios.get(`${HTTP_URL}/chats/${roomId}`, {
        headers: {
            Authorization: `Bearer ${token}` // Set token here
        }
    });
    
    const messages = res.data.messages;

    const shapes = messages.map((x:{message:string})=>{
        const messageData = JSON.parse(x.message);
        return messageData;
    })
    return shapes
}
export async function clearCanvas(roomId: string){
    const res = await axios.post(`${HTTP_URL}/clear`,
        { roomId },
        {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Set token here
        }
        
    })
}