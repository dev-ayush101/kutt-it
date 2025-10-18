# Kutt-it API — Test Workflow Documentation

**Variables:** 
```bash
{{baseUrl}} = http://localhost:8080
{{token}} = User 1 JWT
{{token2}} = User 2 JWT
```

---

## Setup — Run First

| # | Name | Action | Captures |
|---|---|---|---|
| S1 | Register User 1 | POST /api/auth/register | `token` |
| S2 | Register User 2 | POST /api/auth/register | `token2` |
| S3 | Create URL (User 1) | POST /api/shorten + token | `shortCode` |
| S4 | Create Anonymous URL | POST /api/shorten (no auth) | `anonShortCode` |
| S5 | Create Expired URL | POST /api/shorten with past `expirationDate` | `expiredCode` |
| S6 | Create Tagged URL | POST /api/shorten with `tags: ["social","work"]` | `taggedCode` |
| S7 | Create URL for Delete Tests | POST /api/shorten + token | `deleteCode` |
| S8a | Create URL to Pre-Delete | POST /api/shorten + token | `preDeletedCode` |
| S8b | Delete the Pre-Delete URL | DELETE /api/links/{{preDeletedCode}} | — |
| S9 | Create URL for Update Tests | POST /api/shorten + token | `updateCode` |

---

## Auth

| # | Scenario | Preconditions | Request Body | Expected Status | Notes |
|---|---|---|---|---|---|
| A1 | Register — success | Email unused | `{username, email, password}` | 200 `{token, email, username}` | Use timestamp-unique email to re-run safely |
| A2 | Register — duplicate email | S1 done | Same email as User 1 | 500 | No global exception handler; falls through as 500 |
| A3 | Register — missing fields | — | `{email only}` | 400 | Bean Validation failure |
| A4 | Register — invalid email format | — | `{email: "notanemail"}` | 400 | Bean Validation failure |
| A5 | Login — success | S1 done | `{email, password}` | 200 `{token, email, username}` | Refreshes `token` variable |
| A6 | Login — wrong password | User exists | Correct email, wrong password | 500 | Same message as A7 to avoid user enumeration |
| A7 | Login — unknown email | — | Unknown email | 500 | Same message as A6 |
| A8 | Login — missing fields | — | `{}` | 400 | Bean Validation failure |

---

## Shorten URL

| # | Scenario | Auth | Request Body | Expected Status | Notes |
|---|---|---|---|---|---|
| SH1 | Shorten — anonymous | None | `{url}` | 200 `{shortCode, shortUrl}` | `userId` is null on the created record |
| SH2 | Shorten — authenticated | token | `{url}` | 200 `{shortCode, shortUrl}` | `userId` = User 1's email |
| SH3 | Custom alias — new | None | `{url, customAlias: "test-alias"}` | 200 `{shortCode: "test-alias"}` | Saves alias for SH4 |
| SH4 | Custom alias — already taken | None | Same `customAlias` as SH3 | 409 | `@ExceptionHandler(RuntimeException)` → 409 |
| SH5 | Custom alias — reuse expired | None | `{url, customAlias: "{{expiredCode}}"}` | 200 | Old expired record is hard-deleted, new one created |
| SH6 | Custom alias — too short | None | `{url, customAlias: "ab"}` | 400 | Fails `^[a-zA-Z0-9-]{3,30}$` pattern |
| SH7 | Custom alias — special characters | None | `{url, customAlias: "bad alias!"}` | 400 | Fails pattern validation |
| SH8 | With expiration date | token | `{url, expirationDate: "2030-01-01T00:00:00"}` | 200 | — |
| SH9 | With tags | token | `{url, tags: ["news","dev"]}` | 200 | — |
| SH10 | Invalid URL | None | `{url: "not-a-url"}` | 400 | `@URL` constraint fails |
| SH11 | Blank URL | None | `{url: ""}` | 400 | `@NotBlank` fails |

---

## Redirect

> Disable **Follow Redirects** per-request in Postman to assert the 302 directly.

| # | Scenario | Preconditions | Expected Status | Notes |
|---|---|---|---|---|
| R1 | Valid code | S3 done | 302 → originalUrl | Click logged async; increments analytics |
| R2 | Invalid code | — | 409 "URL Not Found" | `RuntimeException` handler returns 409 (ideally 404) |
| R3 | Expired URL | S5 done | 410 "URL has expired" | `ExpiredUrlException` → dedicated handler |
| R4 | Soft-deleted URL | S8b done | 409 "URL has been deleted" | `RuntimeException` handler |

---

## Manage Links

| # | Scenario | Auth | Preconditions | Expected Status | Notes |
|---|---|---|---|---|---|
| ML1 | Update — change original URL | token | S3 done | 200 updated Url object | Redis cache for `shortCode` is evicted |
| ML2 | Update — change alias | token | S9 done | 200 updated Url (shortCode changes) | Old shortCode evicted from Redis |
| ML3 | Update — alias already taken | token | SH3 done | 409 "Alias already in use" | — |
| ML4 | Update — change expiration | token | S3 done | 200 updated Url object | — |
| ML5 | Update — not owner | token2 | S3 done | 409 "You do not own this link" | User 2 tries User 1's URL |
| ML6 | Update — already deleted | token | S8b done | 409 "URL has been deleted" | — |
| ML7 | Update — unauthenticated | None | S3 done | 403 | Spring Security blocks before controller |
| ML8 | Delete — success | token | S7 done | 200 `{message: "Link deleted successfully"}` | Soft-deletes; evicts from Redis |
| ML9 | Delete — already deleted | token | ML8 done | 409 "URL has been deleted" | Depends on ML8 running first |
| ML10 | Delete — not owner | token2 | S3 done | 409 "You do not own this link" | — |
| ML11 | Delete — unauthenticated | None | S3 done | 403 | — |

---

## User Links

| # | Scenario | Auth | Expected Status | Notes |
|---|---|---|---|---|
| UL1 | Get user links | token | 200 array of non-deleted Url objects | Soft-deleted URLs are filtered out in service layer |
| UL2 | Get user links — unauthenticated | None | 403 | — |

---

## Tags

| # | Scenario | Auth | Expected Status | Notes |
|---|---|---|---|---|
| T1 | Get by tag — has results | token | 200 non-empty array | S6 created a URL with tag `"social"` |
| T2 | Get by tag — no results | token | 200 `[]` | No URL exists with this tag |
| T3 | Get by tag — unauthenticated | None | 403 | — |

---

## Analytics

| # | Scenario | Auth | Preconditions | Expected Status | Notes |
|---|---|---|---|---|---|
| AN1 | Owner — with clicks | token | R1 done | 200 `{ShortCode, totalClicks, clicksByDate}` | `totalClicks >= 1` |
| AN2 | Owner — zero clicks | token | S9 done, no redirects | 200 `{totalClicks: 0}` | — |
| AN3 | Non-owner | token2 | S3 done | 403 "Access denied" | User 2 tries User 1's shortCode |
| AN4 | Anonymous URL (NPE bug) | token | S4 done | 500 (unpatched) / 403 (patched) | `userId` is null; `.equals()` on null before the fix |
| AN5 | Unauthenticated | None | — | 403 | — |

---

## QR Code

| # | Scenario | Auth | Preconditions | Expected Status | Notes |
|---|---|---|---|---|---|
| QR1 | Valid — first request | token | S3 done | 200 `{url: ".../qr/{shortCode}.png"}` | Generates PNG, writes to `uploads/qr/` |
| QR2 | Valid — cached (file exists) | token | QR1 done | 200 same url | Skips generation, reads from disk |
| QR3 | Not found | token | — | 404 | `getUrlByShortCode` returns null |
| QR4 | Deleted URL | token | S8b done | 404 | `url.isDeleted()` check |
| QR5 | Unauthenticated | None | — | 403 | Security config: `/api/qr/**` requires auth |

---

## Bulk Shorten

| # | Scenario | Auth | Request Body | Expected Status | Notes |
|---|---|---|---|---|---|
| B1 | Bulk — all valid | token | `{urls: [3 valid ShortenRequests]}` | 200 array with `{shortCode, shortUrl}` per item | — |
| B2 | Bulk — mixed valid/invalid | token | One valid + one with taken alias | 200 partial | Valid items have `shortCode`; failures have `error` field |
| B3 | Bulk — exceeds 120 | token | `{urls: [121 items]}` | 400 | `@Size(max=120)` on the list |
| B4 | Bulk — empty list | token | `{urls: []}` | 400 | `@NotEmpty` |
| B5 | Bulk — unauthenticated | None | any body | 403 | Security config: `/api/shorten/bulk` is `authenticated()` |

---

## Rate Limiting

> In-memory only — resets on app restart. Applies exclusively to `POST /api/shorten` (exact URI). Run after a fresh restart to avoid stale bucket state.

| # | Scenario | How to Test | Expected |
|---|---|---|---|
| RL1 | Anonymous — limit hit | Send `POST /api/shorten` (no auth) 11× from same IP | 11th → 429 "Rate limit exceeded. Try again later." |
| RL2 | Authenticated — limit hit | Send `POST /api/shorten` (with token) 121× | 121st → 429 |
| RL3 | Bulk not rate-limited | Send `POST /api/shorten/bulk` repeatedly | Never 429 — URI check in `RateLimitFilter` excludes this path |
