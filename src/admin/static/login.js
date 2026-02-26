document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Clear previous errors
    errorDiv.textContent = '';
    errorDiv.classList.remove('show');
    
    // Disable button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Проверка...';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',  // Include cookies for session
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Success - redirect to dashboard
            submitBtn.textContent = '✅ Вход выполнен!';
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        } else {
            // Login failed
            errorDiv.textContent = data.error || 'Неправильный пароль. Попробуйте ещё раз.';
            errorDiv.classList.add('show');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти в панель управления';
            document.getElementById('password').focus();
        }
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = '❌ Ошибка подключения к серверу. Попробуйте ещё раз.';
        errorDiv.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Войти в панель управления';
    }
});
