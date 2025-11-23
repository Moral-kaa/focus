import React, { useState, useEffect } from 'react';
import { TimerSettings } from '../types';

interface SettingsPanelProps {
  settings: TimerSettings;
  onUpdateSettings: (newSettings: TimerSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSettings, isOpen, onClose }) => {
  const [studyInput, setStudyInput] = useState(settings.studyDuration.toString());
  const [breakInput, setBreakInput] = useState(settings.breakDuration.toString());

  useEffect(() => {
    if (isOpen) {
      setStudyInput(settings.studyDuration.toString());
      setBreakInput(settings.breakDuration.toString());
    }
  }, [isOpen, settings.studyDuration, settings.breakDuration]);

  if (!isOpen) return null;

  const handleDurationChange = (key: 'studyDuration' | 'breakDuration', value: string) => {
    if (key === 'studyDuration') {
      setStudyInput(value);
    } else {
      setBreakInput(value);
    }

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
        onUpdateSettings({ ...settings, [key]: numValue });
    }
  };

  const handleBlur = (key: 'studyDuration' | 'breakDuration') => {
    const value = key === 'studyDuration' ? studyInput : breakInput;
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue <= 0) {
      if (key === 'studyDuration') setStudyInput(settings.studyDuration.toString());
      else setBreakInput(settings.breakDuration.toString());
    }
  };

  const handleToggleChange = (key: keyof TimerSettings, value: boolean) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
      {/* Speed lines background for modal */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[repeating-linear-gradient(45deg,#000,#000_1px,transparent_1px,transparent_10px)]"></div>

      <div className="manga-panel w-full max-w-md border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
        
        <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
            <h2 className="text-2xl md:text-3xl manga-font tracking-wide italic">
                系统配置
            </h2>
            <button 
            onClick={onClose}
            className="bg-white text-black w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-200 border-2 border-white"
            >
            ✕
            </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 md:space-y-8 bg-white">
          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            <div>
              <label className="block text-black font-black text-xs md:text-sm mb-2 uppercase bg-black text-white inline-block px-2 transform -skew-x-12">
                  专注 (分钟)
              </label>
              <div className="relative">
                <input 
                    type="number" 
                    min="1"
                    max="120"
                    value={studyInput}
                    onChange={(e) => handleDurationChange('studyDuration', e.target.value)}
                    onBlur={() => handleBlur('studyDuration')}
                    className="w-full manga-input text-3xl md:text-4xl p-2 text-center font-black"
                />
                {/* Hand-drawn underline effect */}
                <div className="h-1 bg-black mt-1 w-full transform rotate-1"></div>
              </div>
            </div>
            <div>
              <label className="block text-black font-black text-xs md:text-sm mb-2 uppercase bg-black text-white inline-block px-2 transform -skew-x-12">
                  休息 (分钟)
              </label>
              <div className="relative">
                 <input 
                    type="number" 
                    min="1"
                    max="60"
                    value={breakInput}
                    onChange={(e) => handleDurationChange('breakDuration', e.target.value)}
                    onBlur={() => handleBlur('breakDuration')}
                    className="w-full manga-input text-3xl md:text-4xl p-2 text-center font-black"
                />
                <div className="h-1 bg-black mt-1 w-full transform -rotate-1"></div>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-black w-full"></div>

          {/* Toggles */}
          <div className="space-y-4">
            <ToggleOption 
              label="自动循环协议" 
              checked={settings.autoStartLoop} 
              onChange={() => handleToggleChange('autoStartLoop', !settings.autoStartLoop)} 
            />
            
            <ToggleOption 
              label="桌面警报系统" 
              checked={settings.enableNotifications} 
              onChange={() => {
                   if (!settings.enableNotifications && 'Notification' in window) {
                     Notification.requestPermission();
                   }
                   handleToggleChange('enableNotifications', !settings.enableNotifications);
              }}
            />

            <ToggleOption 
              label="音频反馈" 
              checked={settings.enableSound} 
              onChange={() => handleToggleChange('enableSound', !settings.enableSound)} 
            />
          </div>
        </div>

        <div className="p-6 bg-gray-100 border-t-4 border-black">
          <button 
            onClick={onClose}
            className="w-full manga-btn py-3 md:py-4 text-xl font-black hover:bg-black hover:text-white"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleOption = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <div className="flex items-center justify-between group cursor-pointer select-none" onClick={onChange}>
    <span className={`font-bold text-sm tracking-widest transition-colors ${checked ? 'text-black underline decoration-2' : 'text-gray-500'}`}>
        {label}
    </span>
    
    {/* Manga Checkbox */}
    <div className={`
        w-8 h-8 border-4 border-black flex items-center justify-center transition-all
        ${checked ? 'bg-black' : 'bg-white'}
    `}>
        {checked && <span className="text-white font-bold text-xl">✓</span>}
    </div>
  </div>
);