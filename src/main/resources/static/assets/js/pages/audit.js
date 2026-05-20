(function () {
    let logs = [];
    let pageInfo = { number: 0, size: 25, totalPages: 1, totalElements: 0 };

    function escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeText(value, fallback = '') {
        const normalized = String(value ?? fallback).trim();
        return escapeHTML(normalized || fallback);
    }

    function debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => fn(...args), delay);
        };
    }

    function notify(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    }

    function formatDateTime(value) {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function query() {
        const from = document.getElementById('audit-from-filter')?.value;
        const to = document.getElementById('audit-to-filter')?.value;
        return {
            action: document.getElementById('audit-action-filter')?.value || '',
            entity: document.getElementById('audit-entity-filter')?.value || '',
            from: from ? `${from}T00:00:00Z` : '',
            to: to ? `${to}T23:59:59Z` : ''
        };
    }

    function renderSkeleton() {
        const container = document.getElementById('audit-list');
        if (!container) return;
        container.innerHTML = Array.from({ length: 5 }, () => `
            <div class="app-skeleton-panel">
                <span class="app-skeleton-line w-32"></span>
                <span class="app-skeleton-line w-2/3"></span>
            </div>
        `).join('');
    }

    function renderPagination() {
        const container = document.getElementById('audit-pagination');
        if (!container) return;

        const current = Number(pageInfo.number || 0);
        const totalPages = Math.max(Number(pageInfo.totalPages || 1), 1);
        const totalElements = Number(pageInfo.totalElements || 0);
        container.innerHTML = `
            <span>${totalElements} atividade${totalElements === 1 ? '' : 's'} · pagina ${current + 1} de ${totalPages}</span>
            <div class="pagination-bar__actions">
                <button type="button" data-audit-page="${current - 1}" ${current <= 0 ? 'disabled' : ''}>Anterior</button>
                <button type="button" data-audit-page="${current + 1}" ${current >= totalPages - 1 ? 'disabled' : ''}>Proxima</button>
            </div>
        `;
    }

    function render() {
        const container = document.getElementById('audit-list');
        if (!container) return;

        if (!window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>Acesso restrito</h4>
                    <p>Somente ADMIN e GESTOR podem consultar atividades de auditoria.</p>
                </div>
            `;
            renderPagination();
            return;
        }

        if (!logs.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>Nenhuma atividade registrada</h4>
                    <p>Eventos de login, criacao, edicao, exclusao e mudanca de status aparecerao aqui.</p>
                </div>
            `;
            renderPagination();
            return;
        }

        container.innerHTML = logs.map((log) => `
            <article class="audit-item">
                <div class="audit-item__marker"></div>
                <div class="audit-item__body">
                    <div class="audit-item__header">
                        <span class="audit-badge">${safeText(log.action, 'ACAO')}</span>
                        <time>${formatDateTime(log.createdAt)}</time>
                    </div>
                    <h4>${safeText(log.entity, 'Entidade')}</h4>
                    <p>Usuario ${safeText(log.userId, '-')} · IP ${safeText(log.ipAddress, '-')}</p>
                    ${log.fieldName ? `<p>Campo ${safeText(log.fieldName)}: ${safeText(log.oldValue, '-')} -> ${safeText(log.newValue, '-')}</p>` : ''}
                </div>
            </article>
        `).join('');
        renderPagination();
    }

    async function refresh(pageNumber = 0) {
        if (!window.VXApi?.audit?.page || !window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) {
            render();
            return;
        }

        renderSkeleton();
        try {
            const page = await window.VXApi.audit.page({
                ...query(),
                page: Math.max(Number(pageNumber || 0), 0),
                size: pageInfo.size
            });
            logs = Array.isArray(page?.content) ? page.content : [];
            pageInfo = {
                number: page?.number || 0,
                size: page?.size || pageInfo.size,
                totalPages: page?.totalPages || 1,
                totalElements: page?.totalElements || logs.length
            };
            render();
        } catch (error) {
            notify(error.message || 'Nao foi possivel carregar auditoria', 'error');
            logs = [];
            render();
        }
    }

    function install() {
        ['audit-action-filter', 'audit-entity-filter', 'audit-from-filter', 'audit-to-filter'].forEach((id) => {
            document.getElementById(id)?.addEventListener('input', debounce(() => refresh(0), 350));
            document.getElementById(id)?.addEventListener('change', () => refresh(0));
        });

        document.getElementById('audit-pagination')?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-audit-page]');
            if (!button || button.disabled) return;
            refresh(Number(button.dataset.auditPage || 0));
        });
    }

    window.VXAuditPage = {
        install,
        refresh,
        render
    };

    document.addEventListener('DOMContentLoaded', install);
})();
