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

    @Column(name = "default_revenue_goal", nullable = false, precision = 14, scale = 2)
    private BigDecimal defaultRevenueGoal = BigDecimal.ZERO;

    @Column(name = "default_profit_margin", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultProfitMargin = BigDecimal.ZERO;

    @Column(columnDefinition = "text")
    private String preferences;

    public UUID getId() { return id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyEmail() { return companyEmail; }
    public void setCompanyEmail(String companyEmail) { this.companyEmail = companyEmail; }
    public String getCompanyPhone() { return companyPhone; }
    public void setCompanyPhone(String companyPhone) { this.companyPhone = companyPhone; }
    public BigDecimal getDefaultRevenueGoal() { return defaultRevenueGoal; }
    public void setDefaultRevenueGoal(BigDecimal defaultRevenueGoal) { this.defaultRevenueGoal = defaultRevenueGoal; }
    public BigDecimal getDefaultProfitMargin() { return defaultProfitMargin; }
    public void setDefaultProfitMargin(BigDecimal defaultProfitMargin) { this.defaultProfitMargin = defaultProfitMargin; }
    public String getPreferences() { return preferences; }
    public void setPreferences(String preferences) { this.preferences = preferences; }
}
