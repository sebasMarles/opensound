export interface Song {
  jamendoId: string
  name: string
  artist_name: string
  image?: string
  album_image?: string
  audio?: string
  addedAt?: string
}

export interface Playlist {
  _id: string
  userId: string
  name: string
  description: string
  isLiked: boolean
  songs: Song[]
  createdAt: string
  updatedAt: string
}

export interface CreatePlaylistDto {
  name: string
  description?: string
}

export interface UpdatePlaylistDto {
  name?: string
  description?: string
}

export interface AddSongDto {
  jamendoId: string
  name: string
  artist_name: string
  image?: string
  album_image?: string
  audio?: string
}
