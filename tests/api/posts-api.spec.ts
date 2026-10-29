import { test, expect } from '@playwright/test';

/**
 * API contract tests against JSONPlaceholder (https://jsonplaceholder.typicode.com),
 * a stable fake REST API for prototyping and testing.
 *
 * Demonstrates API-layer practices that mirror the UI suite's principles:
 * - status-code and schema contracts per endpoint
 * - negative paths (missing resources, invalid payloads)
 * - resource relationships (nested routes return consistent data)
 * - the full CRUD lifecycle against one resource
 */

const BASE = 'https://jsonplaceholder.typicode.com';

test.describe('Posts API — read contracts', () => {
  test('GET /posts returns the full collection with a valid schema', async ({ request }) => {
    const response = await request.get(`${BASE}/posts`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    expect(posts).toHaveLength(100);
    for (const post of posts) {
      expect(post).toEqual(
        expect.objectContaining({
          userId: expect.any(Number),
          id: expect.any(Number),
          title: expect.any(String),
          body: expect.any(String),
        })
      );
    }
    // ids are unique and 1..100
    const ids = posts.map((p: { id: number }) => p.id);
    expect(new Set(ids).size).toBe(100);
  });

  test('GET /posts/1 returns a single post', async ({ request }) => {
    const response = await request.get(`${BASE}/posts/1`);
    expect(response.status()).toBe(200);

    const post = await response.json();
    expect(post).toMatchObject({
      userId: 1,
      id: 1,
      title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    });
  });

  test('GET /posts/101 returns 404 with an empty body', async ({ request }) => {
    const response = await request.get(`${BASE}/posts/101`);
    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({});
  });

  test('GET /users/1/posts returns only posts belonging to user 1', async ({ request }) => {
    const response = await request.get(`${BASE}/users/1/posts`);
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) {
      expect(post.userId).toBe(1);
    }
  });

  test('GET /posts responds within 5 seconds', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${BASE}/posts`);
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    // 5s: generous enough that DNS/TLS jitter on CI runners cannot flake,
    // tight enough to catch a hung or degraded dependency.
    expect(elapsed).toBeLessThan(5000);
  });
});

test.describe('Posts API — CRUD lifecycle', () => {
  test('POST /posts creates a resource with a server-assigned id', async ({ request }) => {
    const newPost = { userId: 1, title: 'Portfolio smoke post', body: 'Created by an automated API test.' };
    const response = await request.post(`${BASE}/posts`, { data: newPost });
    expect(response.status()).toBe(201);

    const created = await response.json();
    expect(created).toMatchObject({ ...newPost, id: 101 });
  });

  test('POST /posts with an empty payload still creates, returning only the assigned id', async ({ request }) => {
    // Documents actual server behavior: JSONPlaceholder does not validate the body —
    // an empty object is accepted and echoed back with just the server-assigned id.
    const response = await request.post(`${BASE}/posts`, { data: {} });
    expect(response.status()).toBe(201);
    expect(await response.json()).toEqual({ id: 101 });
  });

  test('PUT /posts/1 updates the resource and returns the merged object', async ({ request }) => {
    const response = await request.put(`${BASE}/posts/1`, {
      data: { userId: 1, id: 1, title: 'Updated by portfolio suite', body: 'Replacement body.', },
    });
    expect(response.status()).toBe(200);

    const updated = await response.json();
    expect(updated.title).toBe('Updated by portfolio suite');
    expect(updated.id).toBe(1);
  });

  test('DELETE /posts/1 returns 200 with an empty body', async ({ request }) => {
    const response = await request.delete(`${BASE}/posts/1`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({});
  });
});
