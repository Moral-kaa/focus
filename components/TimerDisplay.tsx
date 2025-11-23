import React from 'react';
import { TimerMode } from '../types';

interface TimerDisplayProps {
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
  mode: TimerMode;
  isActive: boolean;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, mode, isActive }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  
  // SVG Config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-full py-8 md:py-12">
      
      {/* Japanese SFX Background Text */}
      <div className={`absolute top-0 right-4 md:right-10 text-4xl md:text-6xl font-black opacity-10 select-none pointer-events-none transform rotate-12 transition-opacity duration-300 ${isActive ? 'opacity-20' : 'opacity-5'}`}>
        ゴゴゴ
      </div>
      <div className={`absolute bottom-4 left-0 md:bottom-10 text-4xl md:text-5xl font-black opacity-10 select-none pointer-events-none transform -rotate-12 transition-opacity duration-300 ${isActive ? 'opacity-20' : 'opacity-5'}`}>
        ドンド
      </div>

      <div className="relative w-full max-w-[280px] md:max-w-[320px] aspect-square">
        {/* Outer Spike Burst for emphasis */}
         {isActive && (
             <div className="absolute inset-[-10px] md:inset-[-20px] flex items-center justify-center animate-spin-slow opacity-20">
                 <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    <path d="M50 0 L55 40 L90 30 L60 60 L100 50 L60 70 L50 100 L40 70 L0 50 L40 60 L10 30 L45 40 Z" fill="black" />
                 </svg>
             </div>
         )}

        <svg className="w-full h-full transform -rotate-90 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]" viewBox="0 0 320 320">
          {/* Track */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="black"
            strokeWidth="8"
            fill="white"
            strokeDasharray="4 8"
          />
          
          {/* Thick Black Progress Ring */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="black"
            strokeWidth="24"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className="transition-all duration-500 ease-out"
          />
          
          {/* Inner decorative thin ring */}
           <circle
            cx="160"
            cy="160"
            r={radius - 20}
            stroke="black"
            strokeWidth="2"
            fill="transparent"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
          <div className="manga-font text-lg md:text-xl bg-black text-white px-2 py-1 transform -skew-x-12 mb-2 border-2 border-black">
              {mode === TimerMode.STUDY ? '战斗模式' : '恢复模式'}
          </div>
          
          <span className="text-6xl md:text-7xl font-black tracking-tighter text-black manga-font" style={{ textShadow: '2px 2px 0px #fff' }}>
            {formatTime(timeLeft)}
          </span>
          
          <div className="mt-4 flex flex-col items-center">
              {isActive ? (
                 <div className="bg-black text-white text-xs font-bold px-3 py-1 animate-pulse uppercase">
                    !!! 记录中 !!!
                 </div>
              ) : (
                  <div className="text-black text-xs font-bold border-b-2 border-black">
                     等待输入
                  </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};