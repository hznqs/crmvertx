package br.com.vertxmidia.crm.modules.client.domain;

import java.util.Arrays;

public enum ClientPhase {
    PROSPECCAO("prospeccao"),
    NEGOCIACAO("negociacao"),
    FECHADO("fechado"),
    FOLLOWUP("followup"),
    PERDIDO("perdido");

    private final String value;

    ClientPhase(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static ClientPhase from(String value) {
        return Arrays.stream(values())
                .filter(phase -> phase.value.equals(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Fase comercial invalida"));
    }
}
