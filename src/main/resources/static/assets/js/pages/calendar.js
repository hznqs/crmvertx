(function () {
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

    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
    }

    function formatDate(dateValue) {
        if (!dateValue) return '-';
        const date = new Date(`${dateValue}T12:00:00`);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('pt-BR');
    }

    function isMeetingDone(event) {
        return (event.status || 'agendada') === 'executada';
    }

    function isClosedSale(event) {
        return isMeetingDone(event) && (event.sale === true || event.sale === 'sim');
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function populateClientFilter(clients) {
        const select = document.getElementById('calendar-client-filter');
        if (!select) return;

        const currentValue = select.value || '';
        select.innerHTML = '<option value="">Todos os clientes</option>' +
            clients.map(client => `<option value="${safeText(client.id)}">${safeText(client.name)}</option>`).join('');
        if ([...select.options].some(option => option.value === currentValue)) {
            select.value = currentValue;
        }
    }

    function render(context) {
        const currentMonth = context.currentMonth instanceof Date ? context.currentMonth : new Date();
        const events = Array.isArray(context.events) ? context.events : [];
        const clients = Array.isArray(context.clients) ? context.clients : [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const title = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
        setText('calendar-main-title', formattedTitle);

        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
        const monthEvents = events.filter(event => event.date >= monthStart && event.date <= monthEnd);
        const totalMeetings = monthEvents.length;
        const totalExecuted = monthEvents.filter(isMeetingDone).length;
        const totalSales = monthEvents.filter(isClosedSale).length;
        const totalRevenue = monthEvents.filter(isClosedSale)
            .reduce((sum, event) => sum + (Number(event.revenue || 0) || 0), 0);

        setText('calendar-total-meetings', totalMeetings);
        setText('calendar-total-executed', totalExecuted);
        setText('calendar-total-sales', totalSales);
        setText('calendar-total-revenue', formatCurrency(totalRevenue));
        setText('legend-executed', totalExecuted);
        setText('legend-sales', totalSales);
        setText('legend-revenue', formatCurrency(totalRevenue));

        renderGrid({ events, year, month });
        renderUpcomingEvents({ events, clients });
    }

    function renderGrid({ events, year, month }) {
        const grid = document.getElementById('calendar-grid');
        if (!grid) return;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = new Date().toISOString().split('T')[0];
        let html = '';

        for (let i = 0; i < firstDay; i++) {
            html += '<div class="min-h-[150px] rounded-2xl border border-transparent"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateStr);
            const executed = dayEvents.filter(isMeetingDone).length;
            const sales = dayEvents.filter(isClosedSale).length;
            const revenue = dayEvents.filter(isClosedSale)
                .reduce((sum, event) => sum + (Number(event.revenue || 0) || 0), 0);
            const isToday = todayStr === dateStr;

            html += `
                <button type="button" onclick="selectDate('${dateStr}')" class="group text-left min-h-[150px] lg:min-h-[180px] rounded-2xl border ${isToday ? 'border-yellow-500/70 bg-yellow-500/5' : 'border-vx-border bg-vx-card'} p-3 cursor-pointer hover:border-vx-purple hover:bg-vx-card/90 transition-all relative overflow-hidden">
                    <span class="flex items-start justify-between">
                        <span class="${isToday ? 'bg-yellow-400 text-black px-2 py-1 rounded-md font-black' : 'text-vx-muted font-bold'}">${day}</span>
                        ${dayEvents.length > 0 ? '<span class="text-[10px] text-vx-muted opacity-0 group-hover:opacity-100 transition-opacity">+ reuniao</span>' : ''}
                    </span>
                    <span class="absolute left-3 right-3 bottom-3 rounded-xl bg-[#191919] border border-vx-border p-3 text-center">
                        <span class="block text-[11px] uppercase tracking-[0.18em] text-vx-muted font-bold mb-2">Status do dia</span>
                        ${dayEvents.length > 0 ? `
                            <span class="block space-y-1">
                                <span class="block text-white text-sm font-black">${executed} ${executed === 1 ? 'call realizada' : 'calls realizadas'}</span>
                                <span class="block text-green-400 text-sm font-black">${sales} ${sales === 1 ? 'fechamento realizado' : 'fechamentos realizados'}</span>
                                <span class="block text-yellow-400 text-sm font-black">${formatCurrency(revenue)}</span>
                            </span>
                        ` : '<span class="block text-vx-muted text-sm mt-2">-</span>'}
                    </span>
                </button>
            `;
        }

        grid.innerHTML = html;
    }

    function renderUpcomingEvents({ events, clients }) {
        const container = document.getElementById('upcoming-events');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const upcoming = events
            .filter(event => event.date >= today)
            .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

        if (!upcoming.length) {
            container.innerHTML = '<p class="text-vx-muted text-sm">Nenhum evento agendado</p>';
            return;
        }

        container.innerHTML = upcoming.map(event => {
            const client = clients.find(item => item.id === event.clientId);
            const status = event.status || 'agendada';
            const sale = isClosedSale(event);
            const revenue = Number(event.revenue || 0) || 0;

            return `
                <article class="bg-vx-darker rounded-xl p-4 border border-vx-border hover:border-vx-purple transition-all min-h-[178px]">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="font-medium">${safeText(event.title)}</p>
                            <p class="text-xs text-vx-muted mt-1">${formatDate(event.date)} ${safeText(event.time || '')}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs ${status === 'executada' ? 'bg-green-500/20 text-green-400' : status === 'cancelada' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">${safeText(status)}</span>
                    </div>

                    ${client ? `<p class="text-xs text-vx-purple mt-2">${safeText(client.name)}</p>` : ''}

                    <div class="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        ${sale ? '<span class="text-green-400 font-bold">1 Venda</span>' : '<span class="text-vx-muted">Sem fechamento</span>'}
                        ${revenue > 0 ? `<span class="text-yellow-400 font-bold">${formatCurrency(revenue)}</span>` : ''}
                    </div>

                    <div class="grid grid-cols-2 gap-2 mt-4">
                        <button type="button" data-event-action="edit" data-event-id="${safeText(event.id)}" class="event-action-btn px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs transition-colors">Editar</button>
                        <button type="button" data-event-action="delete" data-event-id="${safeText(event.id)}" class="event-action-btn px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors">Excluir</button>
                    </div>
                </article>
            `;
        }).join('');
    }

    window.VXCalendarPage = {
        populateClientFilter,
        render
    };
})();
