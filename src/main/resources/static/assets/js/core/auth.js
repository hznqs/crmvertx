const AUTH_TOKEN_KEY = 'vx_auth_token';
const AUTH_REFRESH_TOKEN_KEY = 'vx_refresh_token';
const AUTH_USER_KEY = 'vx_auth_user';

window.VXAuth = {
    token() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    refreshToken() {
        return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    },

    user() {
        const value = localStorage.getItem(AUTH_USER_KEY);
        return value ? JSON.parse(value) : null;
    },

    isAuthenticated() {
        return Boolean(this.token());
    },

    hasRole(...roles) {
        const role = this.user()?.role;
        return roles.includes(role);
    },

    save(session) {
        localStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
        if (session.refreshToken) {
            localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, session.refreshToken);
        }
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    },

    updateUser(user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    },

    clear() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
    },

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.replace('/login.html');
        }
    },

    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.replace('/app.html');
        }
    }
};
