package br.com.vertxmidia.crm.modules.services.dto;

import br.com.vertxmidia.crm.modules.services.domain.ServiceBillingType;
import br.com.vertxmidia.crm.modules.services.domain.ServiceCategory;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ServiceOfferingRequest(
        @NotBlank @Size(max = 160) String name,
        @NotNull ServiceCategory category,
        @Size(max = 8000) String description,
        @NotNull ServiceBillingType billingType,
        @NotNull @DecimalMin("0.00") @Digits(integer = 12, fraction = 2) BigDecimal basePrice,
        @NotNull @Min(0) @Max(3650) Integer slaDays,
        @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal estimatedHours,
        @Size(max = 10000) String defaultChecklist,
        @Size(max = 10000) String deliveryStages,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal commissionPercentage,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal grossMarginPercentage,
        Boolean active
) {
    @AssertTrue(message = "Servicos com cobranca definida precisam ter preco maior que zero")
    public boolean hasPriceWhenBillingIsDefined() {
        return billingType == ServiceBillingType.PERSONALIZADO
                || (basePrice != null && basePrice.compareTo(BigDecimal.ZERO) > 0);
    }

    @AssertTrue(message = "A comissao nao pode ser maior que a margem bruta")
    public boolean hasCommissionInsideMargin() {
        if (commissionPercentage == null || grossMarginPercentage == null) {
            return true;
        }
        return grossMarginPercentage.compareTo(BigDecimal.ZERO) == 0
                || commissionPercentage.compareTo(grossMarginPercentage) <= 0;
    }
}
