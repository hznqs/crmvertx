const STORAGE_KEYS = {
            clients: 'vx_clients',
            goals: 'vx_goals',
            events: 'vx_events',
            contracts: 'vx_contracts',
            deliveries: 'vx_deliveries',
            clientDashboards: 'vx_client_dashboards',
            teamMembers: 'vx_team_members',
            commissionSales: 'vx_commission_sales',
            clientPerformance: 'vx_client_performance',
            financeEntries: 'vx_finance_entries',
            executiveSettings: 'vx_executive_settings',
            agencyGoals: 'vx_agency_goals',
            currentGoal: 'vx_current_goal'
        };

        function readStorage(key, fallback) {
            return fallback;
        }

        function writeStorage(key, value) {
            return value;
        }

        // Data store
        let clients = readStorage(STORAGE_KEYS.clients, []);
        let goals = readStorage(STORAGE_KEYS.goals, []);
        let events = readStorage(STORAGE_KEYS.events, []);
        let contracts = readStorage(STORAGE_KEYS.contracts, []);
        let deliveries = readStorage(STORAGE_KEYS.deliveries, []);
        let clientDashboards = readStorage(STORAGE_KEYS.clientDashboards, {});
        let teamMembers = readStorage(STORAGE_KEYS.teamMembers, []);
        let commissionSales = readStorage(STORAGE_KEYS.commissionSales, []);
        let clientPerformance = readStorage(STORAGE_KEYS.clientPerformance, []);
        let financeEntries = readStorage(STORAGE_KEYS.financeEntries, []);
        let executiveSettings = readStorage(STORAGE_KEYS.executiveSettings, { profitMargin: 45 });
        let agencyGoals = readStorage(STORAGE_KEYS.agencyGoals, {
            revenue: 50000,
            newClients: 10,
            averageTicket: 3000,
            retention: 90,
            proposals: 25,
            meetings: 15
        });
        let currentGoal = readStorage(STORAGE_KEYS.currentGoal, { target: 50000, date: new Date().toISOString() });
        let currentMonth = new Date();
        let backendAvailable = false;
        let dashboardMetrics = null;
        let crmSettings = null;
        let uploadedDocuments = [];
        let auditLogs = [];
        let clientsPage = { number: 0, size: 25, totalPages: 1, totalElements: 0 };
        let contractsPage = { number: 0, size: 25, totalPages: 1, totalElements: 0 };
        let financePage = { number: 0, size: 12, totalPages: 1, totalElements: 0 };
        let teamPage = { number: 0, size: 10, totalPages: 1, totalElements: 0 };
        let goalsPage = { number: 0, size: 10, totalPages: 1, totalElements: 0 };

        window.logout = async function logout() {
            const refreshToken = window.VXAuth?.refreshToken?.();
            try {
                await window.VXApi?.auth?.logout?.({ refreshToken, revokeAllSessions: false });
            } catch (error) {
                console.warn('Nao foi possivel revogar a sessao no backend antes do logout.', error);
            } finally {
                window.VXAuth?.clear();
                window.location.replace('/login.html');
            }
        };

        window.toggleDesktopSidebar = function toggleDesktopSidebar() {
            document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('vx_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed') ? '1' : '0');
        };

        function toClientPayload(client) {
            return {
                name: client.name,
                phase: client.phase,
                value: Number(client.value || 0),
                months: Number(client.months || 1),
                contact: client.contact,
                email: client.email,
                phone: client.phone,
                notes: client.notes || ''
            };
        }

        async function hydrateClientsFromApi() {
            if (!window.VXApi?.clients) return;

            try {
                const page = await window.VXApi.clients.page({ size: clientsPage.size, page: clientsPage.number });
                backendAvailable = true;
                clients = Array.isArray(page?.content) ? page.content : [];
                clientsPage = {
                    number: page?.number || 0,
                    size: page?.size || clientsPage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || clients.length
                };
            } catch (error) {
                backendAvailable = false;
                console.warn('API indisponivel. Dados de clientes nao serao carregados do navegador.', error);
            }
        }

        async function loadClientsPage(pageNumber = 0) {
            if (!window.VXApi?.clients?.page || !backendAvailable) {
                renderClientsTable();
                return;
            }

            try {
                const page = await window.VXApi.clients.page({
                    page: Math.max(pageNumber, 0),
                    size: clientsPage.size,
                    search: document.getElementById('client-search')?.value || '',
                    phase: document.getElementById('filter-phase')?.value || ''
                });
                clients = Array.isArray(page?.content) ? page.content : [];
                clientsPage = {
                    number: page?.number || 0,
                    size: page?.size || clientsPage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || clients.length
                };
                renderClientsTable();
            } catch (error) {
                showToast(error.message || 'Nao foi possivel carregar clientes', 'error');
            }
        }

        async function loadContractsPage(pageNumber = 0) {
            if (!window.VXApi?.contracts?.page || !backendAvailable) {
                renderContracts();
                return;
            }

            try {
                const page = await window.VXApi.contracts.page({
                    page: Math.max(pageNumber, 0),
                    size: contractsPage.size,
                    status: document.getElementById('contracts-status-filter')?.value || ''
                });
                contracts = Array.isArray(page?.content) ? page.content : [];
                contractsPage = {
                    number: page?.number || 0,
                    size: page?.size || contractsPage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || contracts.length
                };
                renderContracts();
            } catch (error) {
                showToast(error.message || 'Nao foi possivel carregar contratos', 'error');
            }
        }

        async function loadFinancePage(pageNumber = 0) {
            if (!window.VXApi?.financeEntries?.page || !backendAvailable) {
                renderRealFinance();
                return;
            }

            try {
                const page = await window.VXApi.financeEntries.page({
                    page: Math.max(pageNumber, 0),
                    size: financePage.size,
                    type: document.getElementById('finance-type-filter')?.value || '',
                    status: document.getElementById('finance-status-filter')?.value || '',
                    from: document.getElementById('finance-from-filter')?.value || '',
                    to: document.getElementById('finance-to-filter')?.value || ''
                });
                financeEntries = Array.isArray(page?.content) ? page.content.map(normalizeFinanceEntry) : [];
                financePage = {
                    number: page?.number || 0,
                    size: page?.size || financePage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || financeEntries.length
                };
                renderRealFinance();
            } catch (error) {
                showToast(error.message || 'Nao foi possivel carregar financeiro', 'error');
            }
        }

        window.loadContractsPage = loadContractsPage;
        window.loadFinancePage = loadFinancePage;

        async function loadTeamPage(pageNumber = 0) {
            if (!window.VXApi?.teamMembers?.page || !backendAvailable) {
                renderTeam();
                return;
            }

            try {
                const page = await window.VXApi.teamMembers.page({
                    page: Math.max(pageNumber, 0),
                    size: teamPage.size,
                    role: document.getElementById('team-role-filter')?.value || '',
                    search: document.getElementById('team-search')?.value || ''
                });
                teamMembers = Array.isArray(page?.content) ? page.content.map(normalizeTeamMember) : [];
                teamPage = {
                    number: page?.number || 0,
                    size: page?.size || teamPage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || teamMembers.length
                };
                renderTeam();
            } catch (error) {
                showToast(error.message || 'Nao foi possivel carregar equipe', 'error');
            }
        }

        async function loadGoalsPage(pageNumber = 0) {
            if (!window.VXApi?.goals?.page || !backendAvailable) {
                renderGoals();
                return;
            }

            try {
                const page = await window.VXApi.goals.page({
                    page: Math.max(pageNumber, 0),
                    size: goalsPage.size,
                    from: document.getElementById('goals-from-filter')?.value || '',
                    to: document.getElementById('goals-to-filter')?.value || ''
                });
                goals = Array.isArray(page?.content) ? page.content : [];
                goalsPage = {
                    number: page?.number || 0,
                    size: page?.size || goalsPage.size,
                    totalPages: page?.totalPages || 1,
                    totalElements: page?.totalElements || goals.length
                };
                if (goals.length) currentGoal = goals[0];
                renderGoals();
            } catch (error) {
                showToast(error.message || 'Nao foi possivel carregar metas', 'error');
            }
        }

        window.loadTeamPage = loadTeamPage;
        window.loadGoalsPage = loadGoalsPage;

        async function persistClient(client, isUpdate) {
            if (!window.VXApi?.clients || !backendAvailable) {
                throw new Error('API indisponivel para persistir cliente.');
            }

            return isUpdate
                ? window.VXApi.clients.update(client.id, toClientPayload(client))
                : window.VXApi.clients.create(toClientPayload(client));
        }

        function normalizeFinanceEntry(entry) {
            return {
                ...entry,
                recurring: entry.recurring === true ? 'sim' : (entry.recurring || 'nao'),
                auto: entry.autoBilling === true ? 'sim' : (entry.auto || 'nao')
            };
        }

        function normalizeTeamMember(member) {
            if (!member || typeof member.taskBreakdown !== 'string') return member;

            try {
                return { ...member, taskBreakdown: JSON.parse(member.taskBreakdown || '{}') };
            } catch (error) {
                return { ...member, taskBreakdown: {} };
            }
        }

        function toFinancePayload(entry) {
            return {
                type: entry.type,
                status: entry.status,
                description: entry.description,
                value: Number(entry.value || 0),
                due: entry.due,
                recurring: entry.recurring === true || entry.recurring === 'sim',
                autoBilling: entry.auto === true || entry.auto === 'sim'
            };
        }

        function toTeamPayload(member) {
            return {
                ...member,
                taskBreakdown: typeof member.taskBreakdown === 'string'
                    ? member.taskBreakdown
                    : JSON.stringify(member.taskBreakdown || {})
            };
        }

        async function hydrateResource(apiName, storageKey, normalizer = (item) => item) {
            if (!window.VXApi?.[apiName]) return null;

            try {
                const data = await window.VXApi[apiName].list({ size: 500 });
                backendAvailable = true;
                const normalized = Array.isArray(data) ? data.map(normalizer) : [];
                return normalized;
            } catch (error) {
                console.warn(`API de ${apiName} indisponivel. Dados nao serao carregados do navegador.`, error);
                return null;
            }
        }

        async function hydrateOperationsFromApi() {
            contracts = await hydrateResource('contracts', STORAGE_KEYS.contracts) || contracts;
            deliveries = await hydrateResource('deliveries', STORAGE_KEYS.deliveries) || deliveries;
            events = await hydrateResource('events', STORAGE_KEYS.events) || events;
            financeEntries = await hydrateResource('financeEntries', STORAGE_KEYS.financeEntries, normalizeFinanceEntry) || financeEntries;
            clientPerformance = await hydrateResource('performanceRecords', STORAGE_KEYS.clientPerformance) || clientPerformance;
            goals = await hydrateResource('goals', STORAGE_KEYS.goals) || goals;
            teamMembers = await hydrateResource('teamMembers', STORAGE_KEYS.teamMembers, normalizeTeamMember) || teamMembers;
            if (goals.length) currentGoal = goals[0];
        }

        async function hydrateDashboardMetricsFromApi() {
            if (!window.VXApi?.dashboard?.metrics) return;

            try {
                dashboardMetrics = await window.VXApi.dashboard.metrics({
                    from: document.getElementById('dashboard-from-filter')?.value || '',
                    to: document.getElementById('dashboard-to-filter')?.value || ''
                });
            } catch (error) {
                console.warn('Metricas agregadas indisponiveis. Usando calculo em memoria da sessao.', error);
            }
        }

        async function refreshDashboardMetrics() {
            await hydrateDashboardMetricsFromApi();
            updateAllMetrics();
            setTimeout(renderDashboardCharts, 60);
        }

        window.refreshDashboardMetrics = refreshDashboardMetrics;

        async function hydrateCurrentUserFromApi() {
            if (!window.VXApi?.auth?.me) return;

            try {
                const user = await window.VXApi.auth.me();
                window.VXAuth?.updateUser?.(user);
            } catch (error) {
                console.warn('Nao foi possivel atualizar o perfil autenticado.', error);
            }
        }

        async function hydrateSettingsFromApi() {
            if (!window.VXApi?.settings?.get || !window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) return;

            try {
                crmSettings = await window.VXApi.settings.get();
            } catch (error) {
                console.warn('Configuracoes indisponiveis para este usuario.', error);
            }
        }

        async function hydrateUploadsFromApi() {
            if (!window.VXApi?.uploads?.list) return;

            try {
                uploadedDocuments = await window.VXApi.uploads.list({
                    size: 50,
                    q: document.getElementById('documents-search')?.value || ''
                });
            } catch (error) {
                console.warn('Documentos indisponiveis no momento.', error);
            }
        }

        async function hydrateAuditFromApi() {
            if (!window.VXApi?.audit?.list || !window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) return;

            try {
                const from = document.getElementById('audit-from-filter')?.value;
                const to = document.getElementById('audit-to-filter')?.value;
                auditLogs = await window.VXApi.audit.list({
                    size: 50,
                    action: document.getElementById('audit-action-filter')?.value || '',
                    entity: document.getElementById('audit-entity-filter')?.value || '',
                    from: from ? `${from}T00:00:00Z` : '',
                    to: to ? `${to}T23:59:59Z` : ''
                });
            } catch (error) {
                console.warn('Auditoria indisponivel para este usuario.', error);
            }
        }

        function applyRoleVisibility() {
            const role = window.VXAuth?.user?.()?.role;
            document.querySelectorAll('[data-roles]').forEach((element) => {
                const roles = String(element.dataset.roles || '').split(',').map(item => item.trim()).filter(Boolean);
                element.hidden = roles.length > 0 && !roles.includes(role);
            });
        }

        async function persistResource(apiName, item, isUpdate, payloadMapper = (value) => value) {
            if (!window.VXApi?.[apiName] || !backendAvailable) {
                throw new Error(`API indisponivel para persistir ${apiName}.`);
            }
            const payload = payloadMapper(item);
            return isUpdate
                ? window.VXApi[apiName].update(item.id, payload)
                : window.VXApi[apiName].create(payload);
        }

        async function removeResource(apiName, id) {
            if (!window.VXApi?.[apiName] || !backendAvailable) {
                throw new Error(`API indisponivel para remover ${apiName}.`);
            }
            await window.VXApi[apiName].remove(id);
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', async () => {
            window.VXAuth?.requireAuth();
            window.VXUI?.installMobileNavigation();
            if (localStorage.getItem('vx_sidebar_collapsed') === '1') {
                document.body.classList.add('sidebar-collapsed');
            }
            await hydrateCurrentUserFromApi();
            const user = window.VXAuth?.user?.();
            const userEl = document.getElementById('current-user-name');
            if (userEl && user?.name) userEl.textContent = user.name;
            applyRoleVisibility();

            await hydrateClientsFromApi();
            await hydrateOperationsFromApi();
            await hydrateDashboardMetricsFromApi();
            await hydrateSettingsFromApi();
            await hydrateUploadsFromApi();
            await hydrateAuditFromApi();
            updateAllMetrics();
            renderCalendar();
            setupEventListeners();
            setupProfileAndSettings();
            setupDocumentsAndAudit();
            window.VXUI?.bindSubmitBusyState();
            setupDragAndDrop();
            navigate('dashboard');
            requestAnimationFrame(() => document.body.classList.add('is-loaded'));

            window.addEventListener('resize', () => {
                if (!document.getElementById('page-dashboard').classList.contains('hidden')) {
                    setTimeout(renderDashboardCharts, 60);
                }
            });

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-event-action]');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const id = btn.dataset.eventId;
                const action = btn.dataset.eventAction;

                if (action === 'delete') {
                    deleteEvent(id);
                }

                if (action === 'edit') {
                    openEventModal(id);
                }
            });

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-performance-action]');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const id = btn.dataset.performanceId;
                const action = btn.dataset.performanceAction;

                if (action === 'edit') openPerformanceModal(id);
                if (action === 'delete') deletePerformanceRecord(id);
            });

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-finance-action]');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const id = btn.dataset.financeId;
                const action = btn.dataset.financeAction;

                if (action === 'delete') deleteFinanceEntry(id);
                if (action === 'edit') openFinanceModal(id);
            });
        });

        // Navigation
        function navigate(page) {
            const targetPage = document.getElementById(`page-${page}`);
            if (!targetPage || targetPage.hidden) {
                showToast('Acesso indisponivel para este perfil', 'error');
                page = 'dashboard';
            }
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            document.getElementById(`page-${page}`).classList.remove('hidden');
            window.VXUI?.activateNavigation(page);
            
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-vx-card', 'border-l-2', 'border-vx-purple');
                if (btn.dataset.page === page) {
                    btn.classList.add('bg-vx-card', 'border-l-2', 'border-vx-purple');
                }
            });

            if (page === 'dashboard') setTimeout(renderDashboardCharts, 60);
            if (page === 'kanban') renderKanban();
            if (page === 'calendar') renderCalendar();
            if (page === 'billing') renderBilling();
            if (page === 'contracts') loadContractsPage(contractsPage.number || 0);
            if (page === 'deliveries') renderDeliveries();
            if (page === 'performance') renderClientPerformance();
            if (page === 'financeiro-real') loadFinancePage(financePage.number || 0);
            if (page === 'team') loadTeamPage(teamPage.number || 0);
            if (page === 'commissions') renderCommissions();
            if (page === 'ranking') renderRanking();
            if (page === 'executive') renderExecutiveDashboard();
            if (page === 'goals') loadGoalsPage(goalsPage.number || 0);
            if (page === 'settings') renderSettings();
            if (page === 'profile') renderProfile();
            if (page === 'documents') renderDocuments();
            if (page === 'audit') renderAudit();

            if (window.innerWidth < 1024) {
                document.getElementById('sidebar')?.classList.add('-translate-x-full');
            }
        }

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('-translate-x-full');
        }

        // Dashboard charts
        function getChartTheme() {
            return {
                text: '#9ca3af',
                grid: 'rgba(255,255,255,0.08)',
                purple: '#6a0dad',
                pink: '#ea59dc',
                green: '#22c55e',
                yellow: '#eab308',
                blue: '#3b82f6',
                red: '#ef4444',
                card: '#0f0f0f'
            };
        }

        function clearCanvas(ctx, canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function setupCanvas(canvas) {
            if (!canvas) return null;

            const ratio = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            const displayWidth = Math.max(rect.width, 300);
            const displayHeight = Math.max(parseInt(canvas.getAttribute('height')) || 320, 320);

            canvas.style.width = '100%';
            canvas.style.height = displayHeight + 'px';

            canvas.width = displayWidth * ratio;
            canvas.height = displayHeight * ratio;

            const ctx = canvas.getContext('2d');
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            return {
                ctx,
                width: displayWidth,
                height: displayHeight
            };
        }

        function drawEmptyChart(ctx, width, height, message = 'Sem dados para exibir') {
            ctx.fillStyle = '#6b7280';
            ctx.font = '500 14px SF Pro Display, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(message, width / 2, height / 2);
        }

        function drawBarChart(canvasId, labels, values, options = {}) {
            const canvas = document.getElementById(canvasId);
            const setup = setupCanvas(canvas);
            if (!setup) return;

            const { ctx, width, height } = setup;
            clearCanvas(ctx, canvas);

            const theme = getChartTheme();
            const padding = { top: 18, right: 18, bottom: 36, left: 48 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;
            const maxValue = Math.max(...values, 0);

            if (!values.length || maxValue === 0) {
                drawEmptyChart(ctx, width, height);
                return;
            }

            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            ctx.fillStyle = theme.text;
            ctx.font = '500 11px SF Pro Display, sans-serif';
            ctx.textAlign = 'right';

            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                const value = maxValue - (maxValue / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
                ctx.fillText(options.money ? formatCompactMoney(value) : Math.round(value), padding.left - 8, y + 4);
            }

            const gap = Math.max(4, chartW / values.length * 0.15);
            const barW = Math.max(10, (chartW - gap * (values.length - 1)) / values.length);

            values.forEach((value, i) => {
                const x = padding.left + i * (barW + gap);
                const barH = (value / maxValue) * chartH;
                const y = padding.top + chartH - barH;

                const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
                gradient.addColorStop(0, options.color || theme.pink);
                gradient.addColorStop(1, theme.purple);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, barH, 6);
                ctx.fill();

                const shouldShowLabel = values.length <= 16 || i % Math.ceil(values.length / 10) === 0;
                if (shouldShowLabel) {
                    ctx.fillStyle = theme.text;
                    ctx.font = '500 10px SF Pro Display, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(labels[i], x + barW / 2, height - 12);
                }
            });
        }

        function drawDonutChart(canvasId, labels, values, colors) {
            const canvas = document.getElementById(canvasId);
            const setup = setupCanvas(canvas);
            if (!setup) return;

            const { ctx, width, height } = setup;
            clearCanvas(ctx, canvas);

            const total = values.reduce((a, b) => a + b, 0);
            if (!total) {
                drawEmptyChart(ctx, width, height);
                return;
            }

            const cx = width * 0.32;
            const cy = height / 2;
            const radius = Math.min(width, height) * 0.28;
            let start = -Math.PI / 2;

            values.forEach((value, i) => {
                const angle = (value / total) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, radius, start, start + angle);
                ctx.closePath();
                ctx.fillStyle = colors[i];
                ctx.fill();
                start += angle;
            });

            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
            ctx.fillStyle = '#0f0f0f';
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = '700 24px SF Pro Display, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(total, cx, cy + 8);

            const legendX = width * 0.62;
            let legendY = height / 2 - (labels.length * 22) / 2;
            ctx.textAlign = 'left';
            labels.forEach((label, i) => {
                ctx.fillStyle = colors[i];
                ctx.beginPath();
                ctx.roundRect(legendX, legendY - 10, 12, 12, 3);
                ctx.fill();

                ctx.fillStyle = '#9ca3af';
                ctx.font = '500 12px SF Pro Display, sans-serif';
                ctx.fillText(`${label}: ${values[i]}`, legendX + 20, legendY);
                legendY += 24;
            });
        }

        function drawGroupedBarChart(canvasId, labels, firstValues, secondValues) {
            const canvas = document.getElementById(canvasId);
            const setup = setupCanvas(canvas);
            if (!setup) return;

            const { ctx, width, height } = setup;
            clearCanvas(ctx, canvas);

            const theme = getChartTheme();
            const padding = { top: 18, right: 18, bottom: 40, left: 40 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;
            const maxValue = Math.max(...firstValues, ...secondValues, 0);

            if (maxValue === 0) {
                drawEmptyChart(ctx, width, height);
                return;
            }

            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            const groupGap = Math.max(8, chartW / labels.length * 0.18);
            const groupW = (chartW - groupGap * (labels.length - 1)) / labels.length;
            const barW = Math.max(8, groupW / 2.6);

            labels.forEach((label, i) => {
                const x = padding.left + i * (groupW + groupGap);
                const h1 = (firstValues[i] / maxValue) * chartH;
                const h2 = (secondValues[i] / maxValue) * chartH;

                ctx.fillStyle = theme.purple;
                ctx.beginPath();
                ctx.roundRect(x, padding.top + chartH - h1, barW, h1, 4);
                ctx.fill();

                ctx.fillStyle = theme.pink;
                ctx.beginPath();
                ctx.roundRect(x + barW + 3, padding.top + chartH - h2, barW, h2, 4);
                ctx.fill();

                if (labels.length <= 16 || i % Math.ceil(labels.length / 10) === 0) {
                    ctx.fillStyle = theme.text;
                    ctx.font = '500 10px SF Pro Display, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(label, x + groupW / 2, height - 14);
                }
            });

            ctx.font = '600 12px SF Pro Display, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = theme.purple;
            ctx.fillText('Calls', padding.left, 14);
            ctx.fillStyle = theme.pink;
            ctx.fillText('Fechamentos', padding.left + 58, 14);
        }

        function renderDashboardCharts() {
            const dashboardPage = document.getElementById('page-dashboard');
            if (!dashboardPage || dashboardPage.classList.contains('hidden')) return;

            const revenueCanvas = document.getElementById('revenue-daily-chart');
            const meetingsCanvas = document.getElementById('meetings-sales-chart');
            if (!revenueCanvas || !meetingsCanvas) return;

            // Aguarda o navegador calcular a largura real dos canvas após troca de aba.
            requestAnimationFrame(() => {
                const revenueWidth = revenueCanvas.getBoundingClientRect().width;
                const meetingsWidth = meetingsCanvas.getBoundingClientRect().width;

                if (revenueWidth === 0 || meetingsWidth === 0) {
                    setTimeout(renderDashboardCharts, 80);
                    return;
                }

                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

                const labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
                const dailyRevenue = Array(daysInMonth).fill(0);
                const dailyMeetings = Array(daysInMonth).fill(0);
                const dailySales = Array(daysInMonth).fill(0);

                events.forEach(event => {
                    if (!event.date || !event.date.startsWith(monthPrefix)) return;
                    const day = parseInt(event.date.split('-')[2], 10) - 1;
                    if (day < 0 || day >= daysInMonth) return;

                    if ((event.status || 'agendada') === 'executada') {
                        dailyMeetings[day] += 1;
                    }

                    if (typeof isClosedSale === 'function' ? isClosedSale(event) : ((event.status || 'agendada') === 'executada' && (event.sale === true || event.sale === 'sim'))) {
                        dailySales[day] += 1;
                        dailyRevenue[day] += parseFloat(event.revenue || 0) || 0;
                    }
                });

                const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                const monthEl = document.getElementById('chart-revenue-month-label');
                if (monthEl) monthEl.textContent = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

                drawBarChart('revenue-daily-chart', labels, dailyRevenue, { money: true, color: '#ea59dc' });
                drawGroupedBarChart('meetings-sales-chart', labels, dailyMeetings, dailySales);
            });
        }

        // Update all metrics
        function updateAllMetrics() {
            const activeClients = clients.filter(c => c.phase === 'fechado');
            const followups = clients.filter(c => c.phase === 'followup');
            const monthlyRevenue = dashboardMetrics
                ? Number(dashboardMetrics.monthlyRevenue || 0)
                : activeClients.reduce((sum, c) => sum + (parseFloat(c.value) * parseInt(c.months)), 0);
            
            // Dashboard stats
            document.getElementById('total-clients').textContent = clients.length;
            document.getElementById('active-clients').textContent = dashboardMetrics?.activeClients ?? activeClients.length;
            document.getElementById('pending-followups').textContent = followups.length;
            
            // Revenue
            document.getElementById('daily-revenue').textContent = formatCurrency(monthlyRevenue / 30);
            document.getElementById('weekly-revenue').textContent = formatCurrency(monthlyRevenue / 4);
            document.getElementById('monthly-revenue').textContent = formatCurrency(monthlyRevenue);
            
            // Goal progress
            const progress = Math.min((monthlyRevenue / currentGoal.target) * 100, 100);
            document.getElementById('goal-progress-text').textContent = `${progress.toFixed(1)}%`;
            document.getElementById('goal-progress-bar').style.width = `${progress}%`;
            document.getElementById('current-revenue-goal').textContent = formatCurrency(monthlyRevenue);
            document.getElementById('goal-target').textContent = formatCurrency(currentGoal.target);
            
            // Recent clients
            renderRecentClients();
            
            // Clients table
            renderClientsTable();
            renderDashboardCharts();
            if (document.getElementById('contracts-table')) renderContracts();
            if (document.getElementById('deliveries-board')) renderDeliveries();
            if (document.getElementById('team-list')) renderTeam();
            if (document.getElementById('exec-bars')) renderExecutiveDashboard();
            if (document.getElementById('performance-history')) renderClientPerformance();
            if (document.getElementById('finance-list')) renderRealFinance();
        }

        // Render functions
        function renderRecentClients() {
            const tbody = document.getElementById('recent-clients-table');
            if (!tbody) return;

            const recent = clients.slice(-8).reverse();

            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-vx-muted">Nenhum cliente cadastrado</td></tr>';
                return;
            }

            tbody.innerHTML = recent.map(client => {
                const id = safeId(client.id);
                return `
                <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                    <td class="px-6 py-4">
                        <p class="font-medium">${safeText(client.name)}</p>
                        <p class="text-xs text-vx-muted">${safeText(client.contact)}</p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs ${getPhaseClass(client.phase)}">${safeText(getPhaseLabel(client.phase))}</span>
                    </td>
                    <td class="px-6 py-4 font-medium">${formatCurrency(client.value)}</td>
                    <td class="px-6 py-4 text-vx-muted">${safeText(client.email)}</td>
                    <td class="px-6 py-4">
                        <button onclick="closeRecentClientsModal(); openClientDashboard(decodeURIComponent('${id}'))" class="px-3 py-2 bg-vx-purple/20 text-vx-pink hover:bg-vx-purple/30 rounded-lg transition-colors text-xs font-bold">
                            Ver dashboard
                        </button>
                    </td>
                </tr>
            `;
            }).join('');
        }

        function openRecentClientsModal() {
            renderRecentClients();
            const modal = document.getElementById('recent-clients-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeRecentClientsModal() {
            const modal = document.getElementById('recent-clients-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function renderClientsTable() {
            const tbody = document.getElementById('clients-table');
            const search = document.getElementById('client-search')?.value?.toLowerCase() || '';
            const filter = document.getElementById('filter-phase')?.value || '';
            
            let filtered = clients;
            if (!backendAvailable && search) {
                filtered = filtered.filter(c => 
                    normalizeText(c.name).includes(search) ||
                    normalizeText(c.contact).includes(search) ||
                    normalizeText(c.email).includes(search)
                );
            }
            if (!backendAvailable && filter) {
                filtered = filtered.filter(c => c.phase === filter);
            }
            
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-vx-muted">Nenhum cliente encontrado</td></tr>';
                renderClientsPagination();
                return;
            }
            
            const canEditClient = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR', 'COMERCIAL');
            const canDeleteClient = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');
            tbody.innerHTML = filtered.map(client => {
                const id = safeId(client.id);
                return `
                <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                    <td class="px-6 py-4 font-medium">${safeText(client.name)}</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs ${getPhaseClass(client.phase)}">${safeText(getPhaseLabel(client.phase))}</span>
                    </td>
                    <td class="px-6 py-4">${formatCurrency(client.value)}</td>
                    <td class="px-6 py-4">${safeText(client.months)}</td>
                    <td class="px-6 py-4">${safeText(client.contact)}</td>
                    <td class="px-6 py-4 text-vx-muted">${safeText(client.email)}</td>
                    <td class="px-6 py-4">${safeText(client.phone)}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <button onclick="openClientDashboard(decodeURIComponent('${id}'))" class="px-3 py-2 bg-vx-purple/20 text-vx-pink hover:bg-vx-purple/30 rounded-lg transition-colors text-xs font-bold">
                                Dashboard
                            </button>
                            ${canEditClient ? `<button onclick="editClient(decodeURIComponent('${id}'))" class="p-2 hover:bg-vx-border rounded-lg transition-colors">
                                <svg class="w-4 h-4 text-vx-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>` : ''}
                            ${canDeleteClient ? `<button onclick="deleteClient(decodeURIComponent('${id}'))" class="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
            renderClientsPagination();
        }

        function renderClientsPagination() {
            renderPagination('clients-pagination', clientsPage, 'changeClientsPage', 'cliente');
        }

        function renderPagination(containerId, pageInfo, handlerName, label = 'registro') {
            const container = document.getElementById(containerId);
            if (!container) return;

            const current = Number(pageInfo.number || 0);
            const totalPages = Math.max(Number(pageInfo.totalPages || 1), 1);
            const totalElements = Number(pageInfo.totalElements || 0);
            container.innerHTML = `
                <span>${totalElements} ${label}${totalElements === 1 ? '' : 's'} · página ${current + 1} de ${totalPages}</span>
                <div class="pagination-bar__actions">
                    <button type="button" ${current <= 0 ? 'disabled' : ''} onclick="${handlerName}(${current - 1})">Anterior</button>
                    <button type="button" ${current >= totalPages - 1 ? 'disabled' : ''} onclick="${handlerName}(${current + 1})">Próxima</button>
                </div>
            `;
        }

        window.changeClientsPage = function changeClientsPage(pageNumber) {
            loadClientsPage(pageNumber);
        };

        function renderKanban() {
            const phases = ['prospeccao', 'negociacao', 'fechado', 'followup'];
            
            phases.forEach(phase => {
                const container = document.getElementById(`kanban-${phase}`);
                const phaseClients = clients.filter(c => c.phase === phase);
                
                document.getElementById(`count-${phase}`).textContent = phaseClients.length;
                
                if (phaseClients.length === 0) {
                    container.innerHTML = '<p class="text-vx-muted text-sm text-center py-4">Nenhum cliente</p>';
                    return;
                }
                
                container.innerHTML = phaseClients.map(client => `
                    <div class="kanban-card bg-vx-darker rounded-xl p-4 border border-vx-border cursor-grab hover:border-vx-purple transition-all" 
                         draggable="false" data-id="${safeText(client.id)}">
                        <p class="font-medium mb-2">${safeText(client.name)}</p>
                        <p class="text-sm text-vx-muted mb-3">${safeText(client.contact)}</p>
                        <div class="flex items-center justify-between">
                            <span class="font-display font-bold gradient-text">${formatCurrency(client.value)}</span>
                            <span class="text-xs text-vx-muted">${safeText(client.months)} meses</span>
                        </div>
                    </div>
                `).join('');
            });
            
            setupDragAndDrop();
        }

        function isMeetingDone(event) {
            return (event.status || 'agendada') === 'executada';
        }

        function isClosedSale(event) {
            return isMeetingDone(event) && (event.sale === true || event.sale === 'sim');
        }

        function renderCalendar() {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            const title = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
            const titleEl = document.getElementById('calendar-main-title');
            if (titleEl) titleEl.textContent = formattedTitle;

            const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
            const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`;
            const monthEvents = events.filter(e => e.date >= monthStart && e.date <= monthEnd);

            const totalMeetings = monthEvents.length;
            const totalExecuted = monthEvents.filter(e => (e.status || 'agendada') === 'executada').length;
            const totalSales = monthEvents.filter(e => isClosedSale(e)).length;
            const totalRevenue = monthEvents.filter(e => isClosedSale(e)).reduce((sum, e) => sum + (parseFloat(e.revenue || 0) || 0), 0);

            document.getElementById('calendar-total-meetings').textContent = totalMeetings;
            document.getElementById('calendar-total-executed').textContent = totalExecuted;
            document.getElementById('calendar-total-sales').textContent = totalSales;
            document.getElementById('calendar-total-revenue').textContent = formatCurrency(totalRevenue);
            if (document.getElementById('legend-executed')) document.getElementById('legend-executed').textContent = totalExecuted;
            if (document.getElementById('legend-sales')) document.getElementById('legend-sales').textContent = totalSales;
            if (document.getElementById('legend-revenue')) document.getElementById('legend-revenue').textContent = formatCurrency(totalRevenue);

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const todayStr = new Date().toISOString().split('T')[0];

            let html = '';

            for (let i = 0; i < firstDay; i++) {
                html += '<div class="min-h-[150px] rounded-2xl border border-transparent"></div>';
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);
                const executed = dayEvents.filter(e => (e.status || 'agendada') === 'executada').length;
                const sales = dayEvents.filter(e => isClosedSale(e)).length;
                const revenue = dayEvents.filter(e => isClosedSale(e)).reduce((sum, e) => sum + (parseFloat(e.revenue || 0) || 0), 0);
                const isToday = todayStr === dateStr;

                html += `
                    <div onclick="selectDate('${dateStr}')" class="group min-h-[150px] lg:min-h-[180px] rounded-2xl border ${isToday ? 'border-yellow-500/70 bg-yellow-500/5' : 'border-vx-border bg-vx-card'} p-3 cursor-pointer hover:border-vx-purple hover:bg-vx-card/90 transition-all relative overflow-hidden">
                        <div class="flex items-start justify-between">
                            <span class="${isToday ? 'bg-yellow-400 text-black px-2 py-1 rounded-md font-black' : 'text-vx-muted font-bold'}">${day}</span>
                            ${dayEvents.length > 0 ? `<span class="text-[10px] text-vx-muted opacity-0 group-hover:opacity-100 transition-opacity">+ reunião</span>` : ''}
                        </div>

                        <div class="absolute left-3 right-3 bottom-3 rounded-xl bg-[#191919] border border-vx-border p-3 text-center">
                            <p class="text-[11px] uppercase tracking-[0.18em] text-vx-muted font-bold mb-2">Status do dia</p>
                            ${dayEvents.length > 0 ? `
                                <div class="space-y-1">
                                    <p class="text-white text-sm font-black">${executed} ${executed === 1 ? 'call realizada' : 'calls realizadas'}</p>
                                    <p class="text-green-400 text-sm font-black">${sales} ${sales === 1 ? 'fechamento realizado' : 'fechamentos realizados'}</p>
                                    <p class="text-yellow-400 text-sm font-black">${formatCurrency(revenue)}</p>
                                </div>
                            ` : `<p class="text-vx-muted text-sm mt-2">-</p>`}
                        </div>
                    </div>
                `;
            }

            document.getElementById('calendar-grid').innerHTML = html;
            renderUpcomingEvents();
        }

        function formatCompactMoney(value) {
            const n = parseFloat(value || 0);
            if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace('.', ',')}M`;
            if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}k`;
            return n.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
        }

        function renderUpcomingEvents() {
            const container = document.getElementById('upcoming-events');
            const today = new Date().toISOString().split('T')[0];
            const upcoming = events
                .filter(e => e.date >= today)
                .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

            if (upcoming.length === 0) {
                container.innerHTML = '<p class="text-vx-muted text-sm">Nenhum evento agendado</p>';
                return;
            }

            container.innerHTML = upcoming.map(event => {
                const client = clients.find(c => c.id === event.clientId);
                const status = event.status || 'agendada';
                const sale = isClosedSale(event);
                const revenue = parseFloat(event.revenue || 0) || 0;

                return `
                    <div class="bg-vx-darker rounded-xl p-4 border border-vx-border hover:border-vx-purple transition-all min-h-[178px]">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="font-medium">${safeText(event.title)}</p>
                                <p class="text-xs text-vx-muted mt-1">${formatDate(event.date)} ${safeText(event.time || '')}</p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs ${status === 'executada' ? 'bg-green-500/20 text-green-400' : status === 'cancelada' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}">${safeText(status)}</span>
                        </div>

                        ${client ? `<p class="text-xs text-vx-purple mt-2">${safeText(client.name)}</p>` : ''}

                        <div class="flex flex-wrap items-center gap-2 mt-3 text-xs">
                            ${sale ? `<span class="text-green-400 font-bold">✅ 1 Venda</span>` : `<span class="text-vx-muted">Sem fechamento</span>`}
                            ${revenue > 0 ? `<span class="text-yellow-400 font-bold">${formatCurrency(revenue)}</span>` : ''}
                        </div>

                        <div class="grid grid-cols-2 gap-2 mt-4">
                            <button type="button" data-event-action="edit" data-event-id="${safeText(event.id)}" class="event-action-btn px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs transition-colors">Editar</button>
                            <button type="button" data-event-action="delete" data-event-id="${safeText(event.id)}" class="event-action-btn px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs transition-colors">Excluir</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderBilling() {
            const activeClients = clients.filter(c => c.phase === 'fechado');
            const totalRevenue = activeClients.reduce((sum, c) => sum + (parseFloat(c.value) * parseInt(c.months)), 0);
            const avgTicket = activeClients.length > 0 ? totalRevenue / activeClients.length : 0;
            
            document.getElementById('billing-total').textContent = formatCurrency(totalRevenue);
            document.getElementById('billing-average').textContent = formatCurrency(avgTicket);
            document.getElementById('billing-contracts').textContent = activeClients.length;
            
            const tbody = document.getElementById('billing-table');
            
            if (activeClients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-vx-muted">Nenhum cliente ativo</td></tr>';
                return;
            }
            
            tbody.innerHTML = activeClients.map(client => `
                <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                    <td class="px-6 py-4 font-medium">${safeText(client.name)}</td>
                    <td class="px-6 py-4">${formatCurrency(client.value)}/mes</td>
                    <td class="px-6 py-4">${safeText(client.months)}</td>
                    <td class="px-6 py-4 font-display font-bold gradient-text">${formatCurrency(parseFloat(client.value) * parseInt(client.months))}</td>
                </tr>
            `).join('');
        }

        function renderGoals() {
            const activeClients = clients.filter(c => c.phase === 'fechado');
            const monthlyRevenue = activeClients.reduce((sum, c) => sum + (parseFloat(c.value) * parseInt(c.months)), 0);
            const progress = Math.min((monthlyRevenue / currentGoal.target) * 100, 100);
            const remaining = Math.max(currentGoal.target - monthlyRevenue, 0);
            
            document.getElementById('goal-page-progress').textContent = `${progress.toFixed(1)}%`;
            document.getElementById('goal-page-bar').style.width = `${progress}%`;
            document.getElementById('goal-current').textContent = formatCurrency(monthlyRevenue);
            document.getElementById('goal-target-page').textContent = formatCurrency(currentGoal.target);
            document.getElementById('goal-remaining').textContent = formatCurrency(remaining);
            renderAgencyGoals();
            
            // Goals history
            const container = document.getElementById('goals-history');
            const canManageGoals = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');
            if (goals.length === 0) {
                container.innerHTML = '<div class="empty-state"><h4>Nenhuma meta definida</h4><p>Defina metas mensais para acompanhar progresso comercial e financeiro.</p></div>';
                renderPagination('goals-pagination', goalsPage, 'changeGoalsPage', 'meta');
                return;
            }
            
            container.innerHTML = goals.map(goal => `
                <div class="flex items-center justify-between py-3 border-b border-vx-border last:border-0">
                    <div>
                        <p class="font-medium">${formatCurrency(goal.target)}</p>
                        <p class="text-xs text-vx-muted">${formatDate(goal.date)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm ${goal.achieved ? 'text-green-500' : 'text-vx-muted'}">${goal.achieved ? 'Alcançada' : 'Não alcançada'}</p>
                        ${canManageGoals ? `<button onclick="openGoalModal(decodeURIComponent('${safeId(goal.id)}'))" class="text-xs text-vx-muted hover:text-white mt-1">Editar</button>` : ''}
                    </div>
                </div>
            `).join('');
            renderPagination('goals-pagination', goalsPage, 'changeGoalsPage', 'meta');
        }

        window.changeGoalsPage = function changeGoalsPage(pageNumber) {
            loadGoalsPage(pageNumber);
        };


        // Contract functions
        function populateClientSelect(selectId, selectedId = '') {
            const select = document.getElementById(selectId);
            if (!select) return;
            if (clients.length === 0) {
                select.innerHTML = '<option value="">Cadastre um cliente primeiro</option>';
                return;
            }
            select.innerHTML = clients.map(c => `<option value="${safeText(c.id)}" ${c.id === selectedId ? 'selected' : ''}>${safeText(c.name)}</option>`).join('');
        }

        function openContractModal(id = null) {
            const modal = document.getElementById('contract-modal');
            const form = document.getElementById('contract-form');
            const title = document.getElementById('contract-modal-title');
            form.reset();
            document.getElementById('contract-id').value = '';
            populateClientSelect('contract-client');

            if (id) {
                const contract = contracts.find(c => c.id === id);
                if (contract) {
                    title.textContent = 'Editar Contrato';
                    document.getElementById('contract-id').value = contract.id;
                    populateClientSelect('contract-client', contract.clientId);
                    document.getElementById('contract-plan').value = contract.plan;
                    document.getElementById('contract-start').value = contract.startDate;
                    document.getElementById('contract-end').value = contract.endDate;
                    document.getElementById('contract-status').value = contract.status;
                    document.getElementById('contract-auto-renew').value = contract.autoRenew ? 'sim' : 'nao';
                }
            } else {
                title.textContent = 'Novo Contrato';
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeContractModal() {
            document.getElementById('contract-modal').classList.add('hidden');
            document.getElementById('contract-modal').classList.remove('flex');
        }

        async function deleteContract(id) {
            if (confirm('Tem certeza que deseja excluir este contrato?')) {
                try {
                    await removeResource('contracts', id);
                } catch (error) {
                    console.warn('Falha ao excluir contrato na API. Removendo localmente.', error);
                }
                contracts = contracts.filter(c => c.id !== id);
                saveData();
                renderContracts();
                showToast('Contrato excluído', 'success');
            }
        }

        function getClientName(clientId) {
            const client = clients.find(c => c.id === clientId);
            return client ? client.name : 'Cliente removido';
        }

        function getClientValue(clientId) {
            const client = clients.find(c => c.id === clientId);
            return client ? parseFloat(client.value || 0) : 0;
        }

        function getDaysUntil(dateStr) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const end = new Date(dateStr + 'T12:00:00');
            return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        }

        function renderContracts() {
            const tbody = document.getElementById('contracts-table');
            if (!tbody) return;

            const active = contracts.filter(c => c.status === 'ativo');
            const renewals = contracts.filter(c => c.status === 'ativo' && getDaysUntil(c.endDate) <= 30 && getDaysUntil(c.endDate) >= 0);
            const auto = contracts.filter(c => c.autoRenew);
            const mrr = active.reduce((sum, c) => sum + getClientValue(c.clientId), 0);

            document.getElementById('contracts-active').textContent = active.length;
            document.getElementById('contracts-renewal').textContent = renewals.length;
            document.getElementById('contracts-auto').textContent = auto.length;
            document.getElementById('contracts-mrr').textContent = formatCurrency(mrr);

            if (contracts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-8 text-center text-vx-muted">Nenhum contrato cadastrado</td></tr>';
                renderPagination('contracts-pagination', contractsPage, 'changeContractsPage');
                return;
            }

            tbody.innerHTML = contracts.map(contract => {
                const days = getDaysUntil(contract.endDate);
                const alert = days < 0 ? 'Vencido' : days <= 30 ? `${days} dias` : 'Sem alerta';
                const alertClass = days < 0 ? 'bg-red-500/20 text-red-400' : days <= 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-vx-border text-vx-muted';
                const statusClass = contract.status === 'ativo' ? 'bg-green-500/20 text-green-400' : contract.status === 'pausado' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';
                return `
                    <tr class="border-b border-vx-border hover:bg-vx-darker transition-colors">
                        <td class="px-6 py-4 font-medium">${safeText(getClientName(contract.clientId))}</td>
                        <td class="px-6 py-4">${safeText(contract.plan)}</td>
                        <td class="px-6 py-4 text-vx-muted">${formatDate(contract.startDate)}</td>
                        <td class="px-6 py-4 text-vx-muted">${formatDate(contract.endDate)}</td>
                        <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs ${statusClass}">${safeText(contract.status)}</span></td>
                        <td class="px-6 py-4">${contract.autoRenew ? 'Automática' : 'Manual'}</td>
                        <td class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs ${alertClass}">${safeText(alert)}</span></td>
                        <td class="px-6 py-4">
                            <div class="flex gap-2">
                                <button onclick="openContractModal(decodeURIComponent('${safeId(contract.id)}'))" class="p-2 hover:bg-vx-border rounded-lg transition-colors">Editar</button>
                                <button onclick="deleteContract(decodeURIComponent('${safeId(contract.id)}'))" class="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">Excluir</button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            renderPagination('contracts-pagination', contractsPage, 'changeContractsPage');
        }

        window.changeContractsPage = function changeContractsPage(pageNumber) {
            loadContractsPage(pageNumber);
        };

        // Delivery functions
        function openDeliveryModal(id = null) {
            const modal = document.getElementById('delivery-modal');
            const form = document.getElementById('delivery-form');
            const title = document.getElementById('delivery-modal-title');
            form.reset();
            document.getElementById('delivery-id').value = '';
            populateClientSelect('delivery-client');

            if (id) {
                const delivery = deliveries.find(d => d.id === id);
                if (delivery) {
                    title.textContent = 'Editar Entrega';
                    document.getElementById('delivery-id').value = delivery.id;
                    populateClientSelect('delivery-client', delivery.clientId);
                    document.getElementById('delivery-type').value = delivery.type;
                    document.getElementById('delivery-title').value = delivery.title;
                    document.getElementById('delivery-owner').value = delivery.owner;
                    document.getElementById('delivery-deadline').value = delivery.deadline;
                    document.getElementById('delivery-status').value = delivery.status;
                }
            } else {
                title.textContent = 'Nova Entrega';
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeDeliveryModal() {
            document.getElementById('delivery-modal').classList.add('hidden');
            document.getElementById('delivery-modal').classList.remove('flex');
        }

        async function deleteDelivery(id) {
            if (confirm('Tem certeza que deseja excluir esta entrega?')) {
                try {
                    await removeResource('deliveries', id);
                } catch (error) {
                    console.warn('Falha ao excluir entrega na API. Removendo localmente.', error);
                }
                deliveries = deliveries.filter(d => d.id !== id);
                saveData();
                renderDeliveries();
                showToast('Entrega excluída', 'success');
            }
        }

        function getDeliveryTypeLabel(type) {
            const labels = {
                'posts-pendentes': 'Posts Pendentes',
                'posts-aprovados': 'Posts Aprovados',
                'roteiros': 'Roteiros',
                'landing-pages': 'Landing Pages',
                'campanhas': 'Campanhas',
                'criativos': 'Criativos'
            };
            return labels[type] || type;
        }

        function getDeliveryStatusLabel(status) {
            const labels = { pendente: 'Pendente', producao: 'Em Produção', revisao: 'Em Revisão', aprovado: 'Aprovado' };
            return labels[status] || status;
        }

        function populateDeliveriesClientFilter() {
            const select = document.getElementById('deliveries-client-filter');
            if (!select) return;

            const currentValue = select.value || '';
            select.innerHTML = '<option value="">Todos os clientes</option>' +
                clients.map(client => `<option value="${safeText(client.id)}">${safeText(client.name)}</option>`).join('');

            if ([...select.options].some(option => option.value === currentValue)) {
                select.value = currentValue;
            }
        }

        function renderDeliveries() {
            const board = document.getElementById('deliveries-board');
            if (!board) return;

            populateDeliveriesClientFilter();

            const selectedClientId = document.getElementById('deliveries-client-filter')?.value || '';
            const visibleDeliveries = selectedClientId
                ? deliveries.filter(d => d.clientId === selectedClientId)
                : deliveries;

            const today = new Date().toISOString().split('T')[0];
            document.getElementById('deliveries-pending').textContent = visibleDeliveries.filter(d => d.status === 'pendente').length;
            document.getElementById('deliveries-production').textContent = visibleDeliveries.filter(d => d.status === 'producao').length;
            document.getElementById('deliveries-approved').textContent = visibleDeliveries.filter(d => d.status === 'aprovado').length;
            document.getElementById('deliveries-late').textContent = visibleDeliveries.filter(d => d.deadline < today && d.status !== 'aprovado').length;

            const columns = [
                { id: 'pendente', title: 'Pendente', color: 'bg-yellow-500' },
                { id: 'producao', title: 'Em Produção', color: 'bg-blue-500' },
                { id: 'revisao', title: 'Em Revisão', color: 'bg-vx-pink' },
                { id: 'aprovado', title: 'Aprovado', color: 'bg-green-500' }
            ];

            board.innerHTML = columns.map(col => {
                const items = visibleDeliveries.filter(d => d.status === col.id);
                return `
                    <div class="delivery-column bg-vx-card rounded-2xl border border-vx-border p-4 min-h-[360px] transition-all" data-status="${col.id}">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-3 h-3 rounded-full ${col.color}"></div>
                            <h3 class="font-display font-bold">${col.title}</h3>
                            <span class="ml-auto bg-vx-border px-2 py-1 rounded-full text-xs">${items.length}</span>
                        </div>
                        <div class="delivery-dropzone space-y-3 min-h-[260px]">
                            ${items.length === 0 ? '<p class="text-vx-muted text-sm text-center py-4">Arraste uma entrega para cá</p>' : items.map(item => `
                                <div class="delivery-card bg-vx-darker rounded-xl p-4 border border-vx-border hover:border-vx-purple transition-all cursor-grab" draggable="false" data-id="${safeText(item.id)}">
                                    <div class="flex items-start justify-between gap-3 mb-2">
                                        <p class="font-medium">${safeText(item.title)}</p>
                                        <span class="text-xs px-2 py-1 rounded-full bg-vx-purple/20 text-vx-pink">${safeText(getDeliveryTypeLabel(item.type))}</span>
                                    </div>
                                    <p class="text-sm text-vx-muted">${safeText(getClientName(item.clientId))}</p>
                                    <div class="flex items-center justify-between mt-3 text-xs">
                                        <span>Resp: ${safeText(item.owner)}</span>
                                        <span class="${item.deadline < today && item.status !== 'aprovado' ? 'text-red-400' : 'text-vx-muted'}">${formatDate(item.deadline)}</span>
                                    </div>
                                    <div class="flex gap-2 mt-4">
                                        <button onclick="openDeliveryModal(decodeURIComponent('${safeId(item.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                                        <button onclick="deleteDelivery(decodeURIComponent('${safeId(item.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');

            setupDeliveryDragAndDrop();
        }

        function setupDeliveryDragAndDrop() {
            const cards = document.querySelectorAll('.delivery-card');
            const columns = document.querySelectorAll('.delivery-column');

            function clearDeliveryDragState() {
                columns.forEach(col => col.classList.remove('drag-over', 'bg-vx-purple/10'));
                document.body.classList.remove('delivery-dragging');
                document.querySelectorAll('.delivery-card').forEach(card => {
                    card.classList.remove('dragging', 'is-pointer-dragging');
                });
            }

            function moveDeliveryToStatus(id, status) {
                const delivery = deliveries.find(d => d.id === id);
                if (delivery && delivery.status !== status) {
                    delivery.status = status;
                    saveData();
                    renderDeliveries();
                    showToast('Status da entrega atualizado', 'success');
                }
            }

            cards.forEach(card => {
                card.setAttribute('draggable', 'false');

                card.addEventListener('dragstart', (e) => {
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('delivery-id', card.dataset.id);
                    e.dataTransfer.setData('text/plain', card.dataset.id);
                });

                card.addEventListener('dragend', clearDeliveryDragState);

                card.addEventListener('pointerdown', (e) => {
                    if (e.target.closest('button, a, input, select, textarea')) return;
                    if (e.button !== undefined && e.button !== 0) return;

                    e.preventDefault();

                    e.preventDefault();

                    const startX = e.clientX;
                    const startY = e.clientY;
                    let moved = false;
                    let activeColumn = null;
                    let ghost = null;

                    card.classList.add('is-pointer-dragging');
                    document.body.classList.add('delivery-dragging');
                    try { card.setPointerCapture(e.pointerId); } catch (_) {}

                    const onMove = (moveEvent) => {
                        const dx = Math.abs(moveEvent.clientX - startX);
                        const dy = Math.abs(moveEvent.clientY - startY);
                        if (dx > 6 || dy > 6) {
                            moved = true;
                            if (!ghost) ghost = createDragGhost(card, moveEvent.clientX, moveEvent.clientY);
                        }

                        moveDragGhost(ghost, moveEvent.clientX, moveEvent.clientY);

                        const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
                        const column = el?.closest?.('.delivery-column');

                        if (column !== activeColumn) {
                            columns.forEach(col => col.classList.remove('drag-over', 'bg-vx-purple/10'));
                            activeColumn = column;
                            if (activeColumn) activeColumn.classList.add('drag-over', 'bg-vx-purple/10');
                        }
                    };

                    const onUp = (upEvent) => {
                        document.removeEventListener('pointermove', onMove);
                        document.removeEventListener('pointerup', onUp);
                        document.removeEventListener('pointercancel', onUp);

                        const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
                        const column = el?.closest?.('.delivery-column');
                        const id = card.dataset.id;

                        removeDragGhost(ghost);
                        clearDeliveryDragState();

                        if (moved && column && id) {
                            moveDeliveryToStatus(id, column.dataset.status);
                        }
                    };

                    document.addEventListener('pointermove', onMove);
                    document.addEventListener('pointerup', onUp);
                    document.addEventListener('pointercancel', onUp);
                });
            });

            columns.forEach(column => {
                column.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    column.classList.add('drag-over', 'bg-vx-purple/10');
                });

                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    column.classList.add('drag-over', 'bg-vx-purple/10');
                });

                column.addEventListener('dragleave', (e) => {
                    if (!column.contains(e.relatedTarget)) {
                        column.classList.remove('drag-over', 'bg-vx-purple/10');
                    }
                });

                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const id = e.dataTransfer.getData('delivery-id') || e.dataTransfer.getData('text/plain');
                    const status = column.dataset.status;

                    clearDeliveryDragState();
                    moveDeliveryToStatus(id, status);
                });
            });
        }

        // Client Performance functions
        function populateClientSelectById(selectId, selected = '') {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = '<option value="">Selecione</option>' + clients.map(c => `<option value="${safeText(c.id)}">${safeText(c.name)}</option>`).join('');
            if (selected) select.value = selected;
        }

        function openPerformanceModal(id = null) {
            populateClientSelectById('performance-client', document.getElementById('performance-client-filter')?.value || '');
            document.getElementById('performance-form').reset();
            document.getElementById('performance-id').value = '';
            document.getElementById('performance-modal-title').textContent = 'Lançar Métricas do Cliente';
            document.getElementById('performance-date').value = new Date().toISOString().split('T')[0];

            if (id) {
                const record = clientPerformance.find(r => r.id === id);
                if (record) {
                    document.getElementById('performance-modal-title').textContent = 'Editar Métricas do Cliente';
                    document.getElementById('performance-id').value = record.id;
                    populateClientSelectById('performance-client', record.clientId);
                    document.getElementById('performance-client').value = record.clientId || '';
                    document.getElementById('performance-date').value = record.date || new Date().toISOString().split('T')[0];
                    document.getElementById('performance-leads').value = record.leads || 0;
                    document.getElementById('performance-sales').value = record.sales || 0;
                    document.getElementById('performance-revenue').value = record.revenue ? formatNumberInput(record.revenue) : '';
                    document.getElementById('performance-investment').value = record.investment ? formatNumberInput(record.investment) : '';
                }
            }

            document.getElementById('performance-modal').classList.remove('hidden');
            document.getElementById('performance-modal').classList.add('flex');
        }

        function closePerformanceModal() {
            document.getElementById('performance-modal').classList.add('hidden');
            document.getElementById('performance-modal').classList.remove('flex');
        }

        async function deletePerformanceRecord(id) {
            const idString = String(id);
            const before = clientPerformance.length;

            try {
                await removeResource('performanceRecords', idString);
            } catch (error) {
                console.warn('Falha ao excluir performance na API. A remocao local sera apenas temporaria na sessao.', error);
            }

            clientPerformance = clientPerformance.filter(r => String(r.id) !== idString);

            if (clientPerformance.length === before) {
                showToast('Registro de performance não encontrado', 'error');
                return;
            }

            saveData();
            renderClientPerformance();
            renderDashboardCharts();
            renderExecutiveDashboard();
            showToast('Registro de performance excluído', 'success');
        }

        function getPerformanceTotals(clientId) {
            const records = clientPerformance.filter(r => r.clientId === clientId).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            const leadsGenerated = records.reduce((sum, r) => sum + (parseInt(r.leads || 0)), 0);
            const salesGenerated = records.reduce((sum, r) => sum + (parseInt(r.sales || 0)), 0);
            const revenueGenerated = records.reduce((sum, r) => sum + (parseFloat(r.revenue || 0)), 0);
            const investmentUsed = records.reduce((sum, r) => sum + (parseFloat(r.investment || 0)), 0);
            const conversion = leadsGenerated > 0 ? (salesGenerated / leadsGenerated) * 100 : 0;
            const roi = investmentUsed > 0 ? ((revenueGenerated - investmentUsed) / investmentUsed) * 100 : 0;
            return { leadsGenerated, salesGenerated, revenueGenerated, investmentUsed, conversion, roi, records };
        }

        function renderClientPerformance() {
            populateClientSelectById('performance-client-filter', document.getElementById('performance-client-filter')?.value || '');
            const selectedClientId = document.getElementById('performance-client-filter')?.value || clients[0]?.id || '';
            if (selectedClientId) document.getElementById('performance-client-filter').value = selectedClientId;

            const totals = getPerformanceTotals(selectedClientId);
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

            set('perf-leads', totals.leadsGenerated);
            set('perf-sales', totals.salesGenerated);
            set('perf-conversion', `${totals.conversion.toFixed(1)}%`);
            set('perf-roi', `${totals.roi.toFixed(1)}%`);
            set('perf-revenue', formatCurrency(totals.revenueGenerated));
            set('perf-investment', formatCurrency(totals.investmentUsed));

            const list = document.getElementById('performance-history');
            if (!list) return;
            if (!selectedClientId) {
                list.innerHTML = '<p class="text-vx-muted text-sm">Cadastre ou selecione um cliente.</p>';
                return;
            }
            if (!totals.records.length) {
                list.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma métrica lançada para este cliente.</p>';
                return;
            }

            list.innerHTML = totals.records.map(r => {
                const roi = (parseFloat(r.investment || 0) > 0) ? (((parseFloat(r.revenue || 0) - parseFloat(r.investment || 0)) / parseFloat(r.investment || 0)) * 100) : 0;
                return `
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <div class="grid grid-cols-2 md:grid-cols-6 gap-3">
                            <div><p class="text-vx-muted text-xs">Data</p><p class="font-bold">${formatDate(r.date)}</p></div>
                            <div><p class="text-vx-muted text-xs">Leads</p><p class="font-bold text-blue-400">${r.leads}</p></div>
                            <div><p class="text-vx-muted text-xs">Vendas</p><p class="font-bold text-vx-pink">${r.sales}</p></div>
                            <div><p class="text-vx-muted text-xs">Investimento</p><p class="font-bold text-red-400">${formatCurrency(r.investment || 0)}</p></div>
                            <div><p class="text-vx-muted text-xs">ROI</p><p class="font-bold gradient-text">${roi.toFixed(1)}%</p></div>
                            <div><p class="text-vx-muted text-xs">Faturamento</p><p class="font-bold text-yellow-400">${formatCurrency(r.revenue)}</p></div>
                        </div>
                        <div class="flex gap-2 mt-4">
                            <button type="button" data-performance-action="edit" data-performance-id="${safeText(r.id)}" class="px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                            <button type="button" data-performance-action="delete" data-performance-id="${safeText(r.id)}" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Real finance functions
        function openFinanceModal(id = null) {
            const form = document.getElementById('finance-form');
            form.reset();
            document.getElementById('finance-id').value = '';
            document.getElementById('finance-modal-title').textContent = 'Novo Lançamento Financeiro';
            document.getElementById('finance-due').value = new Date().toISOString().split('T')[0];

            if (id) {
                const entry = financeEntries.find(e => e.id === id);
                if (entry) {
                    document.getElementById('finance-modal-title').textContent = 'Editar Lançamento Financeiro';
                    document.getElementById('finance-id').value = entry.id;
                    document.getElementById('finance-type').value = entry.type || 'receita';
                    document.getElementById('finance-status').value = entry.status || 'pago';
                    document.getElementById('finance-description').value = entry.description || '';
                    document.getElementById('finance-value').value = formatNumberInput(entry.value || 0);
                    document.getElementById('finance-due').value = entry.due || new Date().toISOString().split('T')[0];
                    document.getElementById('finance-recurring').value = entry.recurring || 'nao';
                    document.getElementById('finance-auto').value = entry.auto || 'nao';
                }
            }

            document.getElementById('finance-modal').classList.remove('hidden');
            document.getElementById('finance-modal').classList.add('flex');
        }

        function closeFinanceModal() {
            document.getElementById('finance-modal').classList.add('hidden');
            document.getElementById('finance-modal').classList.remove('flex');
        }

        async function deleteFinanceEntry(id) {
            const idString = String(id);
            const before = financeEntries.length;

            try {
                await removeResource('financeEntries', idString);
            } catch (error) {
                console.warn('Falha ao excluir lancamento financeiro na API. A remocao local sera apenas temporaria na sessao.', error);
            }

            financeEntries = financeEntries.filter(e => String(e.id) !== idString);

            if (financeEntries.length === before) {
                showToast('Lançamento não encontrado', 'error');
                return;
            }

            saveData();
            renderRealFinance();
            renderExecutiveDashboard();
            showToast('Lançamento excluído', 'success');
        }

        function renderRealFinance() {
            const activeClients = clients.filter(c => c.phase === 'fechado');
            const recurringFromClients = activeClients.reduce((s,c)=>s+(parseFloat(c.value)||0),0);
            const recurringEntries = financeEntries.filter(e=>e.recurring==='sim' && e.type==='receita').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const revenueEntries = financeEntries.filter(e=>e.type==='receita').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const expenses = financeEntries.filter(e=>e.type==='despesa').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const commissions = financeEntries.filter(e=>e.type==='comissao').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const taxes = financeEntries.filter(e=>e.type==='imposto').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const overdue = financeEntries.filter(e=>e.status==='vencido').reduce((s,e)=>s+(parseFloat(e.value)||0),0);
            const autoBilling = financeEntries.filter(e=>e.auto==='sim').length;
            const revenue = recurringFromClients + revenueEntries + recurringEntries;
            const forecast = revenue + recurringFromClients;
            const netProfit = revenue - expenses - commissions - taxes;
            const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v};
            set('fin-recurring', formatCurrency(recurringFromClients + recurringEntries));
            set('fin-forecast', formatCurrency(forecast));
            set('fin-net-profit', formatCurrency(netProfit));
            set('fin-margin', `${margin.toFixed(1)}%`);
            set('fin-overdue', formatCurrency(overdue));
            set('fin-auto-billing', autoBilling);
            set('fin-commissions', formatCurrency(commissions));
            set('fin-taxes', formatCurrency(taxes));

            const dre = document.getElementById('dre-list');
            if (dre) {
                const rows = [
                    ['Receita Bruta', revenue],
                    ['(-) Despesas', -expenses],
                    ['(-) Comissões', -commissions],
                    ['(-) Impostos', -taxes],
                    ['Lucro Líquido', netProfit]
                ];
                dre.innerHTML = rows.map(([label,value]) => `
                    <div class="flex items-center justify-between bg-vx-darker rounded-xl border border-vx-border p-4">
                        <span class="text-vx-muted">${label}</span>
                        <span class="font-display font-bold ${value < 0 ? 'text-red-400' : label === 'Lucro Líquido' ? 'text-green-400' : 'text-white'}">${formatCurrency(value)}</span>
                    </div>
                `).join('');
            }

            const list = document.getElementById('finance-list');
            if (list) {
                if (!financeEntries.length) {
                    list.innerHTML = '<p class="text-vx-muted text-sm">Nenhum lançamento financeiro.</p>';
                    renderPagination('finance-pagination', financePage, 'changeFinancePage', 'lançamento');
                    return;
                }
                list.innerHTML = financeEntries.slice(-12).reverse().map(e => `
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div><p class="font-bold">${safeText(e.description)}</p><p class="text-vx-muted text-sm">${safeText(e.type)} • ${safeText(e.status)} • ${e.recurring==='sim'?'recorrente':'único'} • auto: ${safeText(e.auto)}</p></div>
                        <div class="flex items-center gap-3">
                            <p class="font-display text-lg font-bold ${e.type==='receita'?'text-green-400':'text-red-400'}">${formatCurrency(e.value)}</p>
                            <button type="button" data-finance-action="edit" data-finance-id="${safeText(e.id)}" class="px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                            <button type="button" data-finance-action="delete" data-finance-id="${safeText(e.id)}" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                        </div>
                    </div>
                `).join('');
                renderPagination('finance-pagination', financePage, 'changeFinancePage', 'lançamento');
            }
        }

        window.changeFinancePage = function changeFinancePage(pageNumber) {
            loadFinancePage(pageNumber);
        };
        // Commission and ranking functions
        function getCommercialMembers() {
            return teamMembers.filter(m => ['sdr', 'closer'].includes(m.role));
        }

        function populateCommissionMemberSelect(selectedId = '') {
            const select = document.getElementById('commission-member');
            if (!select) return;

            const members = getCommercialMembers();
            if (!members.length) {
                select.innerHTML = '<option value="">Cadastre SDRs ou Closers primeiro</option>';
                return;
            }

            select.innerHTML = members.map(m => `<option value="${safeText(m.id)}" ${m.id === selectedId ? 'selected' : ''}>${safeText(m.name)} • ${safeText(getTeamRoleLabel(m.role))}</option>`).join('');
        }

        function openCommissionModal(id = null) {
            const modal = document.getElementById('commission-modal');
            const form = document.getElementById('commission-form');
            form.reset();
            document.getElementById('commission-id').value = '';
            populateCommissionMemberSelect();

            if (id) {
                const sale = commissionSales.find(s => s.id === id);
                if (sale) {
                    document.getElementById('commission-id').value = sale.id;
                    populateCommissionMemberSelect(sale.memberId);
                    document.getElementById('commission-client').value = sale.client || '';
                    document.getElementById('commission-sale-value').value = formatNumberInput(sale.value || 0);
                    document.getElementById('commission-percent').value = sale.percent || 0;
                    document.getElementById('commission-goal').value = sale.goal || 0;
                }
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeCommissionModal() {
            document.getElementById('commission-modal').classList.add('hidden');
            document.getElementById('commission-modal').classList.remove('flex');
        }

        function deleteCommissionSale(id) {
            commissionSales = commissionSales.filter(s => s.id !== id);
            saveData();
            renderCommissions();
            renderRanking();
            showToast('Venda removida das comissões', 'success');
        }

        function getMemberCommissionStats(memberId) {
            const sales = commissionSales.filter(s => s.memberId === memberId);
            const totalRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.value || 0)), 0);
            const totalCommission = sales.reduce((sum, s) => sum + ((parseFloat(s.value || 0) * parseFloat(s.percent || 0)) / 100), 0);
            const goal = sales.length ? parseInt(sales[sales.length - 1].goal || 0) : 0;
            const goalProgress = goal > 0 ? Math.min((sales.length / goal) * 100, 100) : 0;
            return { sales, totalRevenue, totalCommission, goal, goalProgress };
        }

        function renderCommissions() {
            const membersList = document.getElementById('commission-members-list');
            const salesList = document.getElementById('commission-sales-list');
            if (!membersList || !salesList) return;

            const members = getCommercialMembers();
            const totalRevenue = commissionSales.reduce((sum, s) => sum + (parseFloat(s.value || 0)), 0);
            const totalCommission = commissionSales.reduce((sum, s) => sum + ((parseFloat(s.value || 0) * parseFloat(s.percent || 0)) / 100), 0);

            document.getElementById('commissions-total-sales').textContent = commissionSales.length;
            document.getElementById('commissions-total-revenue').textContent = formatCurrency(totalRevenue);
            document.getElementById('commissions-total-paid').textContent = formatCurrency(totalCommission);

            const avgGoal = members.length ? Math.round(members.reduce((sum, m) => sum + getMemberCommissionStats(m.id).goalProgress, 0) / members.length) : 0;
            document.getElementById('commissions-goal-average').textContent = `${avgGoal}%`;

            if (!members.length) {
                membersList.innerHTML = '<p class="text-vx-muted text-sm">Cadastre SDRs ou Closers na aba Equipe.</p>';
            } else {
                membersList.innerHTML = members.map(member => {
                    const stats = getMemberCommissionStats(member.id);
                    return `
                        <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <p class="font-bold">${safeText(member.name)}</p>
                                    <p class="text-vx-muted text-sm">${safeText(getTeamRoleLabel(member.role))}</p>
                                </div>
                                <span class="px-3 py-1 rounded-full bg-vx-purple/20 text-vx-pink text-xs">${stats.sales.length} vendas</span>
                            </div>
                            <div class="grid grid-cols-3 gap-3 mb-3">
                                <div><p class="text-xs text-vx-muted">Volume</p><p class="font-bold">${formatCurrency(stats.totalRevenue)}</p></div>
                                <div><p class="text-xs text-vx-muted">Comissão</p><p class="font-bold text-green-400">${formatCurrency(stats.totalCommission)}</p></div>
                                <div><p class="text-xs text-vx-muted">Meta</p><p class="font-bold">${stats.goalProgress.toFixed(0)}%</p></div>
                            </div>
                            <div class="h-2 bg-vx-border rounded-full overflow-hidden">
                                <div class="h-full progress-bar rounded-full" style="width:${stats.goalProgress}%"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            if (!commissionSales.length) {
                salesList.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma venda registrada.</p>';
            } else {
                salesList.innerHTML = commissionSales.slice().reverse().map(sale => {
                    const member = teamMembers.find(m => m.id === sale.memberId);
                    const commission = (parseFloat(sale.value || 0) * parseFloat(sale.percent || 0)) / 100;
                    return `
                        <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <p class="font-bold">${safeText(sale.client || 'Venda fechada')}</p>
                                    <p class="text-vx-muted text-sm">${member ? safeText(member.name) : 'Membro removido'} • ${safeText(sale.percent)}%</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-bold gradient-text">${formatCurrency(commission)}</p>
                                    <p class="text-xs text-vx-muted">${formatCurrency(sale.value)}</p>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-4">
                                <button onclick="openCommissionModal(decodeURIComponent('${safeId(sale.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                                <button onclick="deleteCommissionSale(decodeURIComponent('${safeId(sale.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        function getMemberXP(member) {
            const taskStats = typeof getMemberTaskStats === 'function' ? getMemberTaskStats(member) : { completed: parseInt(member.completed || 0), productivity: parseInt(member.performance || 0) };
            const commissionStats = getMemberCommissionStats(member.id);
            return (taskStats.completed * 80) + (parseInt(member.performance || taskStats.productivity || 0) * 20) + (commissionStats.sales.length * 250);
        }

        function getLevelFromXP(xp) {
            return Math.max(1, Math.floor(xp / 500) + 1);
        }

        function getBadgeFromXP(xp) {
            if (xp >= 6000) return 'Lenda VertX';
            if (xp >= 3500) return 'Elite';
            if (xp >= 1800) return 'Performance Pro';
            if (xp >= 800) return 'Em crescimento';
            return 'Iniciante';
        }

        function renderTopRole(role, elementId) {
            const container = document.getElementById(elementId);
            if (!container) return;

            const members = teamMembers.filter(m => m.role === role);
            if (!members.length) {
                container.textContent = '-';
                return;
            }

            const top = members.sort((a, b) => getMemberXP(b) - getMemberXP(a))[0];
            container.textContent = top.name;
        }

        function renderRanking() {
            const grid = document.getElementById('ranking-grid');
            if (!grid) return;

            renderTopRole('closer', 'ranking-top-closer');
            renderTopRole('sdr', 'ranking-top-sdr');
            renderTopRole('trafego', 'ranking-top-gestor');
            renderTopRole('marketing', 'ranking-top-designer');

            const ranked = [...teamMembers].sort((a, b) => getMemberXP(b) - getMemberXP(a));

            if (!ranked.length) {
                grid.innerHTML = '<p class="text-vx-muted text-sm">Nenhum membro cadastrado.</p>';
                return;
            }

            grid.innerHTML = ranked.map((member, index) => {
                const xp = getMemberXP(member);
                const level = getLevelFromXP(xp);
                const badge = getBadgeFromXP(xp);
                const taskStats = typeof getMemberTaskStats === 'function' ? getMemberTaskStats(member) : { productivity: parseInt(member.performance || 0) };
                const goal = member.goal || getMemberCommissionStats(member.id).goal || 0;
                const goalProgress = goal > 0 ? Math.min((getMemberCommissionStats(member.id).sales.length / goal) * 100, 100) : taskStats.productivity;

                return `
                    <div class="bg-vx-darker rounded-2xl border border-vx-border p-5 hover:border-vx-purple transition-all">
                        <div class="flex items-center justify-between mb-4">
                            <span class="w-10 h-10 rounded-xl bg-vx-purple/20 flex items-center justify-center font-bold gradient-text">#${index + 1}</span>
                            <span class="px-3 py-1 rounded-full bg-vx-purple/20 text-vx-pink text-xs">${safeText(badge)}</span>
                        </div>
                        <h3 class="font-display text-xl font-bold">${safeText(member.name)}</h3>
                        <p class="text-vx-muted text-sm mb-4">${safeText(getTeamRoleLabel(member.role))}</p>
                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">XP</p><p class="font-bold">${xp}</p></div>
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">Nível</p><p class="font-bold gradient-text">${level}</p></div>
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border"><p class="text-xs text-vx-muted">Meta</p><p class="font-bold">${goalProgress.toFixed(0)}%</p></div>
                        </div>
                        <div class="h-2 bg-vx-border rounded-full overflow-hidden">
                            <div class="h-full progress-bar rounded-full" style="width:${Math.min(taskStats.productivity, 100)}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Team management functions
        function getTeamRoleLabel(role) {
            const labels = {
                marketing: 'Marketing',
                trafego: 'Gestor de tráfego',
                sdr: 'SDR',
                closer: 'Closer',
                dev: 'Desenvolvedor'
            };
            return labels[role] || role;
        }

        function getTeamTaskTemplates(role) {
            const templates = {
                marketing: [
                    { id: 'conteudo_clientes', label: 'Produção de conteúdo para clientes' },
                    { id: 'conteudo_vertx', label: 'Produção de conteúdo para VertX Mídia' },
                    { id: 'criativos_ads', label: 'Desenvolvimento de criativos para anúncios' }
                ],
                trafego: [
                    { id: 'subir_campanha_cliente', label: 'Subir campanha Meta Ads ou Google Ads (cliente)' },
                    { id: 'otimizar_campanha_cliente', label: 'Otimizar campanha (cliente)' },
                    { id: 'subir_campanha_vertx', label: 'Subir campanha Meta Ads ou Google Ads (VertX)' },
                    { id: 'otimizar_campanha_vertx', label: 'Otimizar campanha (VertX)' }
                ],
                sdr: [
                    { id: 'cold_calls', label: 'Cold calls para fazer' },
                    { id: 'mensagens', label: 'Mensagens para enviar' }
                ],
                closer: [
                    { id: 'reunioes', label: 'Reuniões para fazer' }
                ],
                dev: [
                    { id: 'projetos_realizar_cliente', label: 'Projetos para realizar (Cliente)' },
                    { id: 'projetos_finalizar_cliente', label: 'Projetos para finalizar (Cliente)' },
                    { id: 'projetos_realizar_vertx', label: 'Projetos para realizar (VertX)' },
                    { id: 'projetos_finalizar_vertx', label: 'Projetos para finalizar (VertX)' }
                ]
            };

            return templates[role] || templates.marketing;
        }

        function normalizeMemberTasks(member) {
            if (member.taskBreakdown) return member.taskBreakdown;

            // Compatibilidade com membros antigos que tinham apenas tarefas/concluídas gerais.
            const role = member.role || 'marketing';
            const template = getTeamTaskTemplates(role)[0];
            return {
                [template.id]: {
                    assigned: parseInt(member.tasks || 0),
                    completed: parseInt(member.completed || 0)
                }
            };
        }

        function getMemberTaskStats(member) {
            const breakdown = normalizeMemberTasks(member);
            const totals = Object.values(breakdown).reduce((acc, item) => {
                acc.assigned += parseInt(item.assigned || 0);
                acc.completed += parseInt(item.completed || 0);
                return acc;
            }, { assigned: 0, completed: 0 });

            totals.productivity = totals.assigned > 0 ? Math.round((totals.completed / totals.assigned) * 100) : 0;
            return totals;
        }

        function renderTeamTaskFields(role, breakdown = {}) {
            const container = document.getElementById('team-role-task-fields');
            if (!container) return;

            const templates = getTeamTaskTemplates(role || document.getElementById('team-member-role')?.value || 'marketing');

            container.innerHTML = templates.map(task => {
                const current = breakdown[task.id] || {};
                return `
                    <div class="bg-vx-card rounded-xl border border-vx-border p-4">
                        <p class="font-medium text-sm mb-3">${task.label}</p>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-vx-muted mb-1">Atribuídas</label>
                                <input type="number" min="0" data-task-id="${task.id}" data-task-type="assigned" value="${current.assigned || 0}" class="team-task-input w-full bg-vx-darker border border-vx-border rounded-lg px-3 py-2 text-sm input-focus">
                            </div>
                            <div>
                                <label class="block text-xs text-vx-muted mb-1">Concluídas</label>
                                <input type="number" min="0" data-task-id="${task.id}" data-task-type="completed" value="${current.completed || 0}" class="team-task-input w-full bg-vx-darker border border-vx-border rounded-lg px-3 py-2 text-sm input-focus">
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function collectTeamTaskBreakdown() {
            const breakdown = {};
            document.querySelectorAll('.team-task-input').forEach(input => {
                const taskId = input.dataset.taskId;
                const type = input.dataset.taskType;
                if (!breakdown[taskId]) breakdown[taskId] = { assigned: 0, completed: 0 };
                breakdown[taskId][type] = parseInt(input.value || 0) || 0;
            });
            return breakdown;
        }

        function renderMemberTaskSummary(member) {
            const breakdown = normalizeMemberTasks(member);
            const templates = getTeamTaskTemplates(member.role || 'marketing');

            return templates.map(task => {
                const current = breakdown[task.id] || { assigned: 0, completed: 0 };
                const assigned = parseInt(current.assigned || 0);
                const completed = parseInt(current.completed || 0);
                const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

                return `
                    <div class="bg-vx-card rounded-xl border border-vx-border p-3">
                        <div class="flex items-start justify-between gap-3">
                            <p class="text-xs text-vx-muted">${task.label}</p>
                            <span class="text-xs font-bold text-vx-pink">${pct}%</span>
                        </div>
                        <p class="font-display text-sm font-bold mt-2">${completed}/${assigned} concluídas</p>
                    </div>
                `;
            }).join('');
        }

        function openTeamMemberModal(id = null) {
            const modal = document.getElementById('team-member-modal');
            const form = document.getElementById('team-member-form');
            const title = document.getElementById('team-member-modal-title');
            form.reset();
            document.getElementById('team-member-id').value = '';
            renderTeamTaskFields(document.getElementById('team-member-role')?.value || 'marketing');

            if (id) {
                const member = teamMembers.find(m => m.id === id);
                if (member) {
                    title.textContent = 'Editar Membro';
                    document.getElementById('team-member-id').value = member.id;
                    document.getElementById('team-member-name').value = member.name || '';
                    document.getElementById('team-member-role').value = member.role || 'marketing';
                    renderTeamTaskFields(member.role || 'marketing', normalizeMemberTasks(member));
                    document.getElementById('team-member-performance').value = member.performance || '';
                    document.getElementById('team-member-notes').value = member.notes || '';
                }
            } else {
                title.textContent = 'Novo Membro';
                renderTeamTaskFields(document.getElementById('team-member-role')?.value || 'marketing');
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeTeamMemberModal() {
            document.getElementById('team-member-modal').classList.add('hidden');
            document.getElementById('team-member-modal').classList.remove('flex');
        }

        async function deleteTeamMember(id) {
            if (confirm('Deseja excluir este membro da equipe?')) {
                try {
                    await removeResource('teamMembers', id);
                } catch (error) {
                    console.warn('Falha ao excluir membro na API. Removendo localmente.', error);
                }
                teamMembers = teamMembers.filter(m => m.id !== id);
                saveData();
                renderTeam();
                renderExecutiveDashboard();
                showToast('Membro excluído', 'success');
            }
        }

        function drawTeamAreaBarChart(canvasId, labels, firstValues, secondValues) {
            const canvas = document.getElementById(canvasId);
            const setup = setupCanvas(canvas);
            if (!setup) return;

            const { ctx, width, height } = setup;
            clearCanvas(ctx, canvas);

            const theme = getChartTheme();
            const padding = { top: 24, right: 18, bottom: 48, left: 42 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;
            const maxValue = Math.max(...firstValues, ...secondValues, 0);

            if (!labels.length || maxValue === 0) {
                drawEmptyChart(ctx, width, height, 'Sem dados nessa área');
                return;
            }

            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            const groupGap = Math.max(10, chartW / labels.length * 0.2);
            const groupW = (chartW - groupGap * (labels.length - 1)) / labels.length;
            const barW = Math.max(10, groupW / 2.7);

            labels.forEach((label, i) => {
                const x = padding.left + i * (groupW + groupGap);
                const h1 = (firstValues[i] / maxValue) * chartH;
                const h2 = (secondValues[i] / maxValue) * chartH;

                ctx.fillStyle = theme.purple;
                ctx.beginPath();
                ctx.roundRect(x, padding.top + chartH - h1, barW, h1, 5);
                ctx.fill();

                ctx.fillStyle = theme.pink;
                ctx.beginPath();
                ctx.roundRect(x + barW + 4, padding.top + chartH - h2, barW, h2, 5);
                ctx.fill();

                ctx.fillStyle = theme.text;
                ctx.font = '500 10px SF Pro Display, sans-serif';
                ctx.textAlign = 'center';
                const shortLabel = label.length > 10 ? label.slice(0, 10) + '…' : label;
                ctx.fillText(shortLabel, x + groupW / 2, height - 16);
            });

            ctx.font = '600 12px SF Pro Display, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = theme.purple;
            ctx.fillText('Tarefas', padding.left, 14);
            ctx.fillStyle = theme.pink;
            ctx.fillText('Concluídas', padding.left + 72, 14);
        }

        function drawTeamProductivityChart(canvasId, labels, values) {
            const canvas = document.getElementById(canvasId);
            const setup = setupCanvas(canvas);
            if (!setup) return;

            const { ctx, width, height } = setup;
            clearCanvas(ctx, canvas);

            const theme = getChartTheme();
            const padding = { top: 24, right: 24, bottom: 48, left: 42 };
            const chartW = width - padding.left - padding.right;
            const chartH = height - padding.top - padding.bottom;

            if (!labels.length) {
                drawEmptyChart(ctx, width, height, 'Sem dados nessa área');
                return;
            }

            ctx.strokeStyle = theme.grid;
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();

                ctx.fillStyle = theme.text;
                ctx.font = '500 10px SF Pro Display, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(`${100 - i * 25}%`, padding.left - 8, y + 4);
            }

            const gap = Math.max(8, chartW / labels.length * 0.25);
            const barW = Math.max(14, (chartW - gap * (labels.length - 1)) / labels.length);

            values.forEach((value, i) => {
                const safeValue = Math.max(0, Math.min(100, value));
                const x = padding.left + i * (barW + gap);
                const barH = (safeValue / 100) * chartH;
                const y = padding.top + chartH - barH;

                const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
                gradient.addColorStop(0, theme.pink);
                gradient.addColorStop(1, theme.purple);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barW, barH, 6);
                ctx.fill();

                ctx.fillStyle = '#ffffff';
                ctx.font = '700 11px SF Pro Display, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${safeValue}%`, x + barW / 2, Math.max(y - 6, 14));

                ctx.fillStyle = theme.text;
                ctx.font = '500 10px SF Pro Display, sans-serif';
                const shortLabel = labels[i].length > 10 ? labels[i].slice(0, 10) + '…' : labels[i];
                ctx.fillText(shortLabel, x + barW / 2, height - 16);
            });
        }

        function renderTeamCharts(members, selectedRole) {
            const title = selectedRole ? getTeamRoleLabel(selectedRole) : 'Toda a equipe';
            const label1 = document.getElementById('team-chart-tasks-label');
            const label2 = document.getElementById('team-chart-productivity-label');

            if (label1) label1.textContent = `Tarefas e entregas concluídas — ${title}`;
            if (label2) label2.textContent = `Produtividade individual — ${title}`;

            const labels = members.map(m => m.name || 'Membro');
            const taskValues = members.map(m => getMemberTaskStats(m).assigned);
            const completedValues = members.map(m => getMemberTaskStats(m).completed);
            const productivityValues = members.map(m => {
                const stats = getMemberTaskStats(m);
                return parseInt(m.performance || stats.productivity || 0);
            });

            drawTeamAreaBarChart('team-tasks-chart', labels, taskValues, completedValues);
            drawTeamProductivityChart('team-productivity-chart', labels, productivityValues);
        }

        function renderTeam() {
            const total = teamMembers.length;
            const tasks = teamMembers.reduce((sum, m) => sum + getMemberTaskStats(m).assigned, 0);
            const completed = teamMembers.reduce((sum, m) => sum + getMemberTaskStats(m).completed, 0);
            const avgProductivity = tasks > 0 ? Math.round((completed / tasks) * 100) : 0;

            const selectedRole = document.getElementById('team-role-filter')?.value || '';
            const visibleMembers = selectedRole ? teamMembers.filter(m => m.role === selectedRole) : teamMembers;

            setTimeout(() => renderTeamCharts(visibleMembers, selectedRole), 60);

            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };

            setText('team-total', total);
            setText('team-tasks', tasks);
            setText('team-completed', completed);
            setText('team-productivity', `${avgProductivity}%`);
            setText('team-role-marketing', teamMembers.filter(m => m.role === 'marketing').length);
            setText('team-role-trafego', teamMembers.filter(m => m.role === 'trafego').length);
            setText('team-role-sdr', teamMembers.filter(m => m.role === 'sdr').length);
            setText('team-role-closer', teamMembers.filter(m => m.role === 'closer').length);
            setText('team-role-dev', teamMembers.filter(m => m.role === 'dev').length);

            const filterLabel = document.getElementById('team-filter-label');
            if (filterLabel) {
                filterLabel.textContent = selectedRole
                    ? `Visualizando: ${getTeamRoleLabel(selectedRole)} (${visibleMembers.length} membro${visibleMembers.length === 1 ? '' : 's'})`
                    : `Todos os membros da equipe (${teamMembers.length})`;
            }

            document.querySelectorAll('.team-role-card').forEach(card => {
                card.classList.remove('border-vx-purple', 'bg-vx-purple/10');
                if (selectedRole && card.dataset.role === selectedRole) {
                    card.classList.add('border-vx-purple', 'bg-vx-purple/10');
                }
            });

            const list = document.getElementById('team-list');
            if (!list) return;
            const canManageTeam = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');

            if (!teamMembers.length) {
                list.innerHTML = '<div class="empty-state xl:col-span-2"><h4>Nenhum membro cadastrado</h4><p>Cadastre a equipe para acompanhar tarefas, produtividade e responsabilidades.</p></div>';
                renderPagination('team-pagination', teamPage, 'changeTeamPage', 'membro');
                return;
            }

            if (!visibleMembers.length) {
                list.innerHTML = '<div class="empty-state xl:col-span-2"><h4>Nenhum membro encontrado</h4><p>Ajuste os filtros para visualizar outra área da equipe.</p></div>';
                renderPagination('team-pagination', teamPage, 'changeTeamPage', 'membro');
                return;
            }

            list.innerHTML = visibleMembers.map(member => {
                const stats = getMemberTaskStats(member);
                const tasks = stats.assigned;
                const completed = stats.completed;
                const productivity = stats.productivity;
                const performance = parseInt(member.performance || productivity || 0);
                return `
                    <div class="bg-vx-darker rounded-2xl border border-vx-border p-5">
                        <div class="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h4 class="font-display text-xl font-bold">${safeText(member.name)}</h4>
                                <p class="text-vx-muted text-sm">${safeText(getTeamRoleLabel(member.role))}</p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs bg-vx-purple/20 text-vx-pink">${performance}% performance</span>
                        </div>

                        <div class="grid grid-cols-3 gap-3 mb-4">
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border">
                                <p class="text-vx-muted text-xs">Tarefas</p>
                                <p class="font-display text-xl font-bold">${tasks}</p>
                            </div>
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border">
                                <p class="text-vx-muted text-xs">Concluídas</p>
                                <p class="font-display text-xl font-bold text-green-400">${completed}</p>
                            </div>
                            <div class="bg-vx-card rounded-xl p-3 border border-vx-border">
                                <p class="text-vx-muted text-xs">Produtividade</p>
                                <p class="font-display text-xl font-bold">${productivity}%</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                            ${renderMemberTaskSummary(member)}
                        </div>

                        <div class="h-2 bg-vx-border rounded-full overflow-hidden mb-4">
                            <div class="h-full progress-bar rounded-full" style="width:${Math.min(performance, 100)}%"></div>
                        </div>

                        ${member.notes ? `<p class="text-vx-muted text-sm mb-4">${safeText(member.notes)}</p>` : ''}

                        ${canManageTeam ? `<div class="flex gap-2">
                            <button onclick="openTeamMemberModal(decodeURIComponent('${safeId(member.id)}'))" class="flex-1 px-3 py-2 rounded-lg border border-vx-border hover:bg-vx-card text-xs">Editar</button>
                            <button onclick="deleteTeamMember(decodeURIComponent('${safeId(member.id)}'))" class="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">Excluir</button>
                        </div>` : ''}
                    </div>
                `;
            }).join('');
            renderPagination('team-pagination', teamPage, 'changeTeamPage', 'membro');
        }

        window.changeTeamPage = function changeTeamPage(pageNumber) {
            loadTeamPage(pageNumber);
        };

                function updateExecutiveMargin() {
            const input = document.getElementById('exec-profit-margin-input');
            const value = Math.max(0, Math.min(100, parseFloat(input?.value || 0) || 0));

            executiveSettings.profitMargin = value;

            renderExecutiveDashboard();

            showToast('Margem de lucro atualizada automaticamente no executivo', 'success');
        }

        
        function syncExecutiveMarginFromFinance() {
            const paidRevenue = financeEntries
                .filter(e => e.type === 'receita' && e.status === 'pago')
                .reduce((sum, e) => sum + parseFloat(e.value || 0), 0);

            const paidExpenses = financeEntries
                .filter(e => e.type === 'despesa' && e.status === 'pago')
                .reduce((sum, e) => sum + parseFloat(e.value || 0), 0);

            if (paidRevenue <= 0) return;

            const calculatedProfit = paidRevenue - paidExpenses;
            const calculatedMargin = Math.max(0, Math.min(100, (calculatedProfit / paidRevenue) * 100));

            executiveSettings.profitMargin = Number(calculatedMargin.toFixed(1));
        }

function renderExecutiveDashboard() {
            const activeClients = clients.filter(c => c.phase === 'fechado');
            const totalRevenue = activeClients.reduce((sum, c) => sum + (parseFloat(c.value || 0) * parseInt(c.months || 1)), 0);
            const currentMonthRevenue = events.filter(e => typeof isClosedSale === 'function' ? isClosedSale(e) : e.sale === 'sim').reduce((sum, e) => sum + (parseFloat(e.revenue || 0) || 0), 0);
            const profitMargin = parseFloat(executiveSettings.profitMargin ?? 45);
            const profit = totalRevenue * (profitMargin / 100);
            const estimatedCost = Math.max(totalRevenue - profit, 0);
            const roi = estimatedCost > 0 ? ((profit / estimatedCost) * 100) : 0;
            const activeContracts = contracts.filter(c => c.status === 'ativo').length;
            const canceledContracts = contracts.filter(c => c.status === 'encerrado').length;
            const totalContracts = contracts.length || activeClients.length || 1;
            const retention = Math.round((activeContracts / totalContracts) * 100);
            const churn = Math.max(0, Math.round((canceledContracts / totalContracts) * 100));
            const activeContractsList = contracts.filter(c => c.status === 'ativo');
            const mrr = activeContractsList.length
                ? activeContractsList.reduce((sum, c) => sum + getClientValue(c.clientId), 0)
                : activeClients.reduce((sum, c) => sum + (parseFloat(c.value || 0)), 0);

            const paidFinanceRevenue = financeEntries.filter(e => e.type === 'receita' && e.status === 'pago').reduce((sum, e) => sum + (parseFloat(e.value || 0)), 0);
            const performanceRevenue = clientPerformance.reduce((sum, p) => sum + (parseFloat(p.revenue || 0)), 0);
            const performanceInvestment = clientPerformance.reduce((sum, p) => sum + (parseFloat(p.investment || 0)), 0);
            const closedSalesCount = events.filter(e => typeof isClosedSale === 'function' ? isClosedSale(e) : e.sale === 'sim').length;
            const newClientsCount = Math.max(activeClients.length, closedSalesCount, 1);

            
            const pipelineFinancial = clients
                .filter(client => client.phase !== 'perdido' && client.phase !== 'fechado')
                .map(client => {
                    const probability = getPipelineProbability(client.phase);
                    const value = parseFloat(client.value || 0);
                    const predicted = value * (probability / 100);

                    return {
                        ...client,
                        probability,
                        predicted
                    };
                });

            const intelligentPipelineForecast = pipelineFinancial.reduce(
                (sum, client) => sum + client.predicted,
                0
            );

            const revenueForecast = Math.max(
                currentMonthRevenue,
                paidFinanceRevenue,
                performanceRevenue,
                mrr
            ) + intelligentPipelineForecast;

            
            
            
            const averageMonthlyTicket = activeClients.length ? mrr / activeClients.length : 0;
            

            const profitableClients = activeClients.map(client => {
                const perf = clientPerformance.filter(p => p.clientId === client.id);
                const perfRevenue = perf.reduce((sum, p) => sum + (parseFloat(p.revenue || 0)), 0);
                const perfInvestment = perf.reduce((sum, p) => sum + (parseFloat(p.investment || 0)), 0);
                const baseRevenue = parseFloat(client.value || 0) * parseInt(client.months || 1);
                const revenue = perfRevenue || baseRevenue;
                const estimatedProfit = (revenue - perfInvestment) * (profitMargin / 100);
                return { name: client.name, revenue, profit: estimatedProfit };
            }).sort((a, b) => b.profit - a.profit);

            const mostProfitableClient = profitableClients[0];

            const projection = currentMonthRevenue > 0 ? currentMonthRevenue * 1.25 : totalRevenue / 3;
            const goalProgress = currentGoal?.target ? Math.round((totalRevenue / currentGoal.target) * 100) : 0;
            const growth = totalRevenue > 0 ? Math.min(100, Math.round((currentMonthRevenue / totalRevenue) * 100)) : 0;

            const setText = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };

            setText('exec-total-revenue', formatCurrency(totalRevenue));
            setText('exec-profit', formatCurrency(profit));
            setText('exec-roi', `${roi.toFixed(1)}%`);
            setText('exec-projection', formatCurrency(projection));
            setText('exec-retention', `${retention}%`);
            setText('exec-churn', `${churn}%`);
            setText('exec-team', teamMembers.length);
            setText('exec-growth', `${growth}%`);
            setText('exec-revenue-forecast', formatCurrency(revenueForecast));
            
            setText('exec-mrr', formatCurrency(mrr));
            
            
            
            setText('exec-most-profitable-client', mostProfitableClient ? mostProfitableClient.name : '-');
            const marginInput = document.getElementById('exec-profit-margin-input');
            if (marginInput) marginInput.value = profitMargin;
            setText('exec-margin-label', `Margem automática: ${profitMargin}%`);

            const bars = document.getElementById('exec-bars');
            if (bars) {
                const items = [
                    { label: 'Meta de faturamento', value: goalProgress, text: `${goalProgress}% da meta`, color: 'progress-bar' },
                    { label: 'Retenção', value: retention, text: `${retention}%`, color: 'bg-green-500' },
                    { label: 'Produtividade da equipe', value: getTeamProductivity(), text: `${getTeamProductivity()}%`, color: 'progress-bar' },
                    { label: 'Crescimento mensal', value: growth, text: `${growth}%`, color: 'bg-blue-500' }
                ];

                bars.innerHTML = items.map(item => `
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-vx-muted text-sm">${item.label}</span>
                            <span class="font-display font-bold">${item.text}</span>
                        </div>
                        <div class="h-3 bg-vx-border rounded-full overflow-hidden">
                            <div class="h-full ${item.color} rounded-full" style="width:${Math.min(item.value, 100)}%"></div>
                        </div>
                    </div>
                `).join('');
            }

            const summary = document.getElementById('exec-summary');
            if (summary) {
                summary.innerHTML = `
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <p class="text-vx-muted text-sm">Clientes ativos</p>
                        <p class="font-display text-2xl font-bold">${activeClients.length}</p>
                    </div>
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <p class="text-vx-muted text-sm">Meta atual</p>
                        <p class="font-display text-2xl font-bold">${formatCurrency(currentGoal.target || 0)}</p>
                    </div>
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <p class="text-vx-muted text-sm">Receita via agenda</p>
                        <p class="font-display text-2xl font-bold text-yellow-400">${formatCurrency(currentMonthRevenue)}</p>
                    </div>
                    <div class="bg-vx-darker rounded-xl border border-vx-border p-4">
                        <p class="text-vx-muted text-sm">Status geral</p>
                        <p class="font-display text-lg font-bold ${retention >= 80 ? 'text-green-400' : 'text-yellow-400'}">${retention >= 80 ? 'Operação saudável' : 'Atenção na retenção'}</p>
                    </div>
                `;
            }

            
            const pipelineContainer = document.getElementById('pipeline-financial-list');
            const pipelineTotal = document.getElementById('pipeline-prediction-total');

            if (pipelineTotal) {
                pipelineTotal.textContent = formatCurrency(intelligentPipelineForecast);
            }

            if (pipelineContainer) {
                if (!pipelineFinancial.length) {
                    pipelineContainer.innerHTML = '<p class="text-vx-muted text-sm">Nenhum cliente no pipeline comercial.</p>';
                } else {
                    pipelineContainer.innerHTML = pipelineFinancial.map(client => `
                        <div class="bg-vx-darker rounded-xl border border-vx-border p-5 hover:border-vx-purple transition-all">
                            <div class="flex items-start justify-between gap-4">
                                <div>
                                    <p class="font-bold text-lg">${safeText(client.name)}</p>
                                    <p class="text-sm text-vx-muted mt-1">
                                        ${safeText(getPhaseLabel(client.phase))} • ${safeText(client.probability)}% de chance
                                    </p>
                                </div>

                                <div class="text-right">
                                    <p class="font-display text-lg font-bold text-white">
                                        ${formatCurrency(client.value || 0)}
                                    </p>
                                </div>
                            </div>

                            <div class="mt-4">
                                <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        class="h-full rounded-full bg-gradient-to-r from-vx-purple to-vx-pink"
                                        style="width:${client.probability}%">
                                    </div>
                                </div>

                                <div class="flex items-center justify-between mt-3">
                                    <span class="text-xs text-vx-muted">Previsão estimada</span>

                                    <span class="text-sm font-bold gradient-text">
                                        ${formatCurrency(client.predicted || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }

const profitableContainer = document.getElementById('exec-profitable-clients');
            if (profitableContainer) {
                if (!profitableClients.length) {
                    profitableContainer.innerHTML = '<p class="text-vx-muted text-sm">Nenhum cliente fechado ainda.</p>';
                } else {
                    profitableContainer.innerHTML = profitableClients.slice(0, 5).map((client, index) => `
                        <div class="bg-vx-darker rounded-xl border border-vx-border p-4 flex items-center justify-between gap-3">
                            <div>
                                <p class="font-bold">#${index + 1} ${safeText(client.name)}</p>
                                <p class="text-xs text-vx-muted">Receita: ${formatCurrency(client.revenue)}</p>
                            </div>
                            <p class="font-display font-bold text-green-400">${formatCurrency(client.profit)}</p>
                        </div>
                    `).join('');
                }
            }
        }

        function getTeamProductivity() {
            const tasks = teamMembers.reduce((sum, m) => sum + getMemberTaskStats(m).assigned, 0);
            const completed = teamMembers.reduce((sum, m) => sum + getMemberTaskStats(m).completed, 0);
            return tasks > 0 ? Math.round((completed / tasks) * 100) : 0;
        }

        // Client dashboard functions
        function getClientDashboardData(clientId) {
            if (!clientDashboards[clientId]) {
                clientDashboards[clientId] = {
                    services: '',
                    nextSteps: '',
                    history: '',
                    files: '',
                    updatedAt: new Date().toISOString()
                };
            }
            return clientDashboards[clientId];
        }

        function openClientDashboard(clientId) {
            const client = clients.find(c => c.id === clientId);
            if (!client) {
                showToast('Cliente não encontrado', 'error');
                return;
            }

            const data = getClientDashboardData(clientId);
            const modal = document.getElementById('client-dashboard-modal');
            const today = new Date();
            const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

            const clientDeliveries = deliveries.filter(d => d.clientId === clientId && (d.deadline || '').startsWith(monthPrefix));
            const pendingDeliveries = deliveries.filter(d => d.clientId === clientId && d.status !== 'aprovado');
            const doneMeetings = events.filter(e => e.clientId === clientId && (e.status || 'agendada') === 'executada');
            const clientContracts = contracts.filter(c => c.clientId === clientId);
            const activeContract = clientContracts.find(c => c.status === 'ativo') || clientContracts[0];

            document.getElementById('client-dashboard-id').value = clientId;
            document.getElementById('client-dashboard-name').textContent = client.name;
            document.getElementById('client-dashboard-monthly-value').textContent = formatCurrency(client.value || 0);
            document.getElementById('client-dashboard-month-deliveries').textContent = clientDeliveries.length;
            document.getElementById('client-dashboard-pending').textContent = pendingDeliveries.length;
            document.getElementById('client-dashboard-meetings').textContent = doneMeetings.length;
            document.getElementById('client-dashboard-services').value = data.services || '';
            document.getElementById('client-dashboard-next-steps').value = data.nextSteps || '';
            document.getElementById('client-dashboard-history').value = data.history || '';
            document.getElementById('client-dashboard-files').value = data.files || '';

            const statusEl = document.getElementById('client-dashboard-status');
            if (activeContract) {
                statusEl.textContent = `${activeContract.plan} • ${activeContract.status}`;
                statusEl.className = `px-3 py-1 rounded-full text-xs ${activeContract.status === 'ativo' ? 'bg-green-500/20 text-green-400' : activeContract.status === 'pausado' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`;
            } else {
                statusEl.textContent = getPhaseLabel(client.phase);
                statusEl.className = `px-3 py-1 rounded-full text-xs ${getPhaseClass(client.phase)}`;
            }

            renderClientDashboardDeliveries(clientDeliveries);
            renderClientDashboardMeetings(doneMeetings);

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeClientDashboard() {
            document.getElementById('client-dashboard-modal').classList.add('hidden');
            document.getElementById('client-dashboard-modal').classList.remove('flex');
        }

        function saveClientDashboard() {
            const clientId = document.getElementById('client-dashboard-id').value;
            if (!clientId) return;

            clientDashboards[clientId] = {
                services: document.getElementById('client-dashboard-services').value,
                nextSteps: document.getElementById('client-dashboard-next-steps').value,
                history: document.getElementById('client-dashboard-history').value,
                files: document.getElementById('client-dashboard-files').value,
                updatedAt: new Date().toISOString()
            };

            saveData();
            showToast('Dashboard do cliente salvo', 'success');
        }

        function renderClientDashboardDeliveries(items) {
            const container = document.getElementById('client-dashboard-deliveries-list');
            if (!items.length) {
                container.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma entrega no mês</p>';
                return;
            }

            container.innerHTML = items.map(item => {
                const statusClass = item.status === 'aprovado' ? 'bg-green-500/20 text-green-400' : item.status === 'producao' ? 'bg-blue-500/20 text-blue-400' : item.status === 'revisao' ? 'bg-vx-purple/20 text-vx-pink' : 'bg-yellow-500/20 text-yellow-400';
                return `
                    <div class="bg-vx-card rounded-xl border border-vx-border p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="font-medium">${safeText(item.title)}</p>
                                <p class="text-xs text-vx-muted mt-1">${safeText(getDeliveryTypeLabel(item.type))} • Resp: ${safeText(item.owner || '-')}</p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs ${statusClass}">${safeText(getDeliveryStatusLabel(item.status))}</span>
                        </div>
                        <p class="text-xs text-vx-muted mt-3">Prazo: ${formatDate(item.deadline)}</p>
                    </div>
                `;
            }).join('');
        }

        function renderClientDashboardMeetings(items) {
            const container = document.getElementById('client-dashboard-meetings-list');
            if (!items.length) {
                container.innerHTML = '<p class="text-vx-muted text-sm">Nenhuma reunião executada</p>';
                return;
            }

            container.innerHTML = items.slice(-8).reverse().map(item => {
                const closed = isClosedSale(item);
                const revenue = parseFloat(item.revenue || 0) || 0;
                return `
                    <div class="bg-vx-card rounded-xl border border-vx-border p-4">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <p class="font-medium">${safeText(item.title)}</p>
                                <p class="text-xs text-vx-muted mt-1">${formatDate(item.date)} ${safeText(item.time || '')}</p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs ${closed ? 'bg-green-500/20 text-green-400' : 'bg-vx-border text-vx-muted'}">${closed ? 'Fechou' : 'Executada'}</span>
                        </div>
                        ${closed ? `<p class="text-yellow-400 font-bold text-sm mt-3">${formatCurrency(revenue)}</p>` : ''}
                    </div>
                `;
            }).join('');
        }


        // Agency goal functions
        function openAgencyGoalsModal() {
            document.getElementById('agency-goal-revenue').value = formatNumberInput(agencyGoals.revenue);
            document.getElementById('agency-goal-new-clients').value = agencyGoals.newClients;
            document.getElementById('agency-goal-ticket').value = formatNumberInput(agencyGoals.averageTicket);
            document.getElementById('agency-goal-retention').value = agencyGoals.retention;
            document.getElementById('agency-goal-proposals').value = agencyGoals.proposals;
            document.getElementById('agency-goal-meetings').value = agencyGoals.meetings;
            document.getElementById('agency-goals-modal').classList.remove('hidden');
            document.getElementById('agency-goals-modal').classList.add('flex');
        }

        function closeAgencyGoalsModal() {
            document.getElementById('agency-goals-modal').classList.add('hidden');
            document.getElementById('agency-goals-modal').classList.remove('flex');
        }

        function renderAgencyGoals() {
            const grid = document.getElementById('agency-goals-grid');
            if (!grid) return;

            const activeClients = clients.filter(c => c.phase === 'fechado');
            const monthlyRevenue = activeClients.reduce((sum, c) => sum + (parseFloat(c.value) * parseInt(c.months)), 0);
            const averageTicket = activeClients.length ? monthlyRevenue / activeClients.length : 0;
            const current = {
                revenue: monthlyRevenue,
                newClients: activeClients.length,
                averageTicket,
                retention: contracts.length ? Math.round((contracts.filter(c => c.status === 'ativo').length / contracts.length) * 100) : 0,
                proposals: clients.filter(c => c.phase === 'negociacao').length,
                meetings: events.length
            };

            const items = [
                { label: 'Faturamento', current: current.revenue, target: agencyGoals.revenue, money: true },
                { label: 'Novos Clientes', current: current.newClients, target: agencyGoals.newClients },
                { label: 'Ticket Médio', current: current.averageTicket, target: agencyGoals.averageTicket, money: true },
                { label: 'Retenção', current: current.retention, target: agencyGoals.retention, suffix: '%' },
                { label: 'Propostas Enviadas', current: current.proposals, target: agencyGoals.proposals },
                { label: 'Reuniões Marcadas', current: current.meetings, target: agencyGoals.meetings }
            ];

            grid.innerHTML = items.map(item => {
                const percent = item.target > 0 ? Math.min((item.current / item.target) * 100, 100) : 0;
                const currentText = item.money ? formatCurrency(item.current) : `${Math.round(item.current)}${item.suffix || ''}`;
                const targetText = item.money ? formatCurrency(item.target) : `${item.target}${item.suffix || ''}`;
                return `
                    <div class="bg-vx-darker rounded-xl p-4 border border-vx-border">
                        <div class="flex items-center justify-between mb-3">
                            <p class="font-medium">${item.label}</p>
                            <span class="text-xs text-vx-muted">${percent.toFixed(0)}%</span>
                        </div>
                        <div class="h-2 bg-vx-border rounded-full overflow-hidden mb-3">
                            <div class="h-full progress-bar rounded-full" style="width:${percent}%"></div>
                        </div>
                        <p class="text-sm"><span class="font-bold gradient-text">${currentText}</span> <span class="text-vx-muted">/ ${targetText}</span></p>
                    </div>
                `;
            }).join('');
        }

        // Client CRUD
        function openClientModal(clientId = null) {
            const modal = document.getElementById('client-modal');
            const form = document.getElementById('client-form');
            const title = document.getElementById('modal-title');
            
            form.reset();
            document.getElementById('client-id').value = '';
            
            if (clientId) {
                const client = clients.find(c => c.id === clientId);
                if (client) {
                    title.textContent = 'Editar Cliente';
                    document.getElementById('client-id').value = client.id;
                    document.getElementById('client-name').value = client.name;
                    document.getElementById('client-phase').value = client.phase;
                    document.getElementById('client-value').value = formatNumberInput(client.value);
                    document.getElementById('client-months').value = client.months;
                    document.getElementById('client-contact').value = client.contact;
                    document.getElementById('client-email').value = client.email;
                    document.getElementById('client-phone').value = client.phone;
                    document.getElementById('client-notes').value = client.notes || '';
                }
            } else {
                title.textContent = 'Adicionar Cliente';
            }
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeClientModal() {
            const modal = document.getElementById('client-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function editClient(id) {
            openClientModal(id);
        }

        async function deleteClient(id) {
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                if (window.VXApi?.clients && backendAvailable) {
                    try {
                        await window.VXApi.clients.remove(id);
                    } catch (error) {
                        showToast('Nao foi possivel excluir no banco. Tente novamente.', 'error');
                        return;
                    }
                }

                clients = clients.filter(c => c.id !== id);
                delete clientDashboards[id];
                saveData();
                updateAllMetrics();
                renderClientsTable();
                renderKanban();
                showToast('Cliente excluido com sucesso', 'success');
            }
        }

        // Goal functions
        function openGoalModal() {
            const modal = document.getElementById('goal-modal');
            document.getElementById('goal-value').value = formatNumberInput(currentGoal.target);
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeGoalModal() {
            const modal = document.getElementById('goal-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // Event functions
        function openEventModal(value = null) {
            const modal = document.getElementById('event-modal');
            const select = document.getElementById('event-client');
            const form = document.getElementById('event-form');
            const title = document.getElementById('event-modal-title');

            select.innerHTML = '<option value="">Nenhum</option>' + 
                clients.map(c => `<option value="${safeText(c.id)}">${safeText(c.name)}</option>`).join('');

            form.reset();
            document.getElementById('event-id').value = '';

            const existingEvent = events.find(e => e.id === value);

            if (existingEvent) {
                title.textContent = 'Editar Reunião';
                document.getElementById('event-id').value = existingEvent.id;
                document.getElementById('event-title').value = existingEvent.title || '';
                document.getElementById('event-date').value = existingEvent.date || '';
                document.getElementById('event-time').value = existingEvent.time || '';
                document.getElementById('event-client').value = existingEvent.clientId || '';
                document.getElementById('event-status').value = existingEvent.status || 'agendada';
                document.getElementById('event-sale').value = existingEvent.sale === true || existingEvent.sale === 'sim' ? 'sim' : 'nao';
                document.getElementById('event-revenue').value = existingEvent.revenue ? formatNumberInput(existingEvent.revenue) : '';
            } else {
                title.textContent = 'Nova Reunião';
                if (value) document.getElementById('event-date').value = value;
            }

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeEventModal() {
            const modal = document.getElementById('event-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        
        async function deleteEvent(id) {
            const idString = String(id);
            const before = events.length;

            try {
                await removeResource('events', idString);
            } catch (error) {
                console.warn('Falha ao excluir evento na API. A remocao local sera apenas temporaria na sessao.', error);
            }

            events = events.filter(e => String(e.id) !== idString);

            if (events.length === before) {
                showToast('Reunião não encontrada para excluir', 'error');
                return;
            }

            saveData();

            renderCalendar();
            renderUpcomingEvents();
            renderGoals();
            updateAllMetrics();

            showToast('Reunião excluída da agenda', 'success');
        }

        function selectDate(dateStr) {
            openEventModal(dateStr);
        }

        function changeMonth(delta) {
            currentMonth.setMonth(currentMonth.getMonth() + delta);
            renderCalendar();
        }

        // Drag and drop
        let dragGhostRaf = null;
        let dragGhostX = 0;
        let dragGhostY = 0;

        function createDragGhost(sourceCard, x, y) {
            const ghost = sourceCard.cloneNode(true);
            const rect = sourceCard.getBoundingClientRect();

            ghost.classList.add('drag-ghost-card');
            ghost.classList.remove('is-pointer-dragging', 'dragging', 'cursor-grab');
            ghost.style.width = `${rect.width}px`;
            ghost.style.height = `${rect.height}px`;

            ghost.querySelectorAll('button, a, input, select, textarea').forEach(el => {
                el.style.pointerEvents = 'none';
            });

            document.body.appendChild(ghost);
            moveDragGhost(ghost, x, y, true);
            return ghost;
        }

        function moveDragGhost(ghost, x, y, immediate = false) {
            if (!ghost) return;

            dragGhostX = x;
            dragGhostY = y;

            const update = () => {
                dragGhostRaf = null;
                ghost.style.transform = `translate3d(${dragGhostX}px, ${dragGhostY}px, 0) translate(-50%, -50%) rotate(.5deg) scale(1.01)`;
            };

            if (immediate) {
                update();
                return;
            }

            if (!dragGhostRaf) {
                dragGhostRaf = requestAnimationFrame(update);
            }
        }

        function removeDragGhost(ghost) {
            if (dragGhostRaf) {
                cancelAnimationFrame(dragGhostRaf);
                dragGhostRaf = null;
            }

            if (ghost && ghost.parentNode) {
                ghost.parentNode.removeChild(ghost);
            }
        }

        function setupDragAndDrop() {
            const cards = document.querySelectorAll('.kanban-card');
            const columns = document.querySelectorAll('.kanban-column');

            function clearKanbanDragState() {
                columns.forEach(col => col.classList.remove('drag-over'));
                document.body.classList.remove('kanban-dragging');
                document.querySelectorAll('.kanban-card').forEach(card => {
                    card.classList.remove('dragging', 'is-pointer-dragging');
                });
            }

            async function moveClientToPhase(clientId, newPhase) {
                const client = clients.find(c => c.id === clientId);
                if (client && client.phase !== newPhase) {
                    const previousPhase = client.phase;
                    client.phase = newPhase;
                    try {
                        await persistClient(client, true);
                    } catch (error) {
                        client.phase = previousPhase;
                        showToast('Nao foi possivel atualizar no banco. Tente novamente.', 'error');
                        return;
                    }
                    saveData();
                    updateAllMetrics();
                    renderKanban();
                    showToast(`Cliente movido para ${getPhaseLabel(newPhase)}`, 'success');
                }
            }

            cards.forEach(card => {
                // Desktop native drag fallback
                card.setAttribute('draggable', 'false');

                card.addEventListener('dragstart', (e) => {
                    card.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('client-id', card.dataset.id);
                    e.dataTransfer.setData('text/plain', card.dataset.id);
                });

                card.addEventListener('dragend', clearKanbanDragState);

                // Pointer fallback: funciona melhor quando o drag nativo falha/trava.
                card.addEventListener('pointerdown', (e) => {
                    if (e.target.closest('button, a, input, select, textarea')) return;
                    if (e.button !== undefined && e.button !== 0) return;

                    const startX = e.clientX;
                    const startY = e.clientY;
                    let moved = false;
                    let activeColumn = null;
                    let ghost = null;

                    card.classList.add('is-pointer-dragging');
                    document.body.classList.add('kanban-dragging');
                    try { card.setPointerCapture(e.pointerId); } catch (_) {}

                    const onMove = (moveEvent) => {
                        const dx = Math.abs(moveEvent.clientX - startX);
                        const dy = Math.abs(moveEvent.clientY - startY);
                        if (dx > 6 || dy > 6) {
                            moved = true;
                            if (!ghost) ghost = createDragGhost(card, moveEvent.clientX, moveEvent.clientY);
                        }

                        moveDragGhost(ghost, moveEvent.clientX, moveEvent.clientY);

                        const el = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
                        const column = el?.closest?.('.kanban-column');

                        if (column !== activeColumn) {
                            columns.forEach(col => col.classList.remove('drag-over'));
                            activeColumn = column;
                            if (activeColumn) activeColumn.classList.add('drag-over');
                        }
                    };

                    const onUp = (upEvent) => {
                        document.removeEventListener('pointermove', onMove);
                        document.removeEventListener('pointerup', onUp);
                        document.removeEventListener('pointercancel', onUp);

                        const el = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
                        const column = el?.closest?.('.kanban-column');
                        const clientId = card.dataset.id;

                        removeDragGhost(ghost);
                        clearKanbanDragState();

                        if (moved && column && clientId) {
                            moveClientToPhase(clientId, column.dataset.phase);
                        }
                    };

                    document.addEventListener('pointermove', onMove);
                    document.addEventListener('pointerup', onUp);
                    document.addEventListener('pointercancel', onUp);
                });
            });

            columns.forEach(column => {
                column.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    column.classList.add('drag-over');
                });

                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    column.classList.add('drag-over');
                });

                column.addEventListener('dragleave', (e) => {
                    if (!column.contains(e.relatedTarget)) {
                        column.classList.remove('drag-over');
                    }
                });

                column.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const clientId = e.dataTransfer.getData('client-id') || e.dataTransfer.getData('text/plain');
                    const newPhase = column.dataset.phase;

                    clearKanbanDragState();
                    moveClientToPhase(clientId, newPhase);
                });
            });
        }

        // Event listeners
        function setupEventListeners() {
            // Client form
            document.getElementById('client-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const id = document.getElementById('client-id').value || generateId();
                const clientData = {
                    id,
                    name: document.getElementById('client-name').value,
                    phase: document.getElementById('client-phase').value,
                    value: parseCurrency(document.getElementById('client-value').value),
                    months: parseInt(document.getElementById('client-months').value),
                    contact: document.getElementById('client-contact').value,
                    email: document.getElementById('client-email').value,
                    phone: document.getElementById('client-phone').value,
                    notes: document.getElementById('client-notes').value,
                    createdAt: new Date().toISOString()
                };
                
                const existingIndex = clients.findIndex(c => c.id === id);
                const isUpdate = existingIndex >= 0;

                try {
                    const savedClient = await persistClient(clientData, isUpdate);
                    const normalizedClient = { ...clientData, ...savedClient };

                    if (isUpdate) {
                        clients[existingIndex] = { ...clients[existingIndex], ...normalizedClient };
                    } else {
                        clients.push(normalizedClient);
                    }
                } catch (error) {
                    console.warn('Falha ao salvar cliente na API. Usando fallback local.', error);
                    if (isUpdate) {
                        clients[existingIndex] = { ...clients[existingIndex], ...clientData };
                    } else {
                        clients.push(clientData);
                    }
                    showToast('API indisponivel. Cliente salvo localmente.', 'error');
                }
                
                saveData();
                closeClientModal();
                updateAllMetrics();
                renderKanban();
                renderContracts();
                renderDeliveries();
                showToast('Cliente salvo com sucesso', 'success');
            });
            
            // Goal form
            document.getElementById('goal-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const target = parseCurrency(document.getElementById('goal-value').value);
                const goalData = { id: currentGoal?.id || generateId(), target, date: new Date().toISOString().split('T')[0] };
                const index = goals.findIndex(goal => goal.id === goalData.id);

                try {
                    currentGoal = await persistResource('goals', goalData, index >= 0) || goalData;
                } catch (error) {
                    console.warn('Falha ao salvar meta na API. Usando fallback local.', error);
                    currentGoal = goalData;
                }

                if (index >= 0) goals[index] = { ...goals[index], ...currentGoal };
                else goals.unshift(currentGoal);
                
                saveData();
                closeGoalModal();
                updateAllMetrics();
                renderGoals();
                showToast('Meta atualizada', 'success');
            });
            
            // Event form
            document.getElementById('event-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const id = document.getElementById('event-id').value || generateId();
                const eventData = {
                    id,
                    title: document.getElementById('event-title').value,
                    date: document.getElementById('event-date').value,
                    time: document.getElementById('event-time').value,
                    clientId: document.getElementById('event-client').value,
                    status: document.getElementById('event-status').value,
                    sale: document.getElementById('event-sale').value,
                    revenue: parseCurrency(document.getElementById('event-revenue').value || '0')
                };

                const index = events.findIndex(event => event.id === id);
                try {
                    const payload = { ...eventData, sale: eventData.sale === 'sim' };
                    const saved = await persistResource('events', payload, index >= 0);
                    const normalized = { ...eventData, ...saved, sale: saved?.sale === true ? 'sim' : eventData.sale };
                    if (index >= 0) events[index] = { ...events[index], ...normalized };
                    else events.push(normalized);
                } catch (error) {
                    console.warn('Falha ao salvar evento na API. Usando fallback local.', error);
                    if (index >= 0) events[index] = { ...events[index], ...eventData };
                    else events.push(eventData);
                }

                saveData();
                closeEventModal();
                renderCalendar();
                showToast('Evento criado', 'success');
            });
            

            // Contract form
            document.getElementById('contract-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('contract-id').value || generateId();
                const data = {
                    id,
                    clientId: document.getElementById('contract-client').value,
                    plan: document.getElementById('contract-plan').value,
                    startDate: document.getElementById('contract-start').value,
                    endDate: document.getElementById('contract-end').value,
                    status: document.getElementById('contract-status').value,
                    autoRenew: document.getElementById('contract-auto-renew').value === 'sim',
                    createdAt: new Date().toISOString()
                };
                const index = contracts.findIndex(c => c.id === id);
                try {
                    const saved = await persistResource('contracts', data, index >= 0);
                    const normalized = { ...data, ...saved };
                    if (index >= 0) contracts[index] = { ...contracts[index], ...normalized };
                    else contracts.push(normalized);
                } catch (error) {
                    console.warn('Falha ao salvar contrato na API. Usando fallback local.', error);
                    if (index >= 0) contracts[index] = { ...contracts[index], ...data };
                    else contracts.push(data);
                }
                saveData();
                closeContractModal();
                renderContracts();
                renderGoals();
                showToast('Contrato salvo', 'success');
            });

            // Delivery form
            document.getElementById('delivery-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('delivery-id').value || generateId();
                const data = {
                    id,
                    clientId: document.getElementById('delivery-client').value,
                    type: document.getElementById('delivery-type').value,
                    title: document.getElementById('delivery-title').value,
                    owner: document.getElementById('delivery-owner').value,
                    deadline: document.getElementById('delivery-deadline').value,
                    status: document.getElementById('delivery-status').value,
                    createdAt: new Date().toISOString()
                };
                const index = deliveries.findIndex(d => d.id === id);
                try {
                    const saved = await persistResource('deliveries', data, index >= 0);
                    const normalized = { ...data, ...saved };
                    if (index >= 0) deliveries[index] = { ...deliveries[index], ...normalized };
                    else deliveries.push(normalized);
                } catch (error) {
                    console.warn('Falha ao salvar entrega na API. Usando fallback local.', error);
                    if (index >= 0) deliveries[index] = { ...deliveries[index], ...data };
                    else deliveries.push(data);
                }
                saveData();
                closeDeliveryModal();
                renderDeliveries();
                showToast('Entrega salva', 'success');
            });

            // Performance form
            document.getElementById('performance-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = document.getElementById('performance-id').value || generateId();
                const data = {
                    id,
                    clientId: document.getElementById('performance-client').value,
                    date: document.getElementById('performance-date').value || new Date().toISOString().split('T')[0],
                    leads: parseInt(document.getElementById('performance-leads').value) || 0,
                    sales: parseInt(document.getElementById('performance-sales').value) || 0,
                    revenue: parseCurrency(document.getElementById('performance-revenue').value || '0'),
                    investment: parseCurrency(document.getElementById('performance-investment').value || '0')
                };

                const index = clientPerformance.findIndex(r => r.id === id);
                let savedData = data;
                try {
                    savedData = await persistResource('performanceRecords', data, index >= 0) || data;
                } catch (error) {
                    console.warn('Falha ao salvar performance na API. Usando fallback local.', error);
                }

                if (index >= 0) {
                    clientPerformance[index] = { ...clientPerformance[index], ...savedData };
                    showToast('Métricas atualizadas e painel recalculado', 'success');
                } else {
                    clientPerformance.push(savedData);
                    showToast('Métricas salvas e painel recalculado', 'success');
                }

                saveData();
                closePerformanceModal();
                const filter = document.getElementById('performance-client-filter');
                if (filter) filter.value = data.clientId;
                renderClientPerformance();
                renderDashboardCharts();
                renderExecutiveDashboard();
            });

            // Finance form
            document.getElementById('finance-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = document.getElementById('finance-id').value || generateId();
                const data = {
                    id,
                    type: document.getElementById('finance-type').value,
                    status: document.getElementById('finance-status').value,
                    description: document.getElementById('finance-description').value,
                    value: parseCurrency(document.getElementById('finance-value').value || '0'),
                    due: document.getElementById('finance-due').value,
                    recurring: document.getElementById('finance-recurring').value,
                    auto: document.getElementById('finance-auto').value,
                    createdAt: new Date().toISOString()
                };

                const index = financeEntries.findIndex(e => e.id === id);
                let savedData = data;
                try {
                    const saved = await persistResource('financeEntries', data, index >= 0, toFinancePayload);
                    savedData = normalizeFinanceEntry({ ...data, ...saved });
                } catch (error) {
                    console.warn('Falha ao salvar lançamento financeiro na API. Usando fallback local.', error);
                }

                if (index >= 0) {
                    financeEntries[index] = { ...financeEntries[index], ...savedData };
                    showToast('Lançamento financeiro atualizado', 'success');
                } else {
                    financeEntries.push(savedData);
                    showToast('Lançamento financeiro salvo', 'success');
                }

                saveData();
                closeFinanceModal();
                renderRealFinance();
                renderExecutiveDashboard();
            });
// Commission form
            document.getElementById('commission-form')?.addEventListener('submit', (e) => {
                e.preventDefault();

                const id = document.getElementById('commission-id').value || generateId();
                const data = {
                    id,
                    memberId: document.getElementById('commission-member').value,
                    client: document.getElementById('commission-client').value,
                    value: parseCurrency(document.getElementById('commission-sale-value').value || '0'),
                    percent: parseFloat(document.getElementById('commission-percent').value) || 0,
                    goal: parseInt(document.getElementById('commission-goal').value) || 0,
                    createdAt: new Date().toISOString()
                };

                const index = commissionSales.findIndex(s => s.id === id);
                if (index >= 0) commissionSales[index] = { ...commissionSales[index], ...data };
                else commissionSales.push(data);

                saveData();
                closeCommissionModal();
                renderCommissions();
                renderRanking();
                showToast('Comissão salva com sucesso', 'success');
            });

            // Team member form
            document.getElementById('team-member-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();

                const id = document.getElementById('team-member-id').value || generateId();
                const taskBreakdown = collectTeamTaskBreakdown();
                const tempStats = Object.values(taskBreakdown).reduce((acc, item) => {
                    acc.tasks += parseInt(item.assigned || 0);
                    acc.completed += parseInt(item.completed || 0);
                    return acc;
                }, { tasks: 0, completed: 0 });
                const autoPerformance = tempStats.tasks > 0 ? Math.round((tempStats.completed / tempStats.tasks) * 100) : 0;

                const data = {
                    id,
                    name: document.getElementById('team-member-name').value,
                    role: document.getElementById('team-member-role').value,
                    taskBreakdown,
                    tasks: tempStats.tasks,
                    completed: tempStats.completed,
                    performance: parseInt(document.getElementById('team-member-performance').value) || autoPerformance,
                    notes: document.getElementById('team-member-notes').value,
                    createdAt: new Date().toISOString()
                };

                const index = teamMembers.findIndex(m => m.id === id);
                let savedData = data;
                try {
                    const saved = await persistResource('teamMembers', data, index >= 0, toTeamPayload);
                    savedData = normalizeTeamMember({ ...data, ...saved });
                } catch (error) {
                    console.warn('Falha ao salvar membro na API. Usando fallback local.', error);
                }

                if (index >= 0) teamMembers[index] = { ...teamMembers[index], ...savedData };
                else teamMembers.push(savedData);

                saveData();
                closeTeamMemberModal();
                renderTeam();
                renderExecutiveDashboard();
                renderCommissions();
                renderRanking();
                showToast('Membro da equipe salvo', 'success');
            });

            // Agency goals form
            document.getElementById('agency-goals-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                agencyGoals = {
                    revenue: parseCurrency(document.getElementById('agency-goal-revenue').value),
                    newClients: parseInt(document.getElementById('agency-goal-new-clients').value) || 0,
                    averageTicket: parseCurrency(document.getElementById('agency-goal-ticket').value),
                    retention: parseInt(document.getElementById('agency-goal-retention').value) || 0,
                    proposals: parseInt(document.getElementById('agency-goal-proposals').value) || 0,
                    meetings: parseInt(document.getElementById('agency-goal-meetings').value) || 0
                };
                saveData();
                closeAgencyGoalsModal();
                renderGoals();
                showToast('Metas da agência atualizadas', 'success');
            });

            // Search and filter
            document.getElementById('client-search')?.addEventListener('input', debounce(() => loadClientsPage(0), 350));
            document.getElementById('filter-phase')?.addEventListener('change', () => loadClientsPage(0));
            document.getElementById('contracts-status-filter')?.addEventListener('change', () => loadContractsPage(0));
            ['finance-type-filter', 'finance-status-filter', 'finance-from-filter', 'finance-to-filter'].forEach((id) => {
                document.getElementById(id)?.addEventListener('change', () => loadFinancePage(0));
            });
            document.getElementById('team-search')?.addEventListener('input', debounce(() => loadTeamPage(0), 350));
            document.getElementById('team-role-filter')?.addEventListener('change', () => loadTeamPage(0));
            ['goals-from-filter', 'goals-to-filter'].forEach((id) => {
                document.getElementById(id)?.addEventListener('change', () => loadGoalsPage(0));
            });
            
            // Money mask
            document.getElementById('client-value')?.addEventListener('input', (e) => {
                e.target.value = formatMoneyInput(e.target.value);
            });
            
            document.getElementById('goal-value')?.addEventListener('input', (e) => {
                e.target.value = formatMoneyInput(e.target.value);
            });
            document.getElementById('agency-goal-revenue')?.addEventListener('input', (e) => { e.target.value = formatMoneyInput(e.target.value); });
            document.getElementById('agency-goal-ticket')?.addEventListener('input', (e) => { e.target.value = formatMoneyInput(e.target.value); });
            
            // Phone mask
            document.getElementById('client-phone')?.addEventListener('input', (e) => {
                e.target.value = formatPhoneInput(e.target.value);
            });
        }

        // Utility functions
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

        function normalizeText(value) {
            return String(value ?? '').toLowerCase();
        }

        function generateId() {
            return 'id_' + Math.random().toString(36).substr(2, 9);
        }

        function saveData() {
            return true;
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

        function renderDocuments() {
            const container = document.getElementById('documents-list');
            if (!container) return;

            if (!uploadedDocuments.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>Nenhum documento enviado</h4>
                        <p>Envie contratos PDF, imagens ou documentos para manter a operação centralizada no backend.</p>
                    </div>
                `;
                return;
            }

            const canDelete = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR', 'OPERACIONAL');
            container.innerHTML = uploadedDocuments.map((document) => `
                <article class="resource-row">
                    <div class="resource-row__main">
                        <div class="resource-row__icon">DOC</div>
                        <div class="min-w-0">
                            <h4>${safeText(document.originalFilename, 'Documento')}</h4>
                            <p>${safeText(document.contentType, 'arquivo')} · ${formatBytes(document.sizeBytes)} · ${formatDateTime(document.createdAt)}</p>
                        </div>
                    </div>
                    <div class="resource-row__actions">
                        <button type="button" class="resource-row__action" data-document-download="${safeId(document.id)}">Baixar</button>
                        ${canDelete ? `<button type="button" class="resource-row__action danger" data-document-delete="${safeId(document.id)}">Excluir</button>` : ''}
                    </div>
                </article>
            `).join('');
        }

        function renderAudit() {
            const container = document.getElementById('audit-list');
            if (!container) return;

            if (!window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>Acesso restrito</h4>
                        <p>Somente ADMIN e GESTOR podem consultar atividades de auditoria.</p>
                    </div>
                `;
                return;
            }

            if (!auditLogs.length) {
                container.innerHTML = `
                    <div class="empty-state">
                        <h4>Nenhuma atividade registrada</h4>
                        <p>Eventos de login, criação, edição, exclusão e mudança de status aparecerão aqui.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = auditLogs.map((log) => `
                <article class="audit-item">
                    <div class="audit-item__marker"></div>
                    <div class="audit-item__body">
                        <div class="audit-item__header">
                            <span class="audit-badge">${safeText(log.action, 'AÇÃO')}</span>
                            <time>${formatDateTime(log.createdAt)}</time>
                        </div>
                        <h4>${safeText(log.entity, 'Entidade')}</h4>
                        <p>Usuário ${safeText(log.userId, '-')} · IP ${safeText(log.ipAddress, '-')}</p>
                        ${log.fieldName ? `<p>Campo ${safeText(log.fieldName)}: ${safeText(log.oldValue, '-')} → ${safeText(log.newValue, '-')}</p>` : ''}
                    </div>
                </article>
            `).join('');
        }

        async function refreshDocuments() {
            await hydrateUploadsFromApi();
            renderDocuments();
        }

        async function refreshAudit() {
            await hydrateAuditFromApi();
            renderAudit();
        }

        function renderProfile() {
            const user = window.VXAuth?.user?.() || {};
            const initials = window.VXUI?.initials?.(user.name) || 'VX';

            const set = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value || '';
            };
            const text = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value || '';
            };

            set('profile-name', user.name);
            set('profile-position', user.position);
            set('profile-photo-url', user.photoUrl);
            text('profile-summary-name', user.name || 'Usuario');
            text('profile-summary-email', user.email || '');
            text('profile-summary-role', user.role ? `Perfil ${user.role}` : 'Perfil');
            text('profile-avatar-preview', initials);
            const avatar = document.getElementById('profile-avatar-preview');
            if (avatar) {
                avatar.style.backgroundImage = user.photoUrl ? `url("${String(user.photoUrl).replace(/"/g, '\\"')}")` : '';
                avatar.classList.toggle('has-image', Boolean(user.photoUrl));
            }
        }

        function renderSettings() {
            const canManage = window.VXAuth?.hasRole?.('ADMIN', 'GESTOR');
            const form = document.getElementById('settings-form');
            if (!form) return;

            if (!canManage) {
                form.innerHTML = `
                    <section class="settings-panel">
                        <h3 class="font-display text-xl font-bold">Acesso restrito</h3>
                        <p class="text-vx-muted mt-2">Somente ADMIN e GESTOR podem editar as configurações do CRM.</p>
                    </section>
                `;
                return;
            }

            const settings = crmSettings || {};
            const set = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.value = value ?? '';
            };

            set('settings-company-name', settings.companyName || 'VertX Midia');
            set('settings-company-email', settings.companyEmail);
            set('settings-company-phone', settings.companyPhone);
            set('settings-revenue-goal', settings.defaultRevenueGoal ? formatCurrency(Number(settings.defaultRevenueGoal)) : '');
            set('settings-profit-margin', settings.defaultProfitMargin);
            set('settings-preferences', settings.preferences);
        }

        function setupProfileAndSettings() {
            const profileForm = document.getElementById('profile-form');
            profileForm?.addEventListener('submit', async (event) => {
                event.preventDefault();

                try {
                    const user = await window.VXApi.auth.updateProfile({
                        name: document.getElementById('profile-name').value,
                        position: document.getElementById('profile-position').value,
                        photoUrl: document.getElementById('profile-photo-url').value
                    });
                    window.VXAuth?.updateUser?.(user);
                    const userEl = document.getElementById('current-user-name');
                    if (userEl) userEl.textContent = user.name;
                    renderProfile();
                    showToast('Perfil atualizado', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel atualizar o perfil', 'error');
                }
            });

            const passwordForm = document.getElementById('password-form');
            passwordForm?.addEventListener('submit', async (event) => {
                event.preventDefault();

                try {
                    await window.VXApi.auth.changePassword({
                        currentPassword: document.getElementById('password-current').value,
                        newPassword: document.getElementById('password-new').value
                    });
                    passwordForm.reset();
                    showToast('Senha alterada com seguranca', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel trocar a senha', 'error');
                }
            });

            const profilePhotoFile = document.getElementById('profile-photo-file');
            profilePhotoFile?.addEventListener('change', () => {
                const label = profilePhotoFile.closest('.document-upload-control')?.querySelector('span');
                if (label) label.textContent = profilePhotoFile.files?.[0]?.name || 'Enviar foto pelo backend';
            });

            document.getElementById('profile-photo-upload')?.addEventListener('click', async () => {
                const file = profilePhotoFile?.files?.[0];
                const user = window.VXAuth?.user?.();
                if (!file || !user?.id) {
                    showToast('Selecione uma imagem para enviar', 'error');
                    return;
                }

                try {
                    const document = await window.VXApi.uploads.create(file, { entityType: 'profile', entityId: user.id });
                    const photoUrl = document.publicUrl;
                    const updated = await window.VXApi.auth.updateProfile({
                        name: document.getElementById('profile-name').value,
                        position: document.getElementById('profile-position').value,
                        photoUrl
                    });
                    window.VXAuth?.updateUser?.(updated);
                    profilePhotoFile.value = '';
                    const label = profilePhotoFile.closest('.document-upload-control')?.querySelector('span');
                    if (label) label.textContent = 'Enviar foto pelo backend';
                    renderProfile();
                    showToast('Foto de perfil atualizada', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel enviar a foto', 'error');
                }
            });

            const settingsForm = document.getElementById('settings-form');
            settingsForm?.addEventListener('submit', async (event) => {
                event.preventDefault();
                if (!window.VXAuth?.hasRole?.('ADMIN', 'GESTOR')) return;

                try {
                    crmSettings = await window.VXApi.settings.save({
                        companyName: document.getElementById('settings-company-name').value,
                        companyEmail: document.getElementById('settings-company-email').value,
                        companyPhone: document.getElementById('settings-company-phone').value,
                        defaultRevenueGoal: parseCurrency(document.getElementById('settings-revenue-goal').value || '0'),
                        defaultProfitMargin: Number(document.getElementById('settings-profit-margin').value || 0),
                        preferences: document.getElementById('settings-preferences').value
                    });
                    renderSettings();
                    showToast('Configuracoes salvas', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel salvar as configuracoes', 'error');
                }
            });

            document.getElementById('settings-revenue-goal')?.addEventListener('input', (event) => {
                event.target.value = formatMoneyInput(event.target.value);
            });
        }

        function setupDocumentsAndAudit() {
            const fileInput = document.getElementById('document-file');
            const uploadForm = document.getElementById('document-upload-form');

            fileInput?.addEventListener('change', () => {
                const label = uploadForm?.querySelector('.document-upload-control span');
                if (label) label.textContent = fileInput.files?.[0]?.name || 'Selecionar arquivo';
            });

            uploadForm?.addEventListener('submit', async (event) => {
                event.preventDefault();
                const file = fileInput?.files?.[0];
                if (!file) {
                    showToast('Selecione um arquivo para enviar', 'error');
                    return;
                }

                try {
                    const saved = await window.VXApi.uploads.create(file);
                    uploadedDocuments = [saved, ...uploadedDocuments.filter(item => item.id !== saved.id)];
                    uploadForm.reset();
                    const label = uploadForm.querySelector('.document-upload-control span');
                    if (label) label.textContent = 'Selecionar arquivo';
                    renderDocuments();
                    showToast('Documento enviado com segurança', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel enviar o documento', 'error');
                }
            });

            document.getElementById('documents-search')?.addEventListener('input', debounce(refreshDocuments, 350));

            ['audit-action-filter', 'audit-entity-filter', 'audit-from-filter', 'audit-to-filter'].forEach((id) => {
                document.getElementById(id)?.addEventListener('input', debounce(refreshAudit, 350));
                document.getElementById(id)?.addEventListener('change', refreshAudit);
            });

            document.getElementById('documents-list')?.addEventListener('click', async (event) => {
                const downloadButton = event.target.closest('[data-document-download]');
                if (downloadButton) {
                    const id = decodeURIComponent(downloadButton.dataset.documentDownload || '');
                    try {
                        const result = await window.VXApi.uploads.download(id);
                        const url = URL.createObjectURL(result.blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = result.filename || 'documento';
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        URL.revokeObjectURL(url);
                    } catch (error) {
                        showToast(error.message || 'Nao foi possivel baixar o documento', 'error');
                    }
                    return;
                }

                const button = event.target.closest('[data-document-delete]');
                if (!button) return;

                const id = decodeURIComponent(button.dataset.documentDelete || '');
                try {
                    await window.VXApi.uploads.remove(id);
                    uploadedDocuments = uploadedDocuments.filter(document => String(document.id) !== id);
                    renderDocuments();
                    showToast('Documento excluido com seguranca', 'success');
                } catch (error) {
                    showToast(error.message || 'Nao foi possivel excluir o documento', 'error');
                }
            });
        }

        function formatCurrency(value) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }

        function formatDate(dateStr) {
            return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
        }

        function parseCurrency(str) {
            return parseFloat(str.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        }

        function formatMoneyInput(value) {
            const numbers = value.replace(/\D/g, '');
            return numbers.replace(/(\d+)(\d{2})$/, 'R$ $1,$2').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        function formatNumberInput(value) {
            return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        }

        function formatPhoneInput(value) {
            const numbers = value.replace(/\D/g, '');
            if (numbers.length <= 2) return `(${numbers}`;
            if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
            return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }

        
        function getPipelineProbability(phase) {
            const probabilities = {
                lead: 10,
                proposta: 20,
                reuniao: 40,
                negociacao: 70,
                contrato: 90,
                fechado: 100,
                perdido: 0
            };

            return probabilities[phase] || 0;
        }

function getPhaseLabel(phase) {
            const labels = {
                prospeccao: 'Prospeccao',
                negociacao: 'Negociacao',
                fechado: 'Fechado',
                followup: 'Follow-up'
            };
            return labels[phase] || phase;
        }

        function getPhaseClass(phase) {
            const classes = {
                prospeccao: 'bg-blue-500/20 text-blue-400',
                negociacao: 'bg-yellow-500/20 text-yellow-400',
                fechado: 'bg-green-500/20 text-green-400',
                followup: 'bg-vx-pink/20 text-vx-pink'
            };
            return classes[phase] || '';
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const bgColor = type === 'success' ? 'bg-green-500/20 border-green-500' : 
                           type === 'error' ? 'bg-red-500/20 border-red-500' : 
                           'bg-vx-card border-vx-purple';
            
            toast.className = `toast px-4 py-3 rounded-xl border ${bgColor} backdrop-blur-sm`;
            toast.innerHTML = `
                <div class="flex items-center gap-3">
                    ${type === 'success' ? '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : ''}
                    ${type === 'error' ? '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' : ''}
                    <span class="text-sm">${message}</span>
                </div>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
