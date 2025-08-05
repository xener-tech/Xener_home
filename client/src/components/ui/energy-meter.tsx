import { useEffect, useState } from "react";

interface EnergyMeterProps {
  score: number;
  className?: string;
}

export default function EnergyMeter({ score, className = "" }: EnergyMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const percentage = (animatedScore / 100) * 360;

  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <div 
        className="energy-meter w-full h-full rounded-full transition-all duration-1000 ease-out"
        style={{ 
          background: `conic-gradient(from 0deg, hsl(122, 100%, 39%) 0deg, hsl(122, 100%, 39%) ${percentage}deg, hsl(220, 13%, 91%) ${percentage}deg, hsl(220, 13%, 91%) 360deg)` 
        }}
      ></div>
      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
        <i className="fas fa-leaf text-primary text-xl"></i>
      </div>
    </div>
  );
}
