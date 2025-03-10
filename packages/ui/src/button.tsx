"use client";

interface ButtonProps {
  text: React.ReactNode
  onClick: (e: React.FormEvent) => void
  type?: "submit"|"button"
  disabled:boolean
}

export const Button = (props: ButtonProps) => {
  return (
    <button className="px-4 py-2 rounded-lg w-full bg-black text-white hover:bg-[#333333]" onClick={props.onClick} type={props.type?props.type:"button"} disabled={props.disabled}>
      {props.text}
    </button>
  );
};
