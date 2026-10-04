const BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

export interface Game {
  slug: string;
  name: string;
  category: string;
  price: string;
  shortDescription: string;
  rating: number;
  likesCount: number;
  cardImage: string;
}

export interface Category {
  slug: string;
  label: string;
  isDefault: boolean;
}

export interface ApiResponse {
  data: Game[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    appliedFilter: {
      featured: boolean;
    };
  };
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    totalItems: number;
    description: string;
  };
}

export interface GameSpecs {
  genre: string;
  players: string;
  duration: string;
  price: string;
}

export interface TopRecord {
  position: number;
  playerName: string;
  score: number;
  achievedAt: string;
}

export interface GameDetails {
  slug: string;
  name: string;
  heroImage: string;
  rating: number;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  fullDescription: string;
  specs: GameSpecs;
  topRecords: TopRecord[];
}

export interface GameDetailsResponse {
  data: GameDetails;
}

export interface Comment {
  commentId: string;
  authorName: string;
  text: string;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    totalComments: number;
    returnedCount: number;
    sort: string;
  };
}

export async function apiCall<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return response.json();
}
