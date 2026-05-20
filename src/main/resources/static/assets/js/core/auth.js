const AUTH_TOKEN_KEY = 'vx_auth_token';
const AUTH_REFRESH_TOKEN_KEY = 'vx_refresh_token';
let currentUser = null;

window.VXAuth = {
    token() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    refreshToken() {
        return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
    },

    user() {
        return currentUser;
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
        currentUser = session.user || null;
        localStorage.removeItem('vx_auth_user');
    },

    updateUser(user) {
        currentUser = user || null;
        localStorage.removeItem('vx_auth_user');
    },

    clear() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
        localStorage.removeItem('vx_auth_user');
        currentUser = null;
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
