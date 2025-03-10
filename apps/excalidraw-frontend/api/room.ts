import {HTTP_URL} from "@/config"
export async function createRoom(name:string){
    const response = await fetch(`${HTTP_URL}/create-room`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + localStorage.getItem('token') || ''
        },
        body: JSON.stringify({name}),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
  
    return response.json();
}
export async function joinRoom(roomId:string){
    const response = await fetch(`${HTTP_URL}/join-room/${roomId}`,{
        headers: {
            authorization: "Bearer " + localStorage.getItem('token') || ''
        }
    });
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}
export async function leaveRoom(roomId:string){
    const response = await fetch(`${HTTP_URL}/leave-room`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "Bearer " + localStorage.getItem('token') || ''
        },
        body: JSON.stringify({roomId}),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
    }
    return response.json();
}