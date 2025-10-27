// La URL base de la API. En un entorno de producción, esto debería ser una variable de entorno.
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM y Variables de Estado ---
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    // Busca el botón que abre el modal de login (puede tener data-bs-target o ser el del menú con ID 'loginMenuBtn')
    const loginButton = document.querySelector('[data-bs-target="#loginPopup"]'); 
    const logoutButton = document.getElementById('logoutButton');
    const loginForm = document.getElementById('loginForm');
    const statusMessage = document.getElementById('statusMessage');
    
    // Inicialización del Modal de Login de Bootstrap
    const loginPopup = document.getElementById('loginPopup') 
        ? new bootstrap.Modal(document.getElementById('loginPopup')) 
        : null;
    
    let token = localStorage.getItem('token');
    let isAuthenticated = !!token;

    // --- Funciones de Utilidad ---

    /** Muestra un mensaje de estado temporal en la UI */
    function showStatusMessage(message, isError = false) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `alert mt-3 ${isError ? 'alert-danger' : 'alert-success'}`;
            statusMessage.style.display = 'block';
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    }

    /** Actualiza la visibilidad de los botones de login/logout en el menú */
    function updateAdminButtons() {
        const loginMenuBtn = document.getElementById('loginMenuBtn');

        if (isAuthenticated) {
            // Usuario autenticado: oculta login, muestra logout
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            // Usuario no autenticado: muestra login, oculta logout
            if (loginMenuBtn) loginMenuBtn.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
    }

    function openLoginModal() {
        if (loginPopup) loginPopup.show();
    }
    
    // --- Lógica de Autenticación (Login/Logout) ---

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            const adminDropMenu = document.getElementById('adminDropMenu');
            if (adminDropMenu) adminDropMenu.classList.toggle('visible');
        });
    }

    // Listener para abrir el modal de login (ya sea por el botón del menú o por cualquier otro con el data-target)
    const loginMenuBtn = document.getElementById('loginMenuBtn');
    if (loginMenuBtn) {
        loginMenuBtn.addEventListener('click', openLoginModal);
    } else if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }

    // Lógica de Logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            isAuthenticated = false;
            updateAdminButtons();
            showStatusMessage('Sesión cerrada correctamente. Recargando página...');
            // Recarga la página después de un breve delay para reflejar los cambios de UI
            setTimeout(() => window.location.reload(), 500); 
        });
    }

    // Lógica de Login (Envío del formulario)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitButton = e.submitter;

            try {
                submitButton.disabled = true;
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.token);
                    isAuthenticated = true;
                    token = data.token; 
                    
                    if (loginPopup) loginPopup.hide();
                    updateAdminButtons();
                    showStatusMessage('¡Login exitoso! Recargando página...');
                    setTimeout(() => window.location.reload(), 500);
                } else {
                    const errorData = await res.json();
                    showStatusMessage(errorData.message || 'Credenciales incorrectas', true);
                }
            } catch (error) {
                console.error('Error de login:', error);
                showStatusMessage('Error de conexión con el servidor.', true);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // Ojo de mostrar/ocultar contraseña (si los elementos existen)
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function (e) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁' : '🔒'; // Cambia el icono
        });
    }
    
    // --- Inicialización General ---

    // Inicializa la visibilidad de los botones de admin/logout al cargar la página
    updateAdminButtons();
});