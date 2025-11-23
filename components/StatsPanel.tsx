import React, { useEffect, useState } from 'react';
import { getWeeklyStats } from '../services/statsService';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(getWeeklyStats());

  useEffect(() => {
    if (isOpen) {
      setStats(getWeeklyStats());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxMinutes = Math.max(...stats.dailyMinutes.map(d => d.minutes), 60); // Minimum scale of 60m

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm">
       <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle,black_2px,transparent_2.5px)] bg-[length:20px_20px]"></div>
      
      <div className="manga-panel w-full max-w-2xl border-4 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 flex flex-col relative max-h-[90vh]">
        
        {/* Close Button Absolute */}
        <button 
            onClick={onClose}
            className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-black text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black text-xl border-2 border-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform z-50 rounded-full md:rounded-none"
        >
            ✕
        </button>

        {/* Header */}
        <div className="p-4 md:p-6 border-b-4 border-black bg-black text-white shrink-0">
            <h2 className="text-3xl md:text-4xl manga-font tracking-widest italic text-center">
                战斗记录
            </h2>
            <p className="text-center text-xs tracking-[0.5em] mt-2 opacity-80">同步日志</p>
        </div>

        <div className="p-4 md:p-8 bg-white overflow-y-auto">
            
            {/* Top Stats Grid - Responsive 1 col on mobile, 3 cols on tablet+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatBox label="战力指数" value={stats.totalStudyHours} sub="总小时数" />
                <StatBox label="连击" value={stats.streak.toString()} sub="连续天数" />
                <StatBox label="任务" value={stats.totalSessions.toString()} sub="已完成" />
            </div>

            {/* Chart Section */}
            <div className="border-4 border-black p-4 relative mb-4">
                <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-xs font-bold transform -translate-y-1/2 translate-x-4">
                    周输出波形
                </div>
                
                <div className="flex items-end justify-between h-32 md:h-48 mt-4 gap-1 md:gap-2">
                    {stats.dailyMinutes.map((day, idx) => {
                        const heightPercent = Math.min((day.minutes / maxMinutes) * 100, 100);
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group">
                                <div className="text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {day.minutes}
                                </div>
                                <div 
                                    className="w-full bg-black border-2 border-black relative transition-all duration-500 ease-out group-hover:bg-gray-800"
                                    style={{ 
                                        height: `${heightPercent}%`, 
                                        minHeight: '4px',
                                        // Screentone pattern for bars
                                        backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)',
                                        backgroundSize: '4px 4px',
                                        backgroundPosition: '0 0, 2px 2px' 
                                    }}
                                ></div>
                                <div className="mt-2 text-[10px] md:text-xs font-black transform -rotate-12">{day.dayName}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

             {/* Flavor Text Footer */}
             <div className="mt-4 border-t-2 border-dashed border-black pt-4 text-center">
                <p className="text-sm font-bold italic">
                    {stats.streak > 3 
                        ? ">>> 系统过载已启动。性能超出预期。" 
                        : ">>> 系统正常。保持专注以提高同步率。"}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub }: { label: string, value: string, sub: string }) => (
    <div className="border-2 border-black p-2 md:p-3 text-center bg-gray-50 shadow-[4px_4px_0px_#000] active:translate-y-1 active:shadow-none hover:md:translate-y-1 hover:md:shadow-[2px_2px_0px_#000] transition-all">
        <div className="text-xs font-bold text-gray-500 mb-1">{label}</div>
        <div className="text-2xl md:text-3xl font-black manga-font leading-none">{value}</div>
        <div className="text-[10px] font-bold bg-black text-white inline-block px-1 mt-1">{sub}</div>
    </div>
);