package br.com.vertxmidia.crm.architecture;

import br.com.vertxmidia.crm.modules.audit.web.AuditController;
import br.com.vertxmidia.crm.modules.billing.web.BillingController;
import br.com.vertxmidia.crm.modules.client.web.ClientController;
import br.com.vertxmidia.crm.modules.client.web.ClientDashboardController;
import br.com.vertxmidia.crm.modules.dashboard.web.DashboardController;
import br.com.vertxmidia.crm.modules.operations.web.ClientPerformanceController;
import br.com.vertxmidia.crm.modules.operations.web.CommissionSaleController;
import br.com.vertxmidia.crm.modules.operations.web.ContractController;
import br.com.vertxmidia.crm.modules.operations.web.CrmEventController;
import br.com.vertxmidia.crm.modules.operations.web.DeliveryController;
import br.com.vertxmidia.crm.modules.operations.web.FinanceEntryController;
import br.com.vertxmidia.crm.modules.operations.web.GoalController;
import br.com.vertxmidia.crm.modules.operations.web.TeamMemberController;
import br.com.vertxmidia.crm.modules.organization.web.OrganizationController;
import br.com.vertxmidia.crm.modules.settings.web.CrmSettingsController;
import br.com.vertxmidia.crm.modules.upload.web.UploadController;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import static org.assertj.core.api.Assertions.assertThat;

class ControllerSecurityAnnotationTest {

    @Test
    void protectedApiControllersUseMethodLevelPreAuthorize() {
        List<Class<?>> controllers = List.of(
                AuditController.class,
                BillingController.class,
                ClientController.class,
                ClientDashboardController.class,
                DashboardController.class,
                ClientPerformanceController.class,
                CommissionSaleController.class,
                ContractController.class,
                CrmEventController.class,
                DeliveryController.class,
                FinanceEntryController.class,
                GoalController.class,
                TeamMemberController.class,
                OrganizationController.class,
                CrmSettingsController.class,
                UploadController.class
        );

        List<String> unsecuredMethods = controllers.stream()
                .flatMap(controller -> Arrays.stream(controller.getDeclaredMethods())
                        .filter(this::isEndpointMethod)
                        .filter(method -> method.getAnnotation(PreAuthorize.class) == null)
                        .map(method -> controller.getSimpleName() + "#" + method.getName()))
                .toList();

        assertThat(unsecuredMethods).isEmpty();
    }

    @Test
    void mutatingEndpointsAreNotAssignedToReadOnlyRolesOnly() {
        List<Class<?>> controllers = List.of(
                ClientController.class,
                ClientDashboardController.class,
                ClientPerformanceController.class,
                CommissionSaleController.class,
                ContractController.class,
                CrmEventController.class,
                DeliveryController.class,
                FinanceEntryController.class,
                GoalController.class,
                TeamMemberController.class,
                OrganizationController.class,
                CrmSettingsController.class,
                UploadController.class
        );

        List<String> unsafeRolePolicies = controllers.stream()
                .flatMap(controller -> Arrays.stream(controller.getDeclaredMethods())
                        .filter(this::isMutatingEndpointMethod)
                        .filter(method -> {
                            PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);
                            return preAuthorize == null || (!preAuthorize.value().contains("ADMIN") && !preAuthorize.value().contains("GESTOR"));
                        })
                        .map(method -> controller.getSimpleName() + "#" + method.getName()))
                .toList();

        assertThat(unsafeRolePolicies).isEmpty();
    }

    private boolean isEndpointMethod(Method method) {
        return method.getAnnotation(GetMapping.class) != null
                || method.getAnnotation(PostMapping.class) != null
                || method.getAnnotation(PutMapping.class) != null
                || method.getAnnotation(PatchMapping.class) != null
                || method.getAnnotation(DeleteMapping.class) != null;
    }

    private boolean isMutatingEndpointMethod(Method method) {
        return method.getAnnotation(PostMapping.class) != null
                || method.getAnnotation(PutMapping.class) != null
                || method.getAnnotation(PatchMapping.class) != null
                || method.getAnnotation(DeleteMapping.class) != null;
    }
}
