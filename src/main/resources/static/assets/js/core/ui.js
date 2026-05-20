const VX_PRIMARY_PAGES = [
    { id: 'dashboard', label: 'Início', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { id: 'clients', label: 'Clientes', icon: 'M16 11c1.66 0 3-1.34 3-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8 0c-.31 0-.66.02-1.02.05 1.16.84 2.02 1.97 2.02 3.45V19h7v-2c0-2.66-5.33-4-8-4z' },
    { id: 'kanban', label: 'Funil', icon: 'M4 5h5v14H4V5zm6 0h5v9h-5V5zm6 0h4v14h-4V5z' },
    { id: 'calendar', label: 'Agenda', icon: 'M7 2v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm12 8H5v10h14V10z' },
    { id: 'profile', label: 'Perfil', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' }
];

window.VXUI = {
    pages: VX_PRIMARY_PAGES,

    installMobileNavigation() {
        const container = document.getElementById('mobile-bottom-nav');
        if (!container || container.dataset.ready === '1') return;

        container.innerHTML = this.pages.map(page => `
            <button type="button" class="mobile-bottom-nav__item" data-page="${page.id}" aria-label="${page.label}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${page.icon}"></path></svg>
                <span>${page.label}</span>
            </button>
        `).join('');

        container.addEventListener('click', event => {
            const button = event.target.closest('[data-page]');
            if (!button) return;
            window.navigate?.(button.dataset.page);
        });

        container.dataset.ready = '1';
    },

    activateNavigation(page) {
        document.querySelectorAll('#mobile-bottom-nav [data-page]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.page === page);
        });
    },

    bindSubmitBusyState(root = document) {
        root.querySelectorAll('form').forEach(form => {
            if (form.dataset.busyBound === '1') return;
            form.addEventListener('submit', () => {
                const submit = form.querySelector('button[type="submit"]');
                if (!submit) return;
                submit.dataset.originalText = submit.dataset.originalText || submit.textContent.trim();
                submit.disabled = true;
                submit.classList.add('is-loading');
                submit.textContent = 'Salvando...';
                window.setTimeout(() => {
                    submit.disabled = false;
                    submit.classList.remove('is-loading');
                    submit.textContent = submit.dataset.originalText;
                }, 1200);
            });
            form.dataset.busyBound = '1';
        });
    },

    initials(name, fallback = 'VX') {
        const value = String(name || '').trim();
        if (!value) return fallback;
        return value.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
    }
};
