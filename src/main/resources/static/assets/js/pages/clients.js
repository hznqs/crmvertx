(function () {
    async function updateClientPhase(clientId, phase) {
        if (!window.VXApi?.clients?.updatePhase) {
            throw new Error('API de clientes indisponivel.');
        }
        return window.VXApi.clients.updatePhase(clientId, phase);
    }

    window.VXClientsPage = {
        updateClientPhase
    };
})();
