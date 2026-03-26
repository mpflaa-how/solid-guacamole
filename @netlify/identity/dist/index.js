// src/types.ts
var AUTH_PROVIDERS = ["google", "github", "gitlab", "bitbucket", "facebook", "saml", "email"];

// src/environment.ts
import GoTrue from "gotrue-js";
var IDENTITY_PATH = "/.netlify/identity";
var goTrueClient = null;
var cachedApiUrl;
var warnedMissingUrl = false;
var isBrowser = () => typeof window !== "undefined" && typeof window.location !== "undefined";
var discoverApiUrl = () => {
  if (cachedApiUrl !== void 0) return cachedApiUrl;
  if (isBrowser()) {
    cachedApiUrl = `${window.location.origin}${IDENTITY_PATH}`;
  } else {
    const identityContext = getIdentityContext();
    if (identityContext?.url) {
      cachedApiUrl = identityContext.url;
    } else if (globalThis.Netlify?.context?.url) {
      cachedApiUrl = new URL(IDENTITY_PATH, globalThis.Netlify.context.url).href;
    }
  }
  return cachedApiUrl ?? null;
};
var getGoTrueClient = () => {
  if (goTrueClient) return goTrueClient;
  const apiUrl = discoverApiUrl();
  if (!apiUrl) {
    if (!warnedMissingUrl) {
      console.warn(
        "@netlify/identity: Could not determine the Identity endpoint URL. Make sure your site has Netlify Identity enabled, or run your app with `netlify dev`."
      );
      warnedMissingUrl = true;
    }
    return null;
  }
  goTrueClient = new GoTrue({ APIUrl: apiUrl, setCookie: isBrowser() });
  return goTrueClient;
};
var getIdentityContext = () => {
  const identityContext = globalThis.netlifyIdentityContext;
  if (identityContext?.url) {
    return {
      url: identityContext.url,
      token: identityContext.token
    };
  }
  if (globalThis.Netlify?.context?.url) {
    return { url: new URL(IDENTITY_PATH, globalThis.Netlify.context.url).href };
  }
  return null;
};

// src/user.ts
var toAuthProvider = (value) => typeof value === "string" && AUTH_PROVIDERS.includes(value) ? value : void 0;
var toUser = (userData) => {
  const userMeta = userData.user_metadata ?? {};
  const appMeta = userData.app_metadata ?? {};
  const name = userMeta.full_name || userMeta.name;
  const pictureUrl = userMeta.avatar_url;
  return {
    id: userData.id,
    email: userData.email,
    emailVerified: !!userData.confirmed_at,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    provider: toAuthProvider(appMeta.provider),
    name: typeof name === "string" ? name : void 0,
    pictureUrl: typeof pictureUrl === "string" ? pictureUrl : void 0,
    metadata: userMeta,
    rawGoTrueData: { ...userData }
  };
};
var claimsToUser = (claims) => {
  const appMeta = claims.app_metadata ?? {};
  const userMeta = claims.user_metadata ?? {};
  const name = userMeta.full_name || userMeta.name;
  return {
    id: claims.sub ?? "",
    email: claims.email,
    provider: toAuthProvider(appMeta.provider),
    name: typeof name === "string" ? name : void 0,
    metadata: userMeta
  };
};
var getUser = () => {
  if (isBrowser()) {
    const client = getGoTrueClient();
    const currentUser = client?.currentUser() ?? null;
    if (!currentUser) return null;
    return toUser(currentUser);
  }
  const identityContext = globalThis.netlifyIdentityContext;
  if (!identityContext?.user) return null;
  return claimsToUser(identityContext.user);
};
var isAuthenticated = () => getUser() !== null;

// src/errors.ts
var AuthError = class extends Error {
  constructor(message, status, options) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    if (options && "cause" in options) {
      this.cause = options.cause;
    }
  }
};
var MissingIdentityError = class extends Error {
  constructor(message = "Identity is not available in this environment") {
    super(message);
    this.name = "MissingIdentityError";
  }
};

// src/config.ts
var getIdentityConfig = () => {
  if (isBrowser()) {
    return { url: `${window.location.origin}${IDENTITY_PATH}` };
  }
  return getIdentityContext();
};
var getSettings = async () => {
  const client = getGoTrueClient();
  if (!client) throw new MissingIdentityError();
  try {
    const raw = await client.settings();
    const external = raw.external ?? {};
    return {
      autoconfirm: raw.autoconfirm,
      disableSignup: raw.disable_signup,
      providers: {
        google: external.google ?? false,
        github: external.github ?? false,
        gitlab: external.gitlab ?? false,
        bitbucket: external.bitbucket ?? false,
        facebook: external.facebook ?? false,
        email: external.email ?? false,
        saml: external.saml ?? false
      }
    };
  } catch (err) {
    throw new AuthError(err instanceof Error ? err.message : "Failed to fetch identity settings", 502, { cause: err });
  }
};
export {
  AuthError,
  MissingIdentityError,
  getIdentityConfig,
  getSettings,
  getUser,
  isAuthenticated
};
//# sourceMappingURL=index.js.map