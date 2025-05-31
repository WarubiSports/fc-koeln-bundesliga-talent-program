export interface PlayerFilters {
  search?: string;
  position?: string;
  ageGroup?: string;
  nationality?: string;
  status?: string;
}

export interface DashboardStats {
  totalPlayers: number;
  activeTeams: number;
  countries: number;
  avgRating: number;
}

export interface Activity {
  id: number;
  type: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  message: string;
  description: string;
  time: string;
}
