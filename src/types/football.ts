export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  status: MatchStatus;
  leagueId: string;
  stadium?: string;
  referee?: string;
  analysisStatus: AnalysisStatus;
  analysisId?: string;
  highlights?: Highlight[];
  stats?: MatchStats;
}

export type MatchStatus = "scheduled" | "live" | "completed" | "postponed" | "cancelled";
export type AnalysisStatus = "pending" | "in_progress" | "completed" | "published";

export interface League {
  id: string;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
  active: boolean;
  startDate: string;
  endDate: string;
  teams?: string[];
}

export interface Highlight {
  id: string;
  matchId: string;
  timestamp: string;
  type: HighlightType;
  player?: string;
  team: string;
  description: string;
}

export type HighlightType =
  | "goal"
  | "red_card"
  | "yellow_card"
  | "penalty"
  | "substitution"
  | "var"
  | "injury"
  | "other";

export interface MatchStats {
  possession: {
    home: number;
    away: number;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
  corners: {
    home: number;
    away: number;
  };
  fouls: {
    home: number;
    away: number;
  };
  yellowCards: {
    home: number;
    away: number;
  };
  redCards: {
    home: number;
    away: number;
  };
  offsides: {
    home: number;
    away: number;
  };
}

export interface MatchFormValues {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  leagueId: string;
  stadium?: string;
  referee?: string;
  status: MatchStatus;
}

export interface LeagueFormValues {
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
  active: boolean;
  startDate: string;
  endDate: string;
}
