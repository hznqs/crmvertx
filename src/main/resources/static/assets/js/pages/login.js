document.addEventListener('DOMContentLoaded', () => {
    window.VXAuth.redirectIfAuthenticated();

    const form = document.getElementById('login-form');
    const error = document.getElementById('login-error');
    const submit = document.getElementById('login-submit');
    const password = document.getElementById('login-password');
    const togglePassword = document.getElementById('toggle-password');
    let cooldownTimer = null;

    function setSubmitLoading(isLoading) {
        submit.disabled = isLoading;
        form.classList.toggle('is-submitting', isLoading);
        submit.textContent = isLoading ? 'Entrando...' : 'Entrar no CRM';
    }

    function startLoginCooldown(seconds) {
        window.clearInterval(cooldownTimer);
        let remaining = Math.min(Math.max(Number(seconds || 60), 1), 900);

        form.classList.add('is-rate-limited');
        submit.disabled = true;
        submit.textContent = `Tente novamente em ${remaining}s`;

        cooldownTimer = window.setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                window.clearInterval(cooldownTimer);
                form.classList.remove('is-rate-limited');
                submit.disabled = false;
                submit.textContent = 'Entrar no CRM';
                return;
            }
            submit.textContent = `Tente novamente em ${remaining}s`;
        }, 1000);
    }

    togglePassword?.addEventListener('click', () => {
        const visible = password.type === 'text';
        password.type = visible ? 'password' : 'text';
        togglePassword.textContent = visible ? 'Mostrar' : 'Ocultar';
        togglePassword.setAttribute('aria-label', visible ? 'Mostrar senha' : 'Ocultar senha');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        error.hidden = true;
        setSubmitLoading(true);

        try {
            const session = await window.VXApi.auth.login({
                email: form.email.value,
                password: form.password.value
            });

            window.VXAuth.save(session);
            window.location.replace('/app.html');
        } catch (err) {
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
