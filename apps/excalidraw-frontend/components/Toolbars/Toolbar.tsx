import { Draw } from '@/draw/draw';
import { Square, Circle, Diamond, ArrowRight, Pencil, Type, Eraser, Trash2, MousePointer, Minus, LogOutIcon, LucideProps } from 'lucide-react';
import { Dispatch, ForwardRefExoticComponent, RefAttributes, SetStateAction, useEffect, useState } from 'react';
import { clearCanvas } from "@/draw/http";
import { ConfirmDialog } from '../dialogbox/confirmation';
import { useRouter } from 'next/navigation';
export function Toolbar({
    shape,
    setShape,
    roomId,
    draw
}: {
    shape:"select" | "text" | "circle" | "line" | "rect" | "diamond" | "arrow" | "pencil" | "eraser"
    setShape: Dispatch<SetStateAction<"select" | "text" | "circle" | "line" | "rect" | "diamond" | "arrow" | "pencil" | "eraser">>;
    roomId: string;
    draw: Draw | undefined;
}) {
    const [trashOpen,setTrashOpen] = useState<boolean>(false);
    const [logoutOpen,setLogoutOpen] = useState<boolean>(false);
    const router = useRouter();
    return (
        <div className='fixed z-[1000] top-4 left-1/2 transform -translate-x-1/2'>
            <div className="flex gap-1 sm:gap-2 bg-[#232329] p-1 sm:p-2 rounded-xl">
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"select"}
                    icon={MousePointer}
                    id={"1"}
                    title={"Selection — V or 1"}
                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"rect"}
                    icon={Square}
                    id={"2"}
                    title={"Rectangle — R or 2"}
                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"diamond"}
                    icon={Diamond}
                    id={"3"}
                    title={"Diamond — D or 3"}

                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"circle"}
                    icon={Circle}
                    id={"4"}
                    title={"Ellipse — O or 4"}

                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"arrow"}
                    icon={ArrowRight}
                    id={"5"}
                    title={"Arrow — A or 5"}

                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"line"}
                    icon={Minus}
                    id={"6"}
                    title={"Line — L or 6"}
                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"pencil"}
                    icon={Pencil}
                    id={"7"}
                    title={"Draw — P or 7"}
                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"text"}
                    icon={Type}
                    id={"8"}
                    title={"Text — T or 8"}
                />
                <ToolBarButton
                    shape={shape}
                    setShape={setShape}
                    text={"eraser"}
                    icon={Eraser}
                    id={"9"}
                    title={"Eraser — E or 9"}
                />
                <div className='border-l border-gray-400 pr-1 sm:pr-2'>
                    <div
                        className="bg-[#232329] hover:bg-[#373741] text-white hover:cursor-pointer mx-1 py-2 rounded-xl flex items-center"
                        onClick={() => {setTrashOpen(true)}}
                    >
                        <div className='px-1 sm:px-2 p-1'>
                            <Trash2 className='size-5 sm:size-6' />
                        </div>
                    </div>
                </div>
                <div
                        className="bg-[#232329] hover:bg-[#373741] text-white hover:cursor-pointer py-2 rounded-xl flex items-center"
                        onClick={()=>setLogoutOpen(true)}
                    >
                        <div className='px-1 sm:px-2 p-1'>
                            <LogOutIcon className='size-5 sm:size-6' />
                        </div>
                    </div>
                </div>

                <ConfirmDialog
                    isOpen={logoutOpen}
                    onClose={() => setLogoutOpen(false)}
                    onConfirm={()=>{router.push('/dashboard')}}
                    title="Confirm Logout"
                    message="Are you sure you want to go to the dashboard? You can join anytime you want."
                    confirmText="Go to Dashboard"
                />
                <ConfirmDialog
                    isOpen={trashOpen}
                    onClose={() => setTrashOpen(false)}
                    onConfirm={() => { clearCanvas(roomId); draw?.clean(); }}
                    title="Confirm Deleting "
                    message="Are you sure you want to delete all your drawings? This action is irreversible and cannot be undone"
                    confirmText="Delete"
                />
        </div>
    );
}

interface ToolbarProps {
    shape:"select" | "text" | "circle" | "line" | "rect" | "diamond" | "arrow" | "pencil" | "eraser"
    setShape: Dispatch<SetStateAction<"select" | "text" | "circle" | "line" | "rect" | "diamond" | "arrow" | "pencil" | "eraser">>;
    text: "select" | "text" | "circle" | "line" | "rect" | "diamond" | "arrow" | "pencil" | "eraser";
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
    id: string;
    title: string
}

function ToolBarButton({shape, setShape, text, icon: Icon,id,title}: ToolbarProps) {
    const isSelected = shape === text; // Check if the current tool is selected
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const match = title.match(/— (\w) or (\d)/);
            if (match) {
                const keyChar = match[1].toLowerCase();
                const keyNum = match[2];

                if ((event.key.toLowerCase() === keyChar || event.key === keyNum)) {
                    if(shape!=="text")setShape(text);
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setShape,shape,text,title]);
    return (
        <div
            title={`${title}`}
            className={`relative py-2 mx-1 rounded-xl hover:cursor-pointer ${
                isSelected ? 'bg-blue-500' : 'bg-[#232329] hover:bg-[#373741]'
            }`}
            onClick={() => {
                setShape(text);
            }}
        >
            <div className='mx-1 sm:mx-2 p-1'>
                <Icon className='size-5 sm:size-6' />
            </div>
            
            {/* ID indicator */}
            <div className="hidden sm:block absolute bottom-0.5 right-1 text-[14px] opacity-60 font-mono">
                {id}
            </div>
        </div>
    );
}