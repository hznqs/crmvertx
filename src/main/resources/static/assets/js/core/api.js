const API_BASE_URL = window.VX_API_BASE_URL || '/api';

async function refreshSession() {
    const refreshToken = window.VXAuth?.refreshToken?.();
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) return false;
    const session = await response.json();
    window.VXAuth?.save?.(session);
    return true;
}

async function request(path, options = {}) {
    const token = window.VXAuth?.token?.();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...authHeader,
            ...options.headers
        },
        ...options
    });

    if (response.status === 401 && !options.__retried && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh')) {
        const refreshed = await refreshSession().catch(() => false);
        if (refreshed) {
            return request(path, { ...options, __retried: true });
        }
    }

    if (response.status === 401 && window.VXAuth?.clear) {
        window.VXAuth.clear();
        if (!window.location.pathname.endsWith('/login.html')) {
            window.location.replace('/login.html');
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro inesperado na API' }));
        const apiError = new Error(error.message || 'Erro inesperado na API');
        apiError.status = response.status;
        apiError.fields = error.fields || {};
        apiError.retryAfterSeconds = Number(apiError.fields.retryAfterSeconds || response.headers.get('Retry-After') || 0);
        throw apiError;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function requestBlob(path, options = {}) {
    const token = window.VXAuth?.token?.();
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    });

    if (response.status === 401 && !options.__retried) {
        const refreshed = await refreshSession().catch(() => false);
        if (refreshed) return requestBlob(path, { ...options, __retried: true });
    }

    if (!response.ok) {
        throw new Error('Nao foi possivel baixar o arquivo.');
    }

    return {
        blob: await response.blob(),
        filename: filenameFromDisposition(response.headers.get('Content-Disposition'))
    };
}

function filenameFromDisposition(value) {
    if (!value) return 'documento';
    const utf8 = value.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8?.[1]) return decodeURIComponent(utf8[1]);
    const ascii = value.match(/filename="?([^"]+)"?/i);
    return ascii?.[1] || 'documento';
}

function queryString(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') searchParams.set(key, value);
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

function crud(path) {
    const unwrapList = (data) => Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);

    return {
        list: (params) => request(`${path}${queryString(params)}`).then(unwrapList),
        page: (params) => request(`${path}${queryString(params)}`),
        find: (id) => request(`${path}/${encodeURIComponent(id)}`),
        create: (payload) => request(path, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),
        update: (id, payload) => request(`${path}/${encodeURIComponent(id)}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
        remove: (id) => request(`${path}/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        })
    };
}

window.VXApi = {
    health: () => request('/health'),
    dashboard: {
        metrics: (params = {}) => request(`/dashboard/metrics${queryString(params)}`),
        revenueChart: (params = {}) => request(`/dashboard/revenue-chart${queryString(params)}`),
        meetingsChart: (params = {}) => request(`/dashboard/meetings-chart${queryString(params)}`)
    },
    billing: {
        summary: () => request('/billing/summary')
    },
    auth: {
        login: (credentials) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        refresh: (refreshToken) => request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        }),
        logout: (payload) => request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify(payload || {})
        }),
        me: () => request('/auth/me'),
        updateProfile: (payload) => request('/auth/me', {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),
        changePassword: (payload) => request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    },
    settings: {
        get: () => request('/settings'),
        save: (payload) => request('/settings', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },
    organization: {
        get: () => request('/organization'),
        save: (payload) => request('/organization', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },
    uploads: {
        list: (params) => crud('/uploads').list(params),
        page: (params) => crud('/uploads').page(params),
        create: (file, metadata = {}) => {
            const form = new FormData();
            form.append('file', file);
            Object.entries(metadata).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') form.append(key, value);
            });
            return request('/uploads', {
                method: 'POST',
                body: form
            });
        },
        remove: (id) => request(`/uploads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
        download: (id) => requestBlob(`/uploads/${encodeURIComponent(id)}/download`)
    },
    clients: {
        ...crud('/clients'),
        updatePhase: (id, phase) => request(`/clients/${encodeURIComponent(id)}/phase`, {
            method: 'PATCH',
            body: JSON.stringify({ phase })
        }),
        dashboard: (id) => request(`/clients/${encodeURIComponent(id)}/dashboard`),
        saveDashboard: (id, payload) => request(`/clients/${encodeURIComponent(id)}/dashboard`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
    },
    contracts: {
        ...crud('/contracts'),
        summary: () => request('/contracts/summary')
    },
    deliveries: {
        ...crud('/deliveries'),
        summary: (params = {}) => request(`/deliveries/summary${queryString(params)}`),
        updateStatus: (id, status) => request(`/deliveries/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
    },
    events: crud('/events'),
    financeEntries: {
        ...crud('/finance-entries'),
        summary: (params = {}) => request(`/finance-entries/summary${queryString(params)}`)
    },
    commissionSales: {
        ...crud('/commission-sales'),
        metrics: (params = {}) => request(`/commission-sales/metrics${queryString(params)}`),
        ranking: () => request('/commission-sales/ranking')
    },
    performanceRecords: crud('/performance-records'),
    goals: crud('/goals'),
    teamMembers: {
        ...crud('/team-members'),
        summary: (params = {}) => request(`/team-members/summary${queryString(params)}`)
    },
    audit: crud('/audit')
};
