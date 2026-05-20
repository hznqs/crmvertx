(function () {
    function periodParams() {
        return {
            from: document.getElementById('dashboard-from-filter')?.value || '',
            to: document.getElementById('dashboard-to-filter')?.value || ''
        };
    }

    async function loadDashboardData() {
        if (!window.VXApi?.dashboard?.metrics) {
            throw new Error('API de dashboard indisponivel.');
        }

        const params = periodParams();
        const metrics = await window.VXApi.dashboard.metrics(params);
        const [revenueChart, meetingsChart] = await Promise.all([
            window.VXApi.dashboard.revenueChart
                ? window.VXApi.dashboard.revenueChart(params).catch(() => [])
                : Promise.resolve([]),
            window.VXApi.dashboard.meetingsChart
                ? window.VXApi.dashboard.meetingsChart(params).catch(() => [])
                : Promise.resolve([])
        ]);

        return {
            metrics,
            revenueChart: Array.isArray(revenueChart) ? revenueChart : [],
            meetingsChart: Array.isArray(meetingsChart) ? meetingsChart : []
        };
    }

    window.VXDashboardPage = {
        periodParams,
        loadDashboardData
    };
})();
