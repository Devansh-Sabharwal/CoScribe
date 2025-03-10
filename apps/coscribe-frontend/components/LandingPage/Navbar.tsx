"use client";
import Image from 'next/image';
import logo from '../../public/logo.png';
import { Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for the dropdown menu

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="mt-10 relative">
      <div className="py-4 px-6 drop-shadow-md shadow-[0_4px_6px_rgba(0,0,0,0.1)] border rounded-xl flex items-center justify-between">
        {/* Logo */}
        <div>
          <Image src={logo} alt="Logo" className="w-20 sm:w-24" priority />
        </div>

        {/* Desktop Navigation (visible on sm and above) */}
        <div className="hidden sm:flex justify-between w-full max-w-sm items-center text-xs sm:text-base">
          <Link href="#features" className="hover:text-gray-600 cursor-pointer">
            Features
          </Link>
          <Link
            href="https://github.com/Devansh-Sabharwal"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 cursor-pointer"
          >
            Github
          </Link>
          <Link href="/signin" className="hover:text-gray-600 cursor-pointer">
            Signin
          </Link>
          <Link
            href="/signup"
            className="bg-black rounded-xl sm:rounded-3xl text-xs sm:text-sm text-white p-2 sm:px-5 hover:bg-gray-800 cursor-pointer"
          >
            Try Now
          </Link>
        </div>

        {/* Mobile Menu Button (visible on sm and below) */}
        <div className="sm:hidden">
          <button onClick={toggleMenu} className="text-black focus:outline-none">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (overlay) */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="sm:hidden absolute top-full left-0 right-0 mt-2 p-4 drop-shadow-md shadow-[0_4px_6px_rgba(0,0,0,0.1)] border rounded-xl bg-white z-50"
        >
          <div className="flex flex-col gap-3">
            <Link href="#features" className="hover:text-gray-600 cursor-pointer">
              Features
            </Link>
            <Link
              href="https://github.com/Devansh-Sabharwal"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 cursor-pointer"
            >
              Github
            </Link>
            <Link href="/signin" className="hover:text-gray-600 cursor-pointer">
              Signin
            </Link>
            <Link
              href="/signup"
              className="hover:text-gray-600 cursor-pointer"
            >
              Try Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}