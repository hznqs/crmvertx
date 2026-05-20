(function () {
    function value(id) {
        return document.getElementById(id)?.value || '';
    }

    function profilePayload(photoUrl = value('profile-photo-url')) {
        return {
            name: value('profile-name'),
            position: value('profile-position'),
            photoUrl
        };
    }

    async function saveProfile() {
        return window.VXApi.auth.updateProfile(profilePayload());
    }

    async function changePassword() {
        const nextPassword = value('password-new');
        const confirmation = value('password-confirm');
        if (nextPassword !== confirmation) {
            throw new Error('A confirmacao da nova senha nao confere.');
        }
        if (!isStrongPassword(nextPassword)) {
            throw new Error('A nova senha deve ter 8+ caracteres, letra maiuscula, minuscula e numero.');
        }
        return window.VXApi.auth.changePassword({
            currentPassword: value('password-current'),
            newPassword: nextPassword
        });
    }

    function isStrongPassword(password) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password || '');
    }

    function passwordScore(password) {
        const value = password || '';
        return [
            value.length >= 8,
            /[a-z]/.test(value),
            /[A-Z]/.test(value),
            /\d/.test(value),
            /[^A-Za-z0-9]/.test(value)
        ].filter(Boolean).length;
    }

    function updatePasswordStrength() {
        const password = value('password-new');
        const confirmation = value('password-confirm');
        const bar = document.getElementById('password-strength-bar');
        const text = document.getElementById('password-strength-text');
        if (!bar || !text) return;

        const score = passwordScore(password);
        const strong = isStrongPassword(password);
        const matches = !confirmation || password === confirmation;
        const width = Math.min(score * 20, 100);
        bar.style.width = `${width}%`;
        bar.className = `block h-full rounded-full transition-all ${strong && matches ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`;
        text.textContent = !matches
            ? 'A confirmacao precisa ser igual a nova senha.'
            : strong
                ? 'Senha forte o suficiente para atualizar.'
                : 'Use pelo menos 8 caracteres, letra maiuscula, minuscula e numero.';
        text.classList.toggle('text-red-400', !matches && Boolean(confirmation));
        text.classList.toggle('text-green-400', strong && matches);
    }

    async function uploadPhoto(file, userId) {
        const document = await window.VXApi.uploads.create(file, { entityType: 'profile', entityId: userId });
        return window.VXApi.auth.updateProfile(profilePayload(document.publicUrl));
    }

    window.VXProfilePage = {
        profilePayload,
        saveProfile,
        changePassword,
        uploadPhoto
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('password-new')?.addEventListener('input', updatePasswordStrength);
        document.getElementById('password-confirm')?.addEventListener('input', updatePasswordStrength);
    });
})();
