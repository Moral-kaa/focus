import { SessionRecord, TimerMode } from '../types';

const STORAGE_KEY = 'focus_os_battle_records';

export const saveSession = (mode: TimerMode, duration: number) => {
  const session: SessionRecord = {
    id: crypto.randomUUID(),
    mode,
    duration,
    timestamp: Date.now(),
  };
  
  const history = loadHistory();
  history.push(session);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save battle record", e);
  }
};

export const loadHistory = (): SessionRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getWeeklyStats = () => {
  const history = loadHistory();
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyMinutes = last7Days.map(day => {
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    
    const totalSeconds = history
      .filter(s => 
        s.mode === TimerMode.STUDY && 
        s.timestamp >= day.getTime() && 
        s.timestamp < nextDay.getTime()
      )
      .reduce((acc, curr) => acc + curr.duration, 0);

    return {
      dayName: day.toLocaleDateString('zh-CN', { weekday: 'short' }),
      minutes: Math.floor(totalSeconds / 60)
    };
  });

  const totalStudySeconds = history
    .filter(s => s.mode === TimerMode.STUDY)
    .reduce((acc, curr) => acc + curr.duration, 0);

  // Calculate Streak
  // Sort history by date desc
  const sortedStudySessions = history
    .filter(s => s.mode === TimerMode.STUDY)
    .sort((a, b) => b.timestamp - a.timestamp);

  let streak = 0;
  if (sortedStudySessions.length > 0) {
    const today = new Date().setHours(0,0,0,0);
    const lastSessionDate = new Date(sortedStudySessions[0].timestamp).setHours(0,0,0,0);
    
    // If last session was today or yesterday, streak is alive
    if (today - lastSessionDate <= 86400000) {
       streak = 1;
       let currentDateCheck = lastSessionDate;
       
       // Check backwards
       for (let i = 0; i < sortedStudySessions.length; i++) {
          const sessionDate = new Date(sortedStudySessions[i].timestamp).setHours(0,0,0,0);
          if (sessionDate === currentDateCheck) continue; // same day
          if (currentDateCheck - sessionDate === 86400000) { // consecutive day
             streak++;
             currentDateCheck = sessionDate;
          } else {
             break;
          }
       }
    }
  }

  return {
    dailyMinutes,
    totalStudyHours: (totalStudySeconds / 3600).toFixed(1),
    streak,
    totalSessions: history.filter(s => s.mode === TimerMode.STUDY).length
  };
};