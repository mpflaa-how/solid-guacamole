# @netlify/identity

A lightweight, no-config headless authentication library for projects using Netlify Identity for browser and server. Uses [gotrue-js](https://github.com/netlify/gotrue-js) under the hood.

> **Status:** Beta. The API may change before 1.0.

For a pre-built login widget, see [netlify-identity-widget](https://github.com/netlify/netlify-identity-widget).

**Prerequisites:**

- [Netlify Identity](https://docs.netlify.com/security/secure-access-to-sites/identity/) must be enabled on your Netlify project
- For local development, use [`netlify dev`](https://docs.netlify.com/cli/local-development/) so the Identity endpoint is available

## Installation

```bash
npm install @netlify/identity
```

## Quick start

### Browser

```ts
import { getUser } from '@netlify/identity'

const user = getUser()
if (user) {
  console.log(`Hello, ${user.name}`)
}
```

### Netlify Function

```ts
import { getUser } from '@netlify/identity'
import type { Context } from '@netlify/functions'

export default async (req: Request, context: Context) => {
  const user = getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  return Response.json({ id: user.id, email: user.email })
}
```

### Edge Function

```ts
import { getUser } from '@netlify/identity'
import type { Context } from '@netlify/edge-functions'

export default async (req: Request, context: Context) => {
  const user = getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  return Response.json({ id: user.id, email: user.email })
}
```

## API

### Functions

#### `getUser`

```ts
getUser(): User | null
```

Returns the current authenticated user, or `null` if not logged in. Synchronous, never throws.

#### `isAuthenticated`

```ts
isAuthenticated(): boolean
```

Returns `true` if a user is currently authenticated. Equivalent to `getUser() !== null`.

#### `getIdentityConfig`

```ts
getIdentityConfig(): IdentityConfig | null
```

Returns the Identity endpoint URL (and operator token on the server), or `null` if Identity is not available. Never throws.

#### `getSettings`

```ts
getSettings(): Promise<Settings>
```

Fetches your project's Identity settings (enabled providers, autoconfirm, signup disabled). Throws `MissingIdentityError` if not configured; throws `AuthError` if the endpoint is unreachable.

### Types

#### `User`

```ts
interface User {
  id: string
  email?: string
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
  provider?: AuthProvider
  name?: string
  pictureUrl?: string
  metadata?: Record<string, unknown>
  rawGoTrueData?: Record<string, unknown>
}
```

#### `Settings`

```ts
interface Settings {
  autoconfirm: boolean
  disableSignup: boolean
  providers: Record<AuthProvider, boolean>
}
```

#### `IdentityConfig`

```ts
interface IdentityConfig {
  url: string
  token?: string
}
```

#### `AuthProvider`

```ts
type AuthProvider = 'google' | 'github' | 'gitlab' | 'bitbucket' | 'facebook' | 'saml' | 'email'
```

#### `AppMetadata`

```ts
interface AppMetadata {
  provider: AuthProvider
  roles?: string[]
  [key: string]: unknown
}
```

### Errors

#### `AuthError`

```ts
class AuthError extends Error {
  status?: number
  cause?: unknown
}
```

#### `MissingIdentityError`

```ts
class MissingIdentityError extends Error {}
```

Thrown when Identity is not configured in the current environment.

## License

MIT
