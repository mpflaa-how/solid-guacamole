import GoTrue from 'gotrue-js';
import { AuthError } from '@netlify/identity';

// ── GoTrue client ──
var IDENTITY_URL = window.location.origin + '/.netlify/identity';
var client = new GoTrue({ APIUrl: IDENTITY_URL, setCookie: true });

// ── GFII auth wrapper ──
// Thin global API consumed by inline scripts on login.html, portal.html, admin.html.

window.GFII = {
  AuthError: AuthError,

  /** Log in with email + password. Resolves with the gotrue user. */
  login: function (email, password) {
    return client.login(email, password, true).catch(function (err) {
      throw new AuthError(err.message || 'Login failed', err.status);
    });
  },

  /** Request a password-recovery email. */
  recover: function (email) {
    return client.requestPasswordRecovery(email).catch(function (err) {
      throw new AuthError(err.message || 'Recovery failed', err.status);
    });
  },

  /** Set a new password (user must be authenticated via recovery token). */
  resetPassword: function (newPassword) {
    var user = client.currentUser();
    if (!user) {
      return Promise.reject(new AuthError('No authenticated user', 401));
    }
    return user.update({ password: newPassword }).catch(function (err) {
      throw new AuthError(err.message || 'Password update failed', err.status);
    });
  },

  /** Log the current user out. */
  logout: function () {
    var user = client.currentUser();
    if (!user) return Promise.resolve();
    return user.logout();
  },

  /** Return the current gotrue user (or null). */
  getUser: function () {
    return client.currentUser();
  },
};

// ── Handle URL hash callbacks (recovery, confirmation, invite) ──

function fireReady() {
  var user = client.currentUser();
  window.dispatchEvent(new CustomEvent('gfii:ready', { detail: { user: user } }));
}

// ── Handle URL hash callbacks (recovery, confirmation, invite) ──
// Returns true if an async callback is being processed (ready event will fire later).

function processHash() {
  var hash = (window.location.hash || '').replace(/^#/, '');
  if (!hash) return false;

  var params = {};
  hash.split('&').forEach(function (pair) {
    var parts = pair.split('=');
    params[parts[0]] = decodeURIComponent(parts[1] || '');
  });

  // Recovery link: #recovery_token=<token>
  if (params.recovery_token) {
    client.recover(params.recovery_token, true)
      .then(function () {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        window.dispatchEvent(new CustomEvent('gfii:recovery'));
      })
      .catch(function (err) {
        console.error('[GFII] recovery error:', err);
        fireReady();
      });
    return true;
  }

  // Confirmation link: #confirmation_token=<token>
  if (params.confirmation_token) {
    client.confirm(params.confirmation_token, true)
      .then(function () {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        fireReady();
      })
      .catch(function (err) {
        console.error('[GFII] confirmation error:', err);
        fireReady();
      });
    return true;
  }

  // Invite link: #invite_token=<token>
  if (params.invite_token) {
    window.dispatchEvent(new CustomEvent('gfii:invite', { detail: { token: params.invite_token } }));
    return true;
  }

  return false;
}

// ── Bootstrap ──
if (!processHash()) {
  fireReady();
}
window.GFII.getProfile = async function () {
    const res = await fetch('/.netlify/functions/me');

    if (!res.ok) {
        throw new Error('Profile fetch failed');
    }

    return await res.json();
};