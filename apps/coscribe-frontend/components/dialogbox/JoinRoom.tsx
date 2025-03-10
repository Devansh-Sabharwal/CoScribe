import { joinRoom } from "@/api/room"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useRef } from "react"
import toast from "react-hot-toast"
interface DialogboxProps{
    joinRoom:boolean,
    setJoinRoom:Dispatch<SetStateAction<boolean>>
}
export default function JoinDialogbox({joinRoom:JoinRoom,setJoinRoom}:DialogboxProps){
    const router = useRouter();
    const dialogRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null);
    const join = useMutation({
      mutationFn: joinRoom,
      onSuccess:()=>{
        router.push(`./canvas/${inputRef.current?.value}`)
      },
    })
    const handleJoinRoom = (roomId:string)=>{
        
      toast.promise(
        join.mutateAsync(roomId),
        {
          loading: (
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              Joining room...
            </div>
          ),
          success: (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              Room Joined successfully! , Redirecting...
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
      console.log("Joining Room..");
    }
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && inputRef.current) {
          const roomId = inputRef.current.value.trim();
          if (roomId) {
            handleJoinRoom(roomId);
          }
        }
      };
  
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [setJoinRoom,join,handleJoinRoom]);
    useEffect(()=>{
          const handleClick = (e:MouseEvent)=>{
            if(dialogRef.current && !dialogRef.current.contains(e.target as Node)){
              setJoinRoom(false);
            }
          }
          if(JoinRoom){
            document.addEventListener('mousedown',handleClick);
          }
          return ()=>{
            document.removeEventListener('mousedown',handleClick);
          }
        },[JoinRoom,setJoinRoom])
        
      
    return <><div className='fixed inset-0 flex justify-center items-center backdrop-blur-sm'>
    <div ref={dialogRef} className='bg-white border text-black shadow-xl max-w-md w-full rounded-xl p-4'>
      <div className='text-lg text-bold font-semibold w-full'>Join New Room</div>
      <div className='mt-2 text-gray-500 text-base'>Enter Room Id</div>
      <input ref={inputRef} type="text" placeholder='Enter Room Id' className='my-5 w-full bg-transparent border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'></input>
      <div className='flex justify-end'>
        <button className='bg-white text-black rounded-lg px-4 py-2' onClick={()=>setJoinRoom(false)}>Cancel</button>
        <button className='bg-blue-500 text-white rounded-lg px-4 py-2' onClick={()=>inputRef.current?.value && handleJoinRoom(inputRef.current.value)}>Join</button>
      </div>
    </div>
  </div>
  </>
}