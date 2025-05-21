export interface Player {
  id: string;
  username: string;
  isOnline: boolean;
  isHost: boolean;
  points: number;
}

export interface Session {
  room: string;
  code: string;
  name: string;
  players: Player[];
  isOnlineMode: boolean;
  password: string | null;
  usedQuestions: string[];
  status: 'waiting' | 'in_game_selection_menu' | 'in_game' | 'ended';
  currentGameId: string | null;
  createdAt: number;
}
