package br.com.vertxmidia.crm.modules.settings.domain;

import br.com.vertxmidia.crm.common.domain.TimestampedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "crm_settings")
public class CrmSettings extends TimestampedEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "company_name", nullable = false, length = 180)
    private String companyName;

    @Column(name = "company_email", length = 180)
    private String companyEmail;

    @Column(name = "company_phone", length = 40)
    private String companyPhone;

    @Column(name = "company_document", length = 40)
    private String companyDocument;

    @Column(name = "company_website", length = 200)
    private String companyWebsite;

    @Column(name = "company_address", length = 280)
    private String companyAddress;

    @Column(name = "default_revenue_goal", nullable = false, precision = 14, scale = 2)
    private BigDecimal defaultRevenueGoal = BigDecimal.ZERO;

    @Column(name = "default_profit_margin", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultProfitMargin = BigDecimal.ZERO;

    @Column(name = "default_currency", nullable = false, length = 8)
    private String defaultCurrency = "BRL";

    @Column(name = "default_timezone", nullable = false, length = 80)
    private String defaultTimezone = "America/Sao_Paulo";

    @Column(name = "default_tax_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultTaxRate = BigDecimal.ZERO;

    @Column(name = "default_commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultCommissionRate = BigDecimal.ZERO;

    @Column(name = "agency_revenue_goal", nullable = false, precision = 14, scale = 2)
    private BigDecimal agencyRevenueGoal = BigDecimal.ZERO;

    @Column(name = "agency_new_clients_goal", nullable = false)
    private Integer agencyNewClientsGoal = 0;

    @Column(name = "agency_average_ticket_goal", nullable = false, precision = 14, scale = 2)
    private BigDecimal agencyAverageTicketGoal = BigDecimal.ZERO;

    @Column(name = "agency_retention_goal", nullable = false, precision = 5, scale = 2)
    private BigDecimal agencyRetentionGoal = BigDecimal.ZERO;

    @Column(name = "agency_proposals_goal", nullable = false)
    private Integer agencyProposalsGoal = 0;

    @Column(name = "agency_meetings_goal", nullable = false)
    private Integer agencyMeetingsGoal = 0;

    @Column(columnDefinition = "text")
    private String preferences;

    @Column(name = "crm_rules", columnDefinition = "text")
    private String crmRules;

    public UUID getId() { return id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyEmail() { return companyEmail; }
    public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
    public String getCompanyPhone() { return companyPhone; }
    public void setCompanyPhone(String companyPhone) { this.companyPhone = companyPhone; }
    public String getCompanyDocument() { return companyDocument; }
    public void setCompanyDocument(String companyDocument) { this.companyDocument = companyDocument; }
    public String getCompanyWebsite() { return companyWebsite; }
    public void setCompanyWebsite(String companyWebsite) { this.companyWebsite = companyWebsite; }
    public String getCompanyAddress() { return companyAddress; }
    public void setCompanyAddress(String companyAddress) { this.companyAddress = companyAddress; }
    public BigDecimal getDefaultRevenueGoal() { return defaultRevenueGoal; }
    public void setDefaultRevenueGoal(BigDecimal defaultRevenueGoal) { this.defaultRevenueGoal = defaultRevenueGoal; }
    public BigDecimal getDefaultProfitMargin() { return defaultProfitMargin; }
    public void setDefaultProfitMargin(BigDecimal defaultProfitMargin) { this.defaultProfitMargin = defaultProfitMargin; }
    public String getDefaultCurrency() { return defaultCurrency; }
    public void setDefaultCurrency(String defaultCurrency) { this.defaultCurrency = defaultCurrency; }
    public String getDefaultTimezone() { return defaultTimezone; }
    public void setDefaultTimezone(String defaultTimezone) { this.defaultTimezone = defaultTimezone; }
    public BigDecimal getDefaultTaxRate() { return defaultTaxRate; }
    public void setDefaultTaxRate(BigDecimal defaultTaxRate) { this.defaultTaxRate = defaultTaxRate; }
    public BigDecimal getDefaultCommissionRate() { return defaultCommissionRate; }
    public void setDefaultCommissionRate(BigDecimal defaultCommissionRate) { this.defaultCommissionRate = defaultCommissionRate; }
    public BigDecimal getAgencyRevenueGoal() { return agencyRevenueGoal; }
    public void setAgencyRevenueGoal(BigDecimal agencyRevenueGoal) { this.agencyRevenueGoal = agencyRevenueGoal; }
    public Integer getAgencyNewClientsGoal() { return agencyNewClientsGoal; }
    public void setAgencyNewClientsGoal(Integer agencyNewClientsGoal) { this.agencyNewClientsGoal = agencyNewClientsGoal; }
    public BigDecimal getAgencyAverageTicketGoal() { return agencyAverageTicketGoal; }
    public void setAgencyAverageTicketGoal(BigDecimal agencyAverageTicketGoal) { this.agencyAverageTicketGoal = agencyAverageTicketGoal; }
    public BigDecimal getAgencyRetentionGoal() { return agencyRetentionGoal; }
    public void setAgencyRetentionGoal(BigDecimal agencyRetentionGoal) { this.agencyRetentionGoal = agencyRetentionGoal; }
    public Integer getAgencyProposalsGoal() { return agencyProposalsGoal; }
    public void setAgencyProposalsGoal(Integer agencyProposalsGoal) { this.agencyProposalsGoal = agencyProposalsGoal; }
    public Integer getAgencyMeetingsGoal() { return agencyMeetingsGoal; }
    public void setAgencyMeetingsGoal(Integer agencyMeetingsGoal) { this.agencyMeetingsGoal = agencyMeetingsGoal; }
    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }
    public String getCrmRules() { return crmRules; }
    public void setCrmRules(String crmRules) { this.crmRules = crmRules; }
}
