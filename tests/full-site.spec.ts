import { test, expect, type APIRequestContext } from '@playwright/test';

const BASE = 'http://localhost:3849';
const TEST_EMAIL = `test-pw-${Date.now()}@example.com`;
const TEST_PASS = 'TestPass123!';
let testUserId: string | null = null;

// ============ PUBLIC PAGES ============

test.describe('Public Pages - Load', () => {
  const pages = [
    ['/', '首頁'],
    ['/taiwan', '台灣賽事'],
    ['/international', '國際賽事'],
    ['/calendar', '行事曆'],
    ['/open', '報名中賽事'],
    ['/about', '關於'],
    ['/login', '登入'],
    ['/register', '註冊'],
    ['/privacy', '隱私政策'],
    ['/terms', '服務條款'],
    ['/disclaimer', '免責聲明'],
  ];

  for (const [path, name] of pages) {
    test(`${name} (${path}) loads with 200`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    });
  }
});

test.describe('Homepage', () => {
  test('has hero section with CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Runner Will Guide');
    // CTA buttons
    const taiwanCTA = page.locator('a[href="/taiwan"]').first();
    await expect(taiwanCTA).toBeVisible();
    const intlCTA = page.locator('a[href="/international"]').first();
    await expect(intlCTA).toBeVisible();
  });

  test('has stats section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=總賽事數')).toBeVisible();
  });

  test('has upcoming events section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=近期賽事')).toBeVisible();
  });
});

test.describe('Header Navigation', () => {
  test('header links exist and work', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('header nav');
    const links = [
      ['首頁', '/'],
      ['台灣賽事', '/taiwan'],
      ['國際賽事', '/international'],
      ['可報名', '/open'],
      ['行事曆', '/calendar'],
      ['關於', '/about'],
    ];
    for (const [text, href] of links) {
      await expect(nav.locator(`a[href="${href}"]`)).toBeVisible();
    }
  });
});

test.describe('Footer Navigation', () => {
  test('footer links exist', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();
    await expect(footer.locator('a[href="/disclaimer"]')).toBeVisible();
    await expect(footer.locator('a[href="/taiwan"]')).toBeVisible();
    await expect(footer.locator('a[href="/international"]')).toBeVisible();
    await expect(footer.locator('a[href="/calendar"]')).toBeVisible();
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
  });
});

test.describe('Taiwan Events Page', () => {
  test('shows event list', async ({ page }) => {
    await page.goto('/taiwan');
    // Should have event cards
    const cards = page.locator('a[href^="/event/"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('International Events Page', () => {
  test('shows event list', async ({ page }) => {
    await page.goto('/international');
    const cards = page.locator('a[href^="/event/"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });
});

test.describe('Open Events Page', () => {
  test('shows registrable events', async ({ page }) => {
    await page.goto('/open');
    await expect(page.locator('body')).not.toBeEmpty();
  });
});

test.describe('Calendar Page', () => {
  test('renders calendar', async ({ page }) => {
    await page.goto('/calendar');
    // Calendar should have month/year display
    await expect(page.locator('body')).toContainText(/2026|2025/);
  });
});

test.describe('Event Detail Page', () => {
  test('loads a valid event', async ({ request }) => {
    // Get first event ID from API
    const eventsResp = await request.get(`${BASE}/api/events`);
    const events = await eventsResp.json();
    expect(events.length).toBeGreaterThan(0);
    const eventId = events[0].id;

    const resp = await request.get(`${BASE}/event/${eventId}`);
    expect(resp.status()).toBe(200);
  });
});

// ============ API ROUTES ============

test.describe('API - Events', () => {
  test('GET /api/events returns array', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/events`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Check structure
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('date');
  });

  test('GET /api/events/[id] returns single event', async ({ request }) => {
    const eventsResp = await request.get(`${BASE}/api/events`);
    const events = await eventsResp.json();
    const id = events[0].id;

    const resp = await request.get(`${BASE}/api/events/${id}`);
    expect(resp.status()).toBe(200);
    const event = await resp.json();
    expect(event).toHaveProperty('id', id);
  });

  test('GET /api/events/search?q= returns results', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/events/search?q=馬拉松`);
    expect(resp.status()).toBe(200);
    const data = await resp.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /api/events/[invalid] returns 404', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/events/nonexistent-id`);
    expect(resp.status()).toBe(404);
  });
});

test.describe('API - Auth', () => {
  test('POST /api/auth/register creates account', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/register`, {
      data: { name: 'Test PW User', email: TEST_EMAIL, password: TEST_PASS },
    });
    expect(resp.status()).toBe(201);
    const data = await resp.json();
    expect(data).toHaveProperty('user');
    testUserId = data.user?.id || null;
  });

  test('POST /api/auth/register rejects duplicate', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/register`, {
      data: { name: 'Dup', email: TEST_EMAIL, password: TEST_PASS },
    });
    expect(resp.status()).toBe(400);
  });

  test('POST /api/auth/register validates input', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/auth/register`, {
      data: { name: '', email: 'bad', password: '1' },
    });
    expect([400, 422]).toContain(resp.status());
  });
});

test.describe('API - Dashboard (unauthenticated)', () => {
  test('GET /api/dashboard/stats requires auth', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/dashboard/stats`);
    expect([401, 403]).toContain(resp.status());
  });

  test('GET /api/race-logs requires auth', async ({ request }) => {
    const resp = await request.get(`${BASE}/api/race-logs`);
    expect([401, 403]).toContain(resp.status());
  });

  test('PUT /api/user/profile requires auth', async ({ request }) => {
    const resp = await request.put(`${BASE}/api/user/profile`, {
      data: { name: 'Hacker' },
    });
    expect([401, 403]).toContain(resp.status());
  });
});

test.describe('Dashboard pages redirect when not logged in', () => {
  const dashPages = [
    '/dashboard',
    '/dashboard/records',
    '/dashboard/records/new',
    '/dashboard/profile',
  ];

  for (const path of dashPages) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      // Should redirect to /login or show login
      await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
      expect(page.url()).toContain('/login');
    });
  }
});

// ============ FORM VALIDATION ============

test.describe('Register Page Validation', () => {
  test('shows register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('form')).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });
});

// ============ INTERNAL LINKS ============

test.describe('No broken internal links on homepage', () => {
  test('all internal links resolve', async ({ page, request }) => {
    await page.goto('/');
    const hrefs = await page.locator('a[href^="/"]').evaluateAll(els =>
      [...new Set(els.map(e => e.getAttribute('href')).filter(Boolean))]
    );
    const filtered = (hrefs as string[]).filter(h => !h.includes('[') && !h.startsWith('/api'));
    for (const href of filtered) {
      const resp = await request.get(`${BASE}${href}`);
      expect(resp.status(), `${href} should not 404`).not.toBe(404);
    }
  });
});

// ============ CERT UPLOAD API ============

test.describe('API - Cert Upload (unauthenticated)', () => {
  test('POST /api/race-logs/cert-upload requires auth', async ({ request }) => {
    const resp = await request.post(`${BASE}/api/race-logs/cert-upload`, {
      multipart: {
        file: { name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') },
      },
    });
    expect([401, 403]).toContain(resp.status());
  });
});
