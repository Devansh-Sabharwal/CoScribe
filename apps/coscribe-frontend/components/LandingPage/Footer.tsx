import { Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white py-16 px-4 sm:px-6 border-t-2 border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="mb-4">
            <Link href="/" className="inline-block">
                <Image src={"/logo.png"} alt="logo" width={150} height={150}/>
            </Link>
          </div>
          
          <div className="text-2xl md:text-3xl font-bold text-center text-gray-900">
            Sketch. Collaborate. Create. Together.
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex space-x-4 mb-4">
            <Link 
              href="https://www.linkedin.com/in/devanshsabharwal/" 
              className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer" 
            >
              <Linkedin className="w-8 h-8 text-gray-700" />
            </Link>
            <Link 
              href="https://x.com/Devansh2k4" 
              className="flex items-center justify-center w-12 h-12 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer" 
            >
              <Twitter className="w-8 h-8 text-gray-700" />
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
            <Link 
              href="https://github.com/Devansh-Sabharwal" 
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2">👁️</span>
              <span>Insights</span>
            </Link>
            <Link 
              href="https://x.com/Devansh2k4" 
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span className="mr-2">👋</span>
              <span>Contact</span>
            </Link>
          </div>
        </div>
        
        <div className="text-center text-gray-600 text-sm">
          © 2025 CoScribe. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;