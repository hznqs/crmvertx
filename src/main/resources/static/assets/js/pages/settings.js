(function () {
    function value(id) {
        return document.getElementById(id)?.value || '';
    }

    function money(id) {
        if (typeof window.parseCurrency === 'function') {
            return window.parseCurrency(value(id) || '0');
        }
        return Number(String(value(id)).replace(/\D/g, '')) / 100 || 0;
    }

    function organizationPayload() {
        return {
            name: value('settings-company-name'),
            email: value('settings-company-email'),
            phone: value('settings-company-phone'),
            document: value('settings-company-document'),
            website: value('settings-company-website'),
            address: value('settings-company-address')
        };
    }

    function settingsPayload(baseSettings = {}) {
        return {
            companyName: value('settings-company-name'),
            companyEmail: value('settings-company-email'),
            companyPhone: value('settings-company-phone'),
            companyDocument: value('settings-company-document'),
            companyWebsite: value('settings-company-website'),
            companyAddress: value('settings-company-address'),
            defaultRevenueGoal: money('settings-revenue-goal'),
            defaultProfitMargin: Number(value('settings-profit-margin') || 0),
            defaultCurrency: (value('settings-currency') || 'BRL').trim().toUpperCase(),
            defaultTimezone: value('settings-timezone') || 'America/Sao_Paulo',
            defaultTaxRate: Number(value('settings-tax-rate') || 0),
            defaultCommissionRate: Number(value('settings-commission-rate') || 0),
            agencyRevenueGoal: Number(baseSettings.agencyRevenueGoal || 0),
            agencyNewClientsGoal: Number(baseSettings.agencyNewClientsGoal || 0),
            agencyAverageTicketGoal: Number(baseSettings.agencyAverageTicketGoal || 0),
            agencyRetentionGoal: Number(baseSettings.agencyRetentionGoal || 0),
            agencyProposalsGoal: Number(baseSettings.agencyProposalsGoal || 0),
            agencyMeetingsGoal: Number(baseSettings.agencyMeetingsGoal || 0),
            preferences: value('settings-preferences'),
            crmRules: value('settings-crm-rules')
        };
    }

    async function save(baseSettings = {}) {
        const [organization, settings] = await Promise.all([
            window.VXApi.organization.save(organizationPayload()),
            window.VXApi.settings.save(settingsPayload(baseSettings))
        ]);
        return { organization, settings };
    }

    window.VXSettingsPage = {
        organizationPayload,
        settingsPayload,
        save
    };
})();
