export type Playlist = {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  coverImage?: string | null;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PlaylistPayload = {
  name: string;
  description: string;
  isPublic: boolean;
};

export type PlaylistTrackPayload = {
  trackId: string;
};
