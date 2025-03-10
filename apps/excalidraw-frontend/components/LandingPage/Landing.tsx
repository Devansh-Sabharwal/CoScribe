import { Navbar } from "./Navbar";
import { Features } from "./Features";
import Footer from "./Footer";
import VideoSection from "./VideoSection";
import { HeroSection } from "./HeroSection";
import { Footer1 } from "./CTA";

export default function Landing() {
  return (
    <div className="max-w-7xl font-jakarta tracking-tightest mx-auto px-4 sm:px-8 overflow-hidden">
      <Navbar  />
      <HeroSection/>
      <VideoSection/>
      <Features/>
      <Footer1/>
      <Footer/>
    </div>
  );
}





