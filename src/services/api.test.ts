import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiCall,
  getComments,
  getGameDetails,
  postComment,
  toggleCommentLike,
  toggleGameFavorite,
} from './api';

const BASE_URL = 'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com';

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function requestedUrl(): URL {
  return new URL(String(fetchMock.mock.calls[0][0]));
}

function requestedInit(): RequestInit | undefined {
  return fetchMock.mock.calls[0][1];
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(jsonResponse({ data: {} }));
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('apiCall', () => {
  it('prefixes the base URL, forwards options and returns the JSON body', async () => {
    const body = { data: [{ slug: 'snake' }] };
    fetchMock.mockResolvedValue(jsonResponse(body));
    const options: RequestInit = { method: 'GET' };

    await expect(apiCall('/api/games', options)).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(`${BASE_URL}/api/games`, options);
  });

  it('throws an ApiError with the backend error message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Game not found' }, { status: 404 })
    );

    const request = apiCall('/api/games/x');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Game not found',
    });
  });

  it('falls back to the status text for a non-JSON error body', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>Bad Gateway</html>', {
        status: 502,
        statusText: 'Bad Gateway',
      })
    );

    await expect(apiCall('/api/games')).rejects.toMatchObject({
      status: 502,
      message: 'API request failed: 502 Bad Gateway',
    });
  });

  it('falls back to the status text when the JSON body has no string error', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { error: { code: 1 } },
        { status: 500, statusText: 'Server Error' }
      )
    );

    await expect(apiCall('/api/games')).rejects.toMatchObject({
      status: 500,
      message: 'API request failed: 500 Server Error',
    });
  });

  it('propagates network failures', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiCall('/api/games')).rejects.toThrow('Failed to fetch');
  });
});

describe('getGameDetails', () => {
  it('requests the encoded slug without a query for guests', async () => {
    await getGameDetails('space invaders');

    expect(requestedUrl().pathname).toBe('/api/games/space%20invaders');
    expect(requestedUrl().search).toBe('');
  });

  it('personalizes the request with the encoded user email', async () => {
    await getGameDetails('snake', 'a+b@example.com');

    expect(requestedUrl().searchParams.get('userEmail')).toBe(
      'a+b@example.com'
    );
  });
});

describe('getComments', () => {
  it('requests the latest 3 comments for guests', async () => {
    await getComments('snake');

    const url = requestedUrl();
    expect(url.pathname).toBe('/api/games/snake/comments');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limit: '3',
      sort: 'newest',
    });
  });

  it('adds the user email for personalized like state', async () => {
    await getComments('snake', 'player@example.com');

    expect(requestedUrl().searchParams.get('userEmail')).toBe(
      'player@example.com'
    );
  });
});

describe('mutations', () => {
  it('posts a new comment as JSON', async () => {
    const comment = {
      userEmail: 'player@example.com',
      authorName: 'Player',
      text: 'Great game!',
    };
    const created = { data: { commentId: 'c1', ...comment } };
    fetchMock.mockResolvedValue(jsonResponse(created, { status: 201 }));

    await expect(postComment('snake', comment)).resolves.toEqual(created);
    expect(requestedUrl().pathname).toBe('/api/games/snake/comments');
    expect(requestedInit()).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
  });

  it('toggles a comment like for the user', async () => {
    const liked = { data: { isLikedByCurrentUser: true, likesCount: 4 } };
    fetchMock.mockResolvedValue(jsonResponse(liked));

    await expect(
      toggleCommentLike('c/1', 'player@example.com')
    ).resolves.toEqual(liked);
    expect(requestedUrl().pathname).toBe('/api/comments/c%2F1/like');
    expect(requestedInit()).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ userEmail: 'player@example.com' }),
    });
  });

  it('toggles a game favorite for the user', async () => {
    const favorited = {
      data: { gameSlug: 'snake', isFavorited: true, likesCount: 10 },
    };
    fetchMock.mockResolvedValue(jsonResponse(favorited));

    await expect(
      toggleGameFavorite('snake', 'player@example.com')
    ).resolves.toEqual(favorited);
    expect(requestedUrl().pathname).toBe('/api/games/snake/favorite');
    expect(requestedInit()).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ userEmail: 'player@example.com' }),
    });
  });

  it('rejects a failed mutation without retrying it', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: 'Comment text is required' }, { status: 400 })
    );

    await expect(
      postComment('snake', {
        userEmail: 'player@example.com',
        authorName: 'Player',
        text: '',
      })
    ).rejects.toMatchObject({
      status: 400,
      message: 'Comment text is required',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
