export interface HistoryItem {
  id: string;
  timestamp: number;
  thumbnail: string; // Storing a small version or the full base64 if small
  text: string;
}

export interface User {
  username: string;
}

export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD'
}