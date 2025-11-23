export enum TimerMode {
  STUDY = 'STUDY',
  BREAK = 'BREAK',
}

export interface TimerSettings {
  studyDuration: number; // in minutes
  breakDuration: number; // in minutes
  autoStartLoop: boolean;
  enableNotifications: boolean;
  enableSound: boolean;
}

export interface SystemStatus {
  module: string;
  message: string;
}

export interface SessionRecord {
  id: string;
  mode: TimerMode;
  duration: number; // in seconds
  timestamp: number;
}
