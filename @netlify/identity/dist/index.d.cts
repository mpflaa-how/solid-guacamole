declare const AUTH_PROVIDERS: readonly ["google", "github", "gitlab", "bitbucket", "facebook", "saml", "email"];
type AuthProvider = (typeof AUTH_PROVIDERS)[number];
interface AppMetadata {
    provider: AuthProvider;
    roles?: string[];
    [key: string]: unknown;
}
interface IdentityConfig {
    url: string;
    token?: string;
}
interface Settings {
    autoconfirm: boolean;
    disableSignup: boolean;
    providers: Record<AuthProvider, boolean>;
}

interface User {
    id: string;
    email?: string;
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    provider?: AuthProvider;
    name?: string;
    pictureUrl?: string;
    metadata?: Record<string, unknown>;
    rawGoTrueData?: Record<string, unknown>;
}
/**
 * Returns the currently authenticated user, or `null` if not logged in.
 * Synchronous. Never throws.
 */
declare const getUser: () => User | null;
/**
 * Returns `true` if a user is currently authenticated.
 */
declare const isAuthenticated: () => boolean;

/**
 * Returns the identity configuration for the current environment.
 * Browser: always returns `{ url }` derived from `window.location.origin`.
 * Server: returns `{ url, token }` from the identity context, or `null` if unavailable.
 * Never throws.
 */
declare const getIdentityConfig: () => IdentityConfig | null;
/**
 * Fetches the GoTrue `/settings` endpoint.
 * Throws `MissingIdentityError` if Identity is not configured.
 * Throws `AuthError` if the endpoint is unreachable.
 */
declare const getSettings: () => Promise<Settings>;

declare class AuthError extends Error {
    name: string;
    status?: number;
    cause?: unknown;
    constructor(message: string, status?: number, options?: {
        cause?: unknown;
    });
}
declare class MissingIdentityError extends Error {
    name: string;
    constructor(message?: string);
}

export { type AppMetadata, AuthError, type AuthProvider, type IdentityConfig, MissingIdentityError, type Settings, type User, getIdentityConfig, getSettings, getUser, isAuthenticated };
