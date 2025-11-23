import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TimerMode, TimerSettings, SystemStatus } from './types';
import { TimerDisplay } from './components/TimerDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { StatsPanel } from './components/StatsPanel';
import { NinjaSensei } from './components/NinjaSensei';
import { getSystemStatus } from './services/geminiService';
import { saveSession } from './services/statsService';

// Audio Context helper
const playSound = (type: 'tick' | 'alarm' | 'warning') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'tick') {
    osc.type = 'square'; // More 8-bit/rough sound
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } else if (type === 'warning') {
    osc.type = 'sawtooth'; // Harsher warning
    osc.frequency.setValueAtTime(110, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else {
    // Dramatic Chord
    const t = ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, t); 
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(554.37, t); // C#
    osc2.connect(gain);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2);
    
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 2);
    osc2.stop(t + 2);
  }
};

const DEFAULT_SETTINGS: TimerSettings = {
  studyDuration: 25,
  breakDuration: 5,
  autoStartLoop: false,
  enableNotifications: false,
  enableSound: true,
};

const App: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>(TimerMode.STUDY);
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.studyDuration * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Panels
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // AI State
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Refs
  const timerRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);

  const getTotalTime = useCallback(() => {
    return (mode === TimerMode.STUDY ? settings.studyDuration : settings.breakDuration) * 60;
  }, [mode, settings.studyDuration, settings.breakDuration]);

  const fetchStatus = useCallback(async (currentMode: TimerMode) => {
    setStatusLoading(true);
    try {
      const newStatus = await getSystemStatus(currentMode);
      setStatus(newStatus);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus(mode);
  }, [mode, fetchStatus]);

  const handleUpdateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
    if (!isActive) {
      if (mode === TimerMode.STUDY) {
        setTimeLeft(newSettings.studyDuration * 60);
      } else {
        setTimeLeft(newSettings.breakDuration * 60);
      }
    }
  };

  const switchMode = useCallback(() => {
    const nextMode = mode === TimerMode.STUDY ? TimerMode.BREAK : TimerMode.STUDY;
    setMode(nextMode);
    
    const nextDuration = nextMode === TimerMode.STUDY ? settings.studyDuration : settings.breakDuration;
    setTimeLeft(nextDuration * 60);
    
    if (settings.autoStartLoop) {
      startTimer(nextDuration * 60);
    } else {
      setIsActive(false);
    }
  }, [mode, settings]);

  const startTimer = (durationSeconds?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const duration = durationSeconds ?? timeLeft;
    const now = Date.now();
    endTimeRef.current = now + duration * 1000;
    
    setIsActive(true);
    
    timerRef.current = window.setInterval(() => {
      const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimerComplete();
      } else {
        if (remaining === 60 || remaining === 10) {
           if (settings.enableNotifications) {
             new Notification("警报", {
               body: `${mode === TimerMode.STUDY ? "专注" : "休息"} 时间即将结束!`,
             });
           }
           if (settings.enableSound) playSound('warning');
        }
        setTimeLeft(remaining);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeLeft(getTotalTime());
  };

  const handleTimerComplete = () => {
    // Save stats if a study session finished
    if (mode === TimerMode.STUDY) {
      saveSession(mode, getTotalTime());
    }

    if (settings.enableSound) playSound('alarm');
    if (settings.enableNotifications && 'Notification' in window) {
      new Notification("任务完成", { body: "准备进入下一阶段。" });
    }
    switchMode();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-4">
      
      {/* Manga Page Border Decorations */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-black pointer-events-none"></div>
      <div className="fixed top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-black pointer-events-none"></div>
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-black pointer-events-none"></div>
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-black pointer-events-none"></div>

      {/* Header - Panel 1 */}
      <header className="w-full max-w-2xl flex justify-between items-end mb-6 border-b-4 border-black pb-4">
         <div className="flex flex-col">
             <h1 className="text-6xl font-black manga-font manga-title tracking-tighter leading-none">
                FOCUS<br/><span className="text-4xl bg-black text-white px-2">OS</span>
             </h1>
         </div>
         <div className="flex gap-3 items-end">
            <div className="flex flex-col items-end">
              <span className="font-bold text-xs bg-black text-white px-1 mb-1">统计</span>
              <button 
                  onClick={() => setShowStats(true)}
                  className="manga-btn w-12 h-12 rounded-none"
                  aria-label="Statistics"
              >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
              </button>
            </div>

            <div className="flex flex-col items-end">
                <span className="font-bold text-xs bg-black text-white px-1 mb-1">设置</span>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="manga-btn w-12 h-12 rounded-none"
                    aria-label="Settings"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.49l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>
                </button>
            </div>
         </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center z-10">
        
        {/* Panel 2: Narrative */}
        <NinjaSensei status={status} loading={statusLoading} />

        {/* Panel 3: Main Action */}
        <div className="manga-panel w-full p-4 mb-8 bg-white">
            {/* Speed lines if active */}
            {isActive && (
                 <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[repeating-conic-gradient(from_0deg,transparent_0deg_10deg,rgba(0,0,0,0.1)_10deg_20deg)] animate-spin-slow"></div>
                 </div>
            )}
            
            <div className="relative z-10">
                <TimerDisplay 
                    timeLeft={timeLeft} 
                    totalTime={getTotalTime()} 
                    mode={mode}
                    isActive={isActive}
                />
            </div>

            {/* Controls integrated into the panel */}
            <div className="flex gap-6 justify-center mt-2 mb-4 relative z-20">
                {/* Reset Button */}
                <button 
                    onClick={resetTimer}
                    className="manga-btn w-16 h-16 rounded-full text-black hover:bg-black hover:text-white group"
                    aria-label="RESET"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>

                {/* Main Action Button */}
                <button 
                    onClick={() => isActive ? pauseTimer() : startTimer()}
                    className={`
                        manga-btn w-24 h-24 rounded-full flex items-center justify-center transition-all border-4
                        ${isActive ? 'bg-black text-white border-black shake-hard' : 'bg-white text-black border-black hover:scale-105'}
                    `}
                >
                    {isActive ? (
                         <div className="flex gap-1">
                            <div className="w-2 h-8 bg-white"></div>
                            <div className="w-2 h-8 bg-white"></div>
                         </div>
                    ) : (
                        <svg className="w-12 h-12 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                </button>

                 {/* Skip Button */}
                 <button 
                    onClick={handleTimerComplete}
                    className="manga-btn w-16 h-16 rounded-full text-black hover:bg-black hover:text-white"
                    aria-label="SKIP"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
        </div>

      </main>

      {/* Footer Status */}
      <div className="fixed bottom-2 left-0 right-0 text-center pointer-events-none">
          <div className="inline-block bg-white border-2 border-black px-4 py-1 transform rotate-2 shadow-[2px_2px_0px_#000]">
            <div className="flex gap-4 text-xs font-black tracking-widest text-black">
                <span>同步率: 100%</span>
                <span>能量: 最大</span>
            </div>
          </div>
      </div>

      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <StatsPanel
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />

    </div>
  );
};

export default App;