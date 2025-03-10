import { Dispatch, SetStateAction } from "react";
import ColorSelector from "./ColorSelector";
interface SideToolbarProps{
    color: string
    setColor: Dispatch<SetStateAction<string>>
    bgColor: string
    setBgColor: Dispatch<SetStateAction<string>>
    strokeWidth: number
    setStrokeWidth: Dispatch<SetStateAction<number>>
    strokeStyle:string
    setStrokeStyle:Dispatch<SetStateAction<string>>
}
export default function SideToolbar({setColor,setBgColor,setStrokeWidth,setStrokeStyle}:SideToolbarProps) {
  return (
    <div className="fixed z-0 rounded-xl top-24 left-4 w-60 bg-[#232329] px-3 sm:px-6 py-4 sm:py-8 flex flex-col gap-6">
        <div>
            <div className="mb-2">Stroke</div>
            <ColorSelector setStrokeColor={setColor}/>
        </div>
        <div>
            <div className="mb-2">Background Color</div>
            <ColorSelector setStrokeColor={setBgColor} bg={true} />
        </div>
        <div>
            <div>Stroke Width</div>
            <StrokeWidth setStrokeWidth={setStrokeWidth}/>
        </div>
        <div>
            <div>Stroke Style</div>
            <StrokeStyle setStrokeStyle={setStrokeStyle}/>
        </div>
    </div>
  )
}
import { useState } from "react";
interface StrokeWidthProps{
    setStrokeWidth: Dispatch<SetStateAction<number>>
}
function StrokeWidth({setStrokeWidth}:StrokeWidthProps) {
    const widths = [2, 4, 6];
    const [selectedWidth, setSelectedWidth] = useState(2);

    return (
        <div className="flex gap-6">
            {widths.map((width) => (
                <div
                 key={width}     
                onClick={() => {
                    setSelectedWidth(width)
                    setStrokeWidth(width)
                }}
                className={`h-6 flex items-center cursor-pointer transition-all duration-200 mt-2 px-2 ${
                    selectedWidth === width ? "bg-blue-500" : "hover:bg-[#373741]"
                }`}>
                <div    
                    style={{ borderBottom: `${width}px solid white`, width: "32px" }}
                />
                </div>
            ))}
        </div>
    );
}
    interface StrokeStyleProps{
        setStrokeStyle:Dispatch<SetStateAction<string>>

    }
    function StrokeStyle({setStrokeStyle}:StrokeStyleProps) {
    const styles = [
        { name: "Solid", style: "solid" },
        { name: "Dashed", style: "dashed" },
        { name: "Dotted", style: "dotted" },
    ];
    const [selectedStyle, setSelectedStyle] = useState("solid");

    return (
        <div className="flex gap-6">
            {styles.map((stroke) => (
                <div 
                key={stroke.name}
                onClick={() => {
                    setSelectedStyle(stroke.style)
                    setStrokeStyle(stroke.style)
                }}
                className={`h-6 flex items-center cursor-pointer transition-all duration-200 px-2 mt-2 ${
                    selectedStyle === stroke.style ? "bg-blue-500" : "hover:bg-[#373741]"
                }`}>
                <div
                    
                    style={{ borderBottom: `3px ${stroke.style} white`, width: "32px" }}
                />
                </div>
            ))}
        </div>
    );
}

