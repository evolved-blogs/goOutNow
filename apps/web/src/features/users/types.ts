export interface UserStats {
  eventsHosted: number;
  activitiesJoined: number;
  peopleMet: number;
  rating: number;
  ratingCount: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  createdAt: string;
  stats: UserStats;
}

export interface RecentActivity {
  id: string;
  title: string;
  activityType: string;
  scheduledTime: string;
  memberCount: number;
  isHost: boolean;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  interests?: string[];
}
