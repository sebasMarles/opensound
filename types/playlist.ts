import { Track } from "../services/jamendo";

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  coverImage?: string;
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
  userId?: string;
}

export interface UpdatePlaylistDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImage?: string;
}

export interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
}
