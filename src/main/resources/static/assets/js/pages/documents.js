(function () {
    let documents = [];
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

    function safeId(value) {
        return encodeURIComponent(String(value ?? ''));
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

    function formatBytes(bytes) {
        const value = Number(bytes || 0);
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
        return `${(value / 1024 / 1024).toFixed(1)} MB`;
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

    function renderSkeleton() {
        const container = document.getElementById('documents-list');
        if (!container) return;
        container.innerHTML = Array.from({ length: 4 }, () => `
            <div class="app-skeleton-panel">
                <span class="app-skeleton-line w-1/2"></span>
                <span class="app-skeleton-line w-3/4"></span>
            </div>
        `).join('');
    }

    function renderPagination() {
        const container = document.getElementById('documents-pagination');
        if (!container) return;

        const current = Number(pageInfo.number || 0);
        const totalPages = Math.max(Number(pageInfo.totalPages || 1), 1);
        const totalElements = Number(pageInfo.totalElements || 0);
        container.innerHTML = `
            <span>${totalElements} documento${totalElements === 1 ? '' : 's'} · pagina ${current + 1} de ${totalPages}</span>
            <div class="pagination-bar__actions">
                <button type="button" data-documents-page="${current - 1}" ${current <= 0 ? 'disabled' : ''}>Anterior</button>
                <button type="button" data-documents-page="${current + 1}" ${current >= totalPages - 1 ? 'disabled' : ''}>Proxima</button>
            </div>
        `;
    }

    function render() {
        const container = document.getElementById('documents-list');
        if (!container) return;

        if (!documents.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>Nenhum documento enviado</h4>
                    <p>Envie contratos PDF, imagens ou documentos para manter a operacao centralizada no backend.</p>
                </div>
            `;
            renderPagination();
            return;
        }

        const canDelete = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR', 'OPERACIONAL');
        container.innerHTML = documents.map((documentItem) => `
            <article class="resource-row">
                <div class="resource-row__main">
                    <div class="resource-row__icon">DOC</div>
                    <div class="min-w-0">
                        <h4>${safeText(documentItem.originalFilename, 'Documento')}</h4>
                        <p>${safeText(documentItem.contentType, 'arquivo')} · ${formatBytes(documentItem.sizeBytes)} · ${formatDateTime(documentItem.createdAt)}</p>
                    </div>
                </div>
                <div class="resource-row__actions">
                    <button type="button" class="resource-row__action" data-document-download="${safeId(documentItem.id)}">Baixar</button>
                    ${canDelete ? `<button type="button" class="resource-row__action danger" data-document-delete="${safeId(documentItem.id)}">Excluir</button>` : ''}
                </div>
            </article>
        `).join('');
        renderPagination();
    }

    async function refresh(pageNumber = 0) {
        if (!window.VXApi?.uploads?.page) return;
        renderSkeleton();
        const page = await window.VXApi.uploads.page({
            page: Math.max(Number(pageNumber || 0), 0),
            size: pageInfo.size,
            q: document.getElementById('documents-search')?.value || ''
        });
        documents = Array.isArray(page?.content) ? page.content : [];
        pageInfo = {
            number: page?.number || 0,
            size: page?.size || pageInfo.size,
            totalPages: page?.totalPages || 1,
            totalElements: page?.totalElements || documents.length
        };
        render();
    }

    async function uploadSelectedFile(event) {
        event.preventDefault();
        const form = document.getElementById('document-upload-form');
        const input = document.getElementById('document-file');
        const file = input?.files?.[0];
        if (!file) {
            notify('Selecione um arquivo para enviar', 'error');
            return;
        }

        try {
            await window.VXApi.uploads.create(file);
            form?.reset();
            const label = form?.querySelector('.document-upload-control span');
            if (label) label.textContent = 'Selecionar arquivo';
            await refresh(0);
            notify('Documento enviado com seguranca', 'success');
        } catch (error) {
            notify(error.message || 'Nao foi possivel enviar o documento', 'error');
        }
    }

    async function downloadDocument(id) {
        const result = await window.VXApi.uploads.download(id);
        const url = URL.createObjectURL(result.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.filename || 'documento';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function install() {
        const form = document.getElementById('document-upload-form');
        const input = document.getElementById('document-file');

        input?.addEventListener('change', () => {
            const label = form?.querySelector('.document-upload-control span');
            if (label) label.textContent = input.files?.[0]?.name || 'Selecionar arquivo';
        });
        form?.addEventListener('submit', uploadSelectedFile);
        document.getElementById('documents-search')?.addEventListener('input', debounce(() => refresh(0), 350));

        document.getElementById('documents-list')?.addEventListener('click', async (event) => {
            const downloadButton = event.target.closest('[data-document-download]');
            if (downloadButton) {
                try {
                    await downloadDocument(decodeURIComponent(downloadButton.dataset.documentDownload || ''));
                } catch (error) {
                    notify(error.message || 'Nao foi possivel baixar o documento', 'error');
                }
                return;
            }

            const deleteButton = event.target.closest('[data-document-delete]');
            if (!deleteButton) return;

            try {
                await window.VXApi.uploads.remove(decodeURIComponent(deleteButton.dataset.documentDelete || ''));
                await refresh(pageInfo.number);
                notify('Documento excluido com seguranca', 'success');
            } catch (error) {
                notify(error.message || 'Nao foi possivel excluir o documento', 'error');
            }
        });

        document.getElementById('documents-pagination')?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-documents-page]');
            if (!button || button.disabled) return;
            refresh(Number(button.dataset.documentsPage || 0));
        });
    }

    window.VXDocumentsPage = {
        install,
        refresh,
        render
    };

    document.addEventListener('DOMContentLoaded', install);
})();
