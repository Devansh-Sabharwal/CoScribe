"use client"
import { useEffect, useRef } from "react";

const VideoSection = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
  
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play(); // Auto-play when in view
            } else {
              videoRef.current.pause(); // Pause when out of view
            }
          }
        },
        { threshold: 0.5 } // Adjust threshold for when video should start playing
      );
  
      if (videoRef.current) {
        observer.observe(videoRef.current);
      }
  
      return () => {
        if (videoRef.current) observer.unobserve(videoRef.current);
      };
    }, []);
  
    
  
     return (
      <section id="demo" className="my-10 drop-shadow-md">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          {/* Video Container */}
          <div className="relative overflow-hidden rounded-xl shadow-2xl bg-black">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            >
              <source src="/final.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>
    );
  };
  export default VideoSection