package br.com.vertxmidia.crm.security;

import java.util.Locale;

public enum CrmModule {
    AUDIT,
    BILLING,
    UPLOADS,
    LEADS,
    CLIENTS,
    SERVICES,
    PROJECTS,
    TASKS,
    CONTRACTS,
    FINANCE,
    DELIVERIES,
    TEAM,
    COMMISSIONS,
    AGENDA,
    GOALS,
    DASHBOARD,
    PERFORMANCE,
    ORGANIZATION,
    SETTINGS;

    static CrmModule from(String value) {
        return CrmModule.valueOf(String.valueOf(value).trim().toUpperCase(Locale.ROOT));
    }
}
