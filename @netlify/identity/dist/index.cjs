"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthError: () => AuthError,
  MissingIdentityError: () => MissingIdentityError,
  getIdentityConfig: () => getIdentityConfig,
  getSettings: () => getSettings,
  getUser: () => getUser,
  isAuthenticated: () => isAuthenticated
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var AUTH_PROVIDERS = ["google", "github", "gitlab", "bitbucket", "facebook", "saml", "email"];

// src/environment.ts
var import_gotrue_js = __toESM(require("gotrue-js"), 1);
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
  goTrueClient = new import_gotrue_js.default({ APIUrl: apiUrl, setCookie: isBrowser() });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthError,
  MissingIdentityError,
  getIdentityConfig,
  getSettings,
  getUser,
  isAuthenticated
});
//# sourceMappingURL=index.cjs.map