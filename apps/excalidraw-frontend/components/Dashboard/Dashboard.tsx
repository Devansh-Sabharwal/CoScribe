"use client"
import logo from '../../public/logo.png';
import { Plus, Users, Clock, Pencil, Trash2, Check, Copy, X } from 'lucide-react';
import ProtectedRoute from "../ProtectedRoutes/ProtectedRoute"
import { useEffect,useRef,useState } from 'react'
import Dialogbox from '../dialogbox/CreateRoom';
import JoinDialogbox from '../dialogbox/JoinRoom';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { joinRoom, leaveRoom } from '@/api/room';
import { ConfirmDialog } from '../dialogbox/confirmation';
import Image from 'next/image';
import { HTTP_URL } from '@/config';
import { ScaleLoader } from 'react-spinners';
import toast from 'react-hot-toast';
interface Room{
  roomId: string;
  slug: string;
  createdAt: string;
  participants: string[];
  noOfParticipants: number
}
export function Dashboard(){
    const [rooms,setRooms] = useState<Room[]>([]);
    const [loading,setLoading] = useState<boolean>(false)
    const router = useRouter();
    const fetchRooms = async () => {
      setLoading(true);
      try{
        const response = await fetch(`${HTTP_URL}/rooms`, {
          headers: {
              authorization: "Bearer " + localStorage.getItem('token') || ''
          }
      });
      if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message);
          if(errorData.message==="User not found") router.push('/')
      }
      const data = await response.json();
      setRooms(data.messages.rooms);
      }catch(e){
        toast.error("Error occured");
        console.log(e);
      }
      finally{
        setLoading(false);

      }
  };

    useEffect(() => {
        fetchRooms();
    }, []);

    
    return <ProtectedRoute>
      <div className='bg-white min-h-screen font-[Inter,sans-serif]'>
        <Header onCreateRoom={fetchRooms}/>
        <Actions onCreateRoom={fetchRooms}/>
        <Rooms onCreateRoom={fetchRooms} rooms={rooms} loading={loading}/>
        </div>
    </ProtectedRoute>
}
interface Props{
  onCreateRoom: ()=>Promise<void>
}
function Header({onCreateRoom}:Props){
  const router = useRouter();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [createRoom,setCreateRoom] = useState<boolean>(false);
    return <div className="mt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={()=>{
          localStorage.removeItem('token');
          router.push('/')
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your rooms."
        confirmText="Logout"
      />
    <div className="flex items-center justify-between font-jakarta tracking-tight">
      <div className="flex items-center">
      <div>
          <Image src={logo} alt="Logo" className="w-24 sm:w-28" priority />
        </div>
      </div>
      <div className="flex space-x-4">
      <button 
          className="px-4 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          onClick={()=>{setCreateRoom(true)}}
          >
          
          Create Room
        </button>
        <button 
          className="px-4 py-2 bg-white border border-black rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          onClick={()=>{
            setShowLogoutConfirm(true)
          }}
        >
          Logout
        </button>
      </div>
    </div>
    {createRoom && <Dialogbox createRoom={createRoom} setCreateRoom={setCreateRoom} onCreateRoom={onCreateRoom} />}
  </div>
}
function Actions({onCreateRoom}:Props){
  const [createRoom,setCreateRoom] = useState<boolean>(false);
  const [joinRoom,setJoinRoom] = useState<boolean>(false);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    <div onClick={()=>{setCreateRoom(true)}} className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300 hover:border-black cursor-pointer transition-all group">
      <div className="flex items-center gap-2">
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-black transition-colors">
          <Plus className="h-8 w-8 text-black group-hover:text-white" />
        </div>
        <div className="ml-4">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Create New Room</h2>
          <p className="text-sm sm:text-base text-gray-500">Start a new collaborative drawing session</p>
        </div>
      </div>
    </div>
    <div onClick={()=>{setJoinRoom(true)}} className="bg-white p-6 rounded-lg border-2 shadow-md border-gray-300 hover:border-black cursor-pointer transition-all group">
      <div className="flex items-center gap-2">
        <div className="p-3 rounded-full bg-gray-100 group-hover:bg-black transition-colors">
          <Users className="h-8 w-8 text-black group-hover:text-white" />
        </div>
        <div className="ml-4">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">Join Existing Room</h2>
          <p className="text-sm sm:text-base text-gray-500">Enter a room code to collaborate</p>
        </div>
      </div>
    </div>
  </div>
  {joinRoom && <JoinDialogbox joinRoom={joinRoom} setJoinRoom={setJoinRoom} />}
  {createRoom && <Dialogbox createRoom={createRoom} setCreateRoom={setCreateRoom} onCreateRoom={onCreateRoom} />}
  </div>
}

interface RoomProps{
  rooms: Room[]
  onCreateRoom: ()=>Promise<void>
  loading:boolean
}
function Rooms(props: RoomProps) {
  const router = useRouter();
  const join = useMutation({
    mutationFn: joinRoom,
    onSuccess:()=>{
      router.push(`./canvas/${selectedRoom.current}`)
      selectedRoom.current = null;
    },
  })
  const leave = useMutation({
    mutationFn:leaveRoom,
    onSuccess:async ()=>{
      await props.onCreateRoom();
      selectedRoom.current = null;

    },
  })
  const selectedRoom = useRef<string|null>(null);
  const [copy, setCopy] = useState<string|null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState<string[]|null>(null);
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
  const [showDeleteConfirm,setShowDeleteConfirm] = useState(false);
  const handleCopyRoomId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopy(id);
    setTimeout(() => setCopy(null), 2000);
  };

  const handleParticipants = (e: React.MouseEvent, participants: string[]) => {
    e.stopPropagation();
    const button = e.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    setOverlayPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX , // Center the overlay relative to the icon
    });
    setParticipants(participants);
    setShowParticipants(true);
  };

  const handleDeleteRoom = (roomId: string) => {
    selectedRoom.current = roomId;
    toast.promise(
      leave.mutateAsync(roomId),
      {
        loading: (
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            Deleting room...
          </div>
        ),
        success: (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            Room Deleted
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
  const handleJoinRoom = (roomId:string)=>{
    selectedRoom.current = roomId;
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
            Room Joined successfully!
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
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8'>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={()=>{if (selectedRoom.current) handleDeleteRoom(selectedRoom.current)}}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        confirmText="Delete"
      />
      <div className="bg-white rounded-lg  border border-gray-200 shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Rooms</h2>
        </div>
        {!props.loading && <div className="divide-y divide-gray-200">
          {props.rooms.map((room) => (
            <div key={room.roomId} className="px-3 sm:px-6 py-4 hover:bg-gray-50 cursor-pointer group/item">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Pencil className="h-5 w-5 text-gray-400" />
                  <div className="ml-3">
                    <h3 className="text-base font-semibold font-sans text-gray-900">{room.slug}</h3>
                    <div className='flex gap-2 sm:gap-4'>
                      <div className="flex items-center mt-1">
                        <Clock className="hidden sm:block h-4 w-4 text-gray-400" />
                        <span className="hidden sm:block ml-1 text-xs text-gray-500">Created {room.createdAt}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-xs font-bold text-gray-500">Room ID: {room.roomId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyRoomId(room.roomId);
                          }}
                          className="ml-1 p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        >
                          {copy === room.roomId ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => handleParticipants(e, room.participants)}
                    className="flex items-center hover:bg-blue-50 rounded-md px-2 py-1"
                  >
                    <Users className="h-4 w-4 text-gray-400"/>
                    <span className="ml-1 text-sm text-gray-500">{room.noOfParticipants}</span>
                  </button>
                  <button disabled={join.isPending} onClick={()=>handleJoinRoom(room.roomId)} className="ml-2 sm:ml-4 sm:px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md">
                    Join
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      selectedRoom.current = room.roomId

                      setShowDeleteConfirm(true);
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 
           opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity duration-200"

                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {props.rooms.length===0 && <div className='text-black flex justify-center items-center text-center font-bold h-[30vh]'>No Rooms found</div>}
        </div>
        }

      </div>
      {props.loading && <div className='flex justify-center items-center h-[40vh]'><ScaleLoader color='black'/></div>}
      

      {/* Participants Overlay */}
      {showParticipants && participants && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setShowParticipants(false)}
          />
          <div
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]"
            style={{
              top: overlayPosition.top,
              left: overlayPosition.left,
              zIndex: 50,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Participants</h4>
              <button
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {participants.map((participant, index) => (
                <div key={index} className="py-2 text-sm text-gray-600">
                  {participant}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}