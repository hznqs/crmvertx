alter table if exists crm_finance_entries
    drop constraint if exists crm_finance_entries_value_check;

alter table if exists crm_finance_entries
    add constraint crm_finance_entries_value_check
    check (value >= 0);

alter table if exists crm_client_performance
    drop constraint if exists crm_client_performance_leads_check;

alter table if exists crm_client_performance
    add constraint crm_client_performance_leads_check
    check (leads >= 0);

alter table if exists crm_client_performance
    drop constraint if exists crm_client_performance_sales_check;

alter table if exists crm_client_performance
    add constraint crm_client_performance_sales_check
    check (sales >= 0);

alter table if exists crm_client_performance
    drop constraint if exists crm_client_performance_revenue_check;

alter table if exists crm_client_performance
    add constraint crm_client_performance_revenue_check
    check (revenue >= 0);

alter table if exists crm_client_performance
    drop constraint if exists crm_client_performance_investment_check;

alter table if exists crm_client_performance
    add constraint crm_client_performance_investment_check
    check (investment >= 0);

alter table if exists crm_goals
    drop constraint if exists crm_goals_target_check;

alter table if exists crm_goals
    add constraint crm_goals_target_check
    check (target >= 0);

alter table if exists crm_settings
    drop constraint if exists crm_settings_numeric_goals_check;

alter table if exists crm_settings
    add constraint crm_settings_numeric_goals_check
    check (
        default_revenue_goal >= 0
        and default_profit_margin >= 0
        and default_tax_rate >= 0
        and default_commission_rate >= 0
        and agency_revenue_goal >= 0
        and agency_new_clients_goal >= 0
        and agency_average_ticket_goal >= 0
        and agency_retention_goal >= 0
        and agency_proposals_goal >= 0
        and agency_meetings_goal >= 0
    );
