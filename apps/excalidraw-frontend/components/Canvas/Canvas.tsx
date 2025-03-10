import { useEffect, useRef, useState } from "react";
import { Draw } from "@/draw/draw";
import ProtectedRoute from "../ProtectedRoutes/ProtectedRoute";
import { Toolbar } from "../Toolbars/Toolbar";
import SideToolbar from "../Toolbars/SideToolbar";


interface CanvasProps {
    roomId: string;
    socket: WebSocket;
}

export function Canvas(props: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [shape, setShape] = useState<"circle" | "pencil" | "rect" | "diamond" | "arrow" | "line" | "text" | "eraser" | "select">("select");
    const [draw, setDraw] = useState<Draw>();
    const [color,setColor] = useState<string>("white");
    const [bgColor,setBgColor] = useState<string>("#ffffff00");
    const [strokeWidth,setStrokeWidth] = useState<number>(2);
    const [strokeStyle,setStrokeStyle] = useState<string>("solid");
    // Update canvas resolution on mount and window resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set initial canvas resolution
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Update the tool in the Draw instance when the shape changes
    useEffect(() => {
        draw?.setTool(shape);
        
    }, [shape, draw]);
    useEffect(()=>{
        draw?.setColor(color);
        draw?.setBgColor(bgColor);
        draw?.setStrokeWidth(strokeWidth);
        draw?.setStrokeStyle(strokeStyle);
    },[color,bgColor,strokeWidth,strokeStyle,draw])

    // Initialize the Draw instance when the canvas ref is available
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const d = new Draw(canvas, ctx, props.socket, props.roomId,setShape);
            setDraw(d);

            return () => {
                d.destroy();
            };
        }
    }, [canvasRef, props.socket, props.roomId]);

    // Update the cursor based on the selected tool
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        switch (shape) {
            case "eraser":
                canvas.style.cursor = `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='20'%20height='20'%20viewBox='0%200%2040%2040'%3E%3Ccircle%20cx='20'%20cy='20'%20r='18'%20fill='none'%20stroke='white'%20stroke-width='4'/%3E%3C/svg%3E") 20 20, auto`;
                break;
            case "text":
                canvas.style.cursor = "text"; // Text cursor
                break;
            case "select":
                canvas.style.cursor = "auto";
                break;
            default:
                canvas.style.cursor = "crosshair"; // Default cursor for other tools
        }
    }, [shape]);

    return (
        <ProtectedRoute>
        <div>
            <canvas
                ref={canvasRef}
                className="bg-[#131213]"
                height={window.innerHeight}
                width={window.innerWidth}
            ></canvas>
            <Toolbar shape={shape} setShape={setShape} roomId={props.roomId} draw={draw} />
            <SideToolbar 
            color={color} 
            setColor={setColor}
            bgColor={bgColor}
            setBgColor={setBgColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            strokeStyle={strokeStyle}
            setStrokeStyle={setStrokeStyle}
            />
        </div>
        </ProtectedRoute>
    );
}

