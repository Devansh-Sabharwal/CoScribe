"use client"
import { WSS_URL} from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { CanvasProtectedRoute } from "../ProtectedRoutes/CanvasProtectedRoute";
import { ClipLoader } from "react-spinners";

interface CanvasProps {
    roomId: string;
}

export function RoomCanvas(props: CanvasProps) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(!token) return;
        const wsUrl = `${WSS_URL}?token=${encodeURIComponent(token)}`;
        if (!wsUrl) {
            console.error("WebSocket URL is undefined");
            return;
        }
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId: props.roomId
            }));
        };
        // Cleanup function to prevent multiple WS connections
        return () => {
            ws.close();
        };
    }, [props.roomId]); // ✅ Add dependency array

    if (!socket) {
        return <div className="h-screen w-screen flex justify-center items-center bg-black"><ClipLoader color="white"/></div>;
    }

    return (
        <CanvasProtectedRoute roomId={props.roomId}>
            <div className="bg-white h-screen w-screen">
                <Canvas roomId={props.roomId} socket={socket} />
            </div>
        </CanvasProtectedRoute>
    );
}
