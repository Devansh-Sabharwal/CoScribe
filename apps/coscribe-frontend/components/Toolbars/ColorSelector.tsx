import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

interface Props {
    setStrokeColor: Dispatch<SetStateAction<string>>;
    bg?: boolean;
}

export default function ColorSelector({ bg,setStrokeColor }: Props) {
    const [color, setColor] = useColor(bg?"#ffffff00": "#ffffff"); 
    const [isOpen, setIsOpen] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const demoColors = [bg?"red":"#ffffff", "#FF8383", "#2f9e44",bg?"#ffffff00": "#9479E1"];

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                divRef.current &&
                !divRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    useEffect(() => {
        setStrokeColor(color.hex); // Update stroke color
    }, [color, setStrokeColor]);

    return (
        <div className="flex flex-col items-start gap-2">
            <div className="flex gap-1 flex-wrap">
                {demoColors.map((demoColor, index) => (
                    <button
                        title={demoColor === "#ffffff00"?"Transparent":""}
                        key={index}
                        onClick={() => setColor({ ...color, hex: demoColor })}
                        style={{
                            backgroundColor: demoColor === "#ffffff00" ? "white" : demoColor,
                            backgroundImage:
                                demoColor === "#ffffff00"
                                    ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                                    : "none",
                            backgroundSize: "6px 6px",
                            backgroundPosition: "0 0, 3px 3px",
                        }}
                        className={`w-8 h-8 border-2 ${
                            // Modified comparison to handle both regular colors and transparent
                            (bg && demoColor === "#ffffff00" && color.hex === "#ffffff00") || 
                            (!bg && color.hex === demoColor)
                                ? "border-black shadow-md scale-105" 
                                : "border-gray-400"
                        } transition-all duration-200 rounded-md`}
                    />
                ))}
    
                {/* Color Picker Trigger */}
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        backgroundColor: color.hex === "#ffffff00" ? "white" : color.hex,
                        backgroundImage:
                            color.hex === "#ffffff00"
                                ? "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)"
                                : "none",
                        backgroundSize: "6px 6px",
                        backgroundPosition: "0 0, 3px 3px",
                        border: color.hex === "#ffffff00" ? "2px solid #ccc" : "none",
                    }}
                    className="w-8 h-8 border rounded-md shadow flex items-center justify-center ml-2"
                />
            </div>

            {/* Color Picker Dialog */}
            {isOpen && (
                <div
                    ref={divRef}
                    className="fixed z-50 mt-2 bg-white p-3 rounded-lg shadow-lg flex flex-col items-center border border-gray-300"
                >
                    <ColorPicker
                        color={color}
                        onChange={(newColor) => {
                            // Ensure alpha is 1 unless user explicitly picks transparent
                            const newHex = newColor.hex === "#ffffff00" ? "#ffffff00" : newColor.hex.slice(0, 7) + "ff";
                            setColor({ ...newColor, hex: newHex });
                            setStrokeColor(newHex); // Update stroke color immediately
                        }}
                    />
                </div>
            )}
        </div>
    );
}