import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "@/api/room";
import toast from "react-hot-toast";

interface DialogboxProps {
  createRoom: boolean;
  setCreateRoom: Dispatch<SetStateAction<boolean>>;
  onCreateRoom: () => Promise<void>;
}

export default function Dialogbox({
  createRoom: CR,
  setCreateRoom,
  onCreateRoom,
}: DialogboxProps) {

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  
  const mutate = useMutation({
    mutationFn: createRoom,
    onSuccess: async () => {
      setTimeout(async ()=>{
        await onCreateRoom();
      },1000)
    },
  });

  
  const handleCreateRoom = async (roomName: string) => {
    // Start the toast promise
    setCreateRoom(false);
    toast.promise(
      mutate.mutateAsync(roomName),
      {
        loading: (
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            Creating room...
          </div>
        ),
        success: (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            Room created successfully!
          </div>
        ),
        error: (err) => (
          <div className="flex items-center gap-2 text-red-600 font-semibold">
            {err.message}
          </div>
        ),
      },
      {
        style: {
          background: "#FAFAFA",
          color: "#1e1e1e", // Dark text
          borderRadius: "12px", // More rounded corners
          padding: "16px 20px", // More padding
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)", // Softer shadow
          border: "2px solid #e5e7eb", // Light border
          maxWidth: "500px", // Limit width
        },
        position:"top-center"
      },
    );
    
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && inputRef.current) {
        const roomName = inputRef.current.value.trim();
        if (roomName) {
          handleCreateRoom(roomName);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mutate, setCreateRoom,handleCreateRoom]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setCreateRoom(false);
      }
    };

    if (CR) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [CR, setCreateRoom]);

  

  return (
    <>
      {CR && (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm">
          <div
            ref={dialogRef}
            className="border bg-white text-black shadow-xl max-w-md w-full rounded-xl p-4"
          >
            <div className="text-lg text-bold font-semibold w-full">
              Create New Room
            </div>
            <div className="mt-2 text-gray-500 text-base">Enter Room Name</div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter Room Name"
              className="my-5 w-full bg-transparent border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-end">
              <button
                className="bg-white text-black rounded-lg px-4 py-2"
                onClick={() => setCreateRoom(false)}
              >
                Cancel
              </button>
              <button
                disabled={mutate.isPending}
                className="bg-blue-500 text-white rounded-lg px-4 py-2"
                onClick={() => {
                  if (inputRef.current?.value) {
                    handleCreateRoom(inputRef.current.value);
                  }
                }}
              >
                {mutate.isPending ? "Creating": "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}