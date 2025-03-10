"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import { HTTP_URL } from "@/config";
interface ProtectedRouteProps {
    roomId: string;
    children: React.ReactNode;
}

export function CanvasProtectedRoute({ roomId, children }: ProtectedRouteProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkRoomAccess = async () => {
            try {
                // Fetch room details from the server
                const response = await fetch(`${HTTP_URL}/room/${roomId}`, {
                    headers: {
                        authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                if (!response.ok) {
                    // Redirect to dashboard if the user is not authorized
                    alert("Room doesnt exist");
                    router.push("/dashboard");
                    return;
                }

                // If authorized, allow rendering of the children
                setIsAuthorized(true);
            } catch (error) {
                console.error("Error checking room access:", error);
                router.push("/dashboard");
            }
        };

        checkRoomAccess();
    }, [roomId, router]);

    if (!isAuthorized) {
        return <div className="bg-black text-white flex h-screen w-screen text-center justify-center items-center"><span><ClipLoader color="white"/></span></div>;
    }
    return <>{children}</>;
}