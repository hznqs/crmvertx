document.addEventListener('DOMContentLoaded', () => {
    window.VXAuth.redirectIfAuthenticated();

    const form = document.getElementById('login-form');
    const error = document.getElementById('login-error');
    const attemptsMessage = document.getElementById('login-attempts');
    const submit = document.getElementById('login-submit');
    const submitLabel = submit?.querySelector('[data-submit-label]');
    const password = document.getElementById('login-password');
    const togglePassword = document.getElementById('toggle-password');
    let cooldownTimer = null;
    let failedAttempts = Number(sessionStorage.getItem('vx_login_attempts') || 0);

    function setSubmitLoading(isLoading) {
        submit.disabled = isLoading;
        form.classList.toggle('is-submitting', isLoading);
        if (submitLabel) {
            submitLabel.textContent = isLoading ? 'Entrando...' : 'Entrar no CRM';
        }
    }

    function setAttemptsMessage() {
        if (!attemptsMessage) return;
        if (failedAttempts <= 0) {
            attemptsMessage.hidden = true;
            attemptsMessage.textContent = '';
            return;
        }
        attemptsMessage.hidden = false;
        attemptsMessage.textContent = failedAttempts >= 3
            ? `Tentativa ${failedAttempts}. Por seguranca, novas falhas podem acionar bloqueio temporario.`
            : `Tentativa ${failedAttempts}. Verifique email e senha antes de tentar novamente.`;
    }

    function shakeForm() {
        form.classList.remove('auth-shake');
        void form.offsetWidth;
        form.classList.add('auth-shake');
    }

    function startLoginCooldown(seconds) {
        window.clearInterval(cooldownTimer);
        let remaining = Math.min(Math.max(Number(seconds || 60), 1), 900);

        form.classList.add('is-rate-limited');
        submit.disabled = true;
        if (submitLabel) submitLabel.textContent = `Tente novamente em ${remaining}s`;

        cooldownTimer = window.setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                window.clearInterval(cooldownTimer);
                form.classList.remove('is-rate-limited');
                submit.disabled = false;
                if (submitLabel) submitLabel.textContent = 'Entrar no CRM';
                return;
            }
            if (submitLabel) submitLabel.textContent = `Tente novamente em ${remaining}s`;
        }, 1000);
    }

    togglePassword?.addEventListener('click', () => {
        const visible = password.type === 'text';
        password.type = visible ? 'password' : 'text';
        togglePassword.textContent = visible ? 'Mostrar' : 'Ocultar';
        togglePassword.setAttribute('aria-label', visible ? 'Mostrar senha' : 'Ocultar senha');
    });

    setAttemptsMessage();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        error.hidden = true;

        const email = form.email.value.trim();
        const rawPassword = form.password.value;
        if (!email || !rawPassword) {
            shakeForm();
            error.textContent = 'Informe email e senha para continuar.';
            error.hidden = false;
            (!email ? form.email : form.password).focus();
            return;
        }

        setSubmitLoading(true);

        try {
            const session = await window.VXApi.auth.login({
                email,
                password: rawPassword
            });

            window.VXAuth.save(session);
            sessionStorage.removeItem('vx_login_attempts');
            window.location.replace('/app.html');
        } catch (err) {
            failedAttempts += 1;
            sessionStorage.setItem('vx_login_attempts', String(failedAttempts));
            setAttemptsMessage();
            shakeForm();
            error.textContent = err.message || 'Nao foi possivel fazer login.';
            error.hidden = false;
            if (err.status === 429) {
                startLoginCooldown(err.retryAfterSeconds);
                return;
            }
        } finally {
            if (!form.classList.contains('is-rate-limited')) {
                setSubmitLoading(false);
            }
        }
    });
});
