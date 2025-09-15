// Types for Mallow API responses

export interface MallowArtwork {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  animation_url?: string;
  creator_name?: string;
  creator_address?: string;
  token_address?: string;
  blockchain?: string;
  collection_name?: string;
  attributes?: MallowAttribute[];
  owner_address?: string;
  mime_type?: string;
  file_uri?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MallowAttribute {
  trait_type: string;
  value: string | number;
}

export interface MallowExploreResponse {
  artworks: MallowArtwork[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface MallowExploreRequest {
  filter: {
    search?: string;
    blockchain?: string;
    collection?: string;
  };
  page?: number;
  limit?: number;
}