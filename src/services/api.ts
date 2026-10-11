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

export interface FavoriteToggle {
  gameSlug: string;
  isFavorited: boolean;
  likesCount: number;
}

export interface FavoriteToggleResponse {
  data: FavoriteToggle;
}

// Carries the HTTP status and the backend's `{ error }` message
export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
    ) {
      return body.error;
    }
  } catch {
    // Non-JSON error body: fall back to the status text below
  }
  return `API request failed: ${response.status} ${response.statusText}`;
}

export async function apiCall<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }
  return response.json();
}

// Personalized when userEmail is given: data.isLikedByCurrentUser then
// reflects whether that user has favorited the game
export function getGameDetails(
  gameSlug: string,
  userEmail?: string
): Promise<GameDetailsResponse> {
  const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : '';
  return apiCall<GameDetailsResponse>(
    `/api/games/${encodeURIComponent(gameSlug)}${query}`
  );
}

// Toggles the favorite: every successful call flips the state, so never
// retry a call whose outcome is unknown
export function toggleGameFavorite(
  gameSlug: string,
  userEmail: string
): Promise<FavoriteToggleResponse> {
  return apiCall<FavoriteToggleResponse>(
    `/api/games/${encodeURIComponent(gameSlug)}/favorite`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail }),
    }
  );
}
