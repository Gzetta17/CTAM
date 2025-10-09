// La URL base de la API. En un entorno de producción, esto debería ser una variable de entorno.
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM y Variables de Estado ---
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const loginButton = document.querySelector('[data-bs-target="#loginPopup"]');
    const logoutButton = document.getElementById('logoutButton');
    const loginForm = document.getElementById('loginForm');
    const statusMessage = document.getElementById('statusMessage');
    
    // Elementos de la funcionalidad de Comercios (solo existen en single.html)
    const agregarComercioBtn = document.getElementById('agregarComercioBtn');
    const comerciosContainer = document.getElementById('comerciosContainer');
    const agregarComercioForm = document.getElementById('agregarComercioForm');
    const editarComercioForm = document.getElementById('editarComercioForm');

    // Inicialización de Modales de Bootstrap
    // Usamos ternarios para evitar errores si el modal no existe en la página actual (ej: comercio_detalle.html)
    const loginPopup = document.getElementById('loginPopup') 
        ? new bootstrap.Modal(document.getElementById('loginPopup')) 
        : null;
    const editarComercioModal = document.getElementById('editarComercioModal') 
        ? new bootstrap.Modal(document.getElementById('editarComercioModal')) 
        : null;
    const agregarComercioModal = document.getElementById('agregarComercioModal') 
        ? new bootstrap.Modal(document.getElementById('agregarComercioModal')) 
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

    /** Construye la URL completa de la imagen */
    function buildImageUrl(imagePath) {
        if (!imagePath) {
            return 'https://placehold.co/600x400?text=Imagen+No+Disponible';
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `${API_BASE}${cleanPath}`;
    }

    /** Actualiza la visibilidad de los botones de administración */
    function updateAdminButtons() {
        // En el menú principal
        const loginMenuBtn = document.getElementById('loginMenuBtn');
        if (isAuthenticated) {
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
        } else {
            if (loginMenuBtn) loginMenuBtn.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
        }
        // En la página de comercios (single.html)
        const agregarNoticiaBtn = document.getElementById('agregarNoticiaBtn');
        if (agregarComercioBtn) {
            agregarComercioBtn.style.display = isAuthenticated ? 'block' : 'none';
        }
        if (agregarNoticiaBtn) {
            agregarNoticiaBtn.style.display = isAuthenticated ? 'block' : 'none';
        }

        // Si hay un contenedor de comercios, se debe recargar para mostrar/ocultar botones CRUD
        if (comerciosContainer) {
            loadComercios();
        }
    }

    function openLoginModal() {
        if (loginPopup) loginPopup.show();
    }
    
    function openAgregarComercioModal() {
        if (agregarComercioModal) agregarComercioModal.show();
    }

    function openEditarComercioModal(comercioId) {
        const comercioIdField = document.getElementById('editarComercioId');
        if (comercioIdField) comercioIdField.value = comercioId;
        if (editarComercioModal) editarComercioModal.show();
    }

    // Función de confirmación customizada para evitar alert/confirm nativos
    let currentConfirmationAction = null;
    function showConfirmation(message, callback) {
        // Asegúrate de que el modal de confirmación existe en tu HTML (no incluido aquí)
        const confirmModalElement = document.getElementById('confirmModal');
        if (!confirmModalElement) {
             console.error("El modal de confirmación 'confirmModal' no está en el HTML.");
             callback(false); // Fallback a no confirmar
             return;
        }

        const confirmModal = new bootstrap.Modal(confirmModalElement);
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (confirmMessage) confirmMessage.textContent = message;

        // Limpiar listeners anteriores
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;

        confirmBtn.onclick = () => {
            confirmModal.hide();
            if (typeof callback === 'function') callback(true);
        };
        cancelBtn.onclick = () => {
            confirmModal.hide();
            if (typeof callback === 'function') callback(false);
        };

        confirmModal.show();
    }
    

    // --- Lógica de Autenticación (Login/Logout) ---

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            const adminDropMenu = document.getElementById('adminDropMenu');
            if (adminDropMenu) adminDropMenu.classList.toggle('visible');
        });
    }

    // Aquí se corrige el listener de loginButton para usar el ID 'loginMenuBtn' si existe.
    const loginMenuBtn = document.getElementById('loginMenuBtn');
    if (loginMenuBtn) {
        loginMenuBtn.addEventListener('click', openLoginModal);
    } else if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            isAuthenticated = false;
            updateAdminButtons();
            showStatusMessage('Sesión cerrada correctamente. Recargando página...');
            setTimeout(() => window.location.reload(), 500); 
        });
    }

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

    // Ojo de mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function (e) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁' : '🔒'; // Cambia el icono
        });
    }
    
    // --- Lógica de Gestión de Comercios (CRUD) ---

    const deleteItem = async (id) => {
        if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
        
        showConfirmation('¿Estás seguro de que deseas eliminar este comercio?', async (isConfirmed) => {
            if (!isConfirmed) return; 

            try {
                const response = await fetch(`${API_BASE}/api/comercios/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    showStatusMessage('Comercio eliminado correctamente.');
                    loadComercios();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Error al eliminar el comercio.');
                }
            } catch (error) {
                console.error('Error al eliminar el comercio:', error);
                showStatusMessage('Ocurrió un error al intentar eliminar el comercio.', true);
            }
        });
    };
    
    if (agregarComercioBtn) {
        agregarComercioBtn.addEventListener('click', openAgregarComercioModal);
    }
    
    if (agregarComercioForm) {
        agregarComercioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
            
            const formData = new FormData(agregarComercioForm); 
            
            const submitBtn = e.submitter;
            submitBtn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/api/comercios`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (res.ok) {
                    showStatusMessage('Comercio agregado exitosamente');
                    if (agregarComercioModal) agregarComercioModal.hide();
                    agregarComercioForm.reset();
                    loadComercios();
                } else {
                    const errorData = await res.json();
                    showStatusMessage(`Error: ${errorData.message || 'Verifica los datos.'}`, true);
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                showStatusMessage('Error de conexión con la API.', true);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
    
    if (editarComercioForm) {
        editarComercioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
            
            const comercioId = document.getElementById('editarComercioId').value;
            if (!comercioId) return showStatusMessage('ID de comercio no encontrado.', true);
            
            const formData = new FormData(editarComercioForm); 
            
            const imagenInput = document.getElementById('editarComercioImagen');
            
            // Si no hay archivo de imagen seleccionado, elimino el campo 'imagen' del FormData
            if (!imagenInput || imagenInput.files.length === 0) {
                 formData.delete('imagen');
            }
            
            const submitBtn = e.submitter;
            submitBtn.disabled = true;

            try {
                const res = await fetch(`${API_BASE}/api/comercios/${comercioId}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData, // Envía FormData directamente
                });

                if (res.ok) {
                    showStatusMessage('Comercio editado exitosamente');
                    if (editarComercioModal) editarComercioModal.hide();
                    loadComercios();
                } else {
                    const errorData = await res.json();
                    showStatusMessage(`Error: ${errorData.message || 'Verifica los datos.'}`, true);
                }
            } catch (error) {
                console.error('Error al enviar el formulario de edición:', error);
                showStatusMessage('Error de conexión con la API.', true);
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // --- Lógica de Renderizado y Carga (READ) ---

    /** Renderiza las tarjetas de comercios en el contenedor */
    const renderComercios = (container, items) => {
        if (!container) return;
        container.innerHTML = '';
        const noContent = document.getElementById('no-content');

        if (items.length === 0) {
            if (noContent) noContent.style.display = 'block';
            return;
        }
        if (noContent) noContent.style.display = 'none';


        items.forEach(item => {
            const imageUrl = buildImageUrl(item.imagen);
            const cardWrapper = document.createElement('div');
            // Mantiene 3 tarjetas por fila en desktop (col-lg-4) y 2 en tablet (col-md-6)
            cardWrapper.className = 'col-sm-6 col-md-6 col-lg-4 mb-4'; 
            
            const card = document.createElement('div');
            card.className = 'comercioCard shadow-sm h-100 rounded-lg overflow-hidden w-100'; 

            // MODIFICACIÓN CLAVE: Se usa Bootstrap Aspect Ratio (ratio ratio-4x3) para forzar un marco más vertical (4 alto por 3 ancho)
            // Esto asegura que la imagen siempre se renderice en una proporción alta sin estirarse.
            card.innerHTML = `
                <a href="comercio_detalle.html?id=${item._id}" class="card-image-link d-block ratio ratio-4x3">
                    <img src="${imageUrl}" class="card-img-top w-100 h-100 object-cover" alt="${item.nombre}" onerror="this.src='https://placehold.co/600x800?text=Imagen+no+disponible'">
                </a>
                <div class="card-body">
                    <h3 class="card-title">${item.nombre}</h3>
                </div>
                ${isAuthenticated ? `
                    <div class="card-footer d-flex justify-content-between p-2">
                        <button class="btn btn-warning btn-sm editar-btn w-50 me-1" data-id="${item._id}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminar-btn w-50 ms-1" data-id="${item._id}">Eliminar</button>
                    </div>
                ` : ''}
            `;
            
            cardWrapper.appendChild(card);
            container.appendChild(cardWrapper);
        });

        if (isAuthenticated) {
            container.querySelectorAll('.editar-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    await loadComercioDataForEdit(id);
                    openEditarComercioModal(id);
                });
            });

            container.querySelectorAll('.eliminar-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteItem(e.target.dataset.id));
            });
        }
    };

    /** Carga los datos de un comercio específico y los rellena en el formulario de edición */
    const loadComercioDataForEdit = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/comercios/${id}`);
            if (!res.ok) throw new Error('No se pudo cargar el comercio.');
            
            const item = await res.json();
            
            console.log("Objeto completo para edición:", item); 

            // Rellenar campos del modal de edición
            document.getElementById('editarComercioId').value = id;
            document.getElementById('editarComercioNombre').value = item.nombre || '';
            document.getElementById('editarComercioCategoria').value = item.categoria || ''; 
            
            // USO CLAVE DE LA DESCRIPCIÓN para rellenar el formulario de edición
            document.getElementById('editarComercioDescripcion').value = item.descripcion || item.detalle || item.info || '';

            // El input de la imagen debe ser vaciado por seguridad, no se rellena.
            const imagenInput = document.getElementById('editarComercioImagen');
            if (imagenInput) imagenInput.value = '';
            
        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            showStatusMessage('No se pudieron cargar los datos del comercio.', true);
        }
    };

    /** Carga la lista completa de comercios (usada en single.html) */
    const loadComercios = async () => {
        if (!comerciosContainer) return;
        try {
            const res = await fetch(`${API_BASE}/api/comercios`);
            const comercios = await res.json();
            renderComercios(comerciosContainer, comercios);
        } catch (error) {
            console.error('Error al cargar los comercios:', error);
            comerciosContainer.innerHTML = '<p class="text-danger w-100 text-center mt-5">Error al cargar los comercios. Revisa la conexión con el servidor.</p>';
        }
    };

    /** Función: Carga los detalles de un solo comercio en la página de detalle (usada en comercio_detalle.html) */
    async function loadDetails() {
        // Elementos de estado
        const mainContent = document.getElementById('main-content');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        // Elementos de contenido (deben existir en comercio_detalle.html)
        const titleElement = document.getElementById('itemTitle');
        const categoryElement = document.getElementById('itemCategory');
        const imageElement = document.getElementById('itemImage');
        const descriptionElement = document.getElementById('itemDescription'); 
        
        // Asegurarse de que estamos en la página correcta y tenemos los elementos base
        if (!titleElement || !categoryElement || !imageElement || !descriptionElement) {
             console.log("No estamos en la página de detalle o faltan elementos DOM clave.");
             return;
        }
        if (!mainContent || !loadingMessage || !errorMessage) return;


        // Mostrar carga
        loadingMessage.style.display = 'block';
        mainContent.style.display = 'none';
        errorMessage.style.display = 'none';

        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');

        if (!itemId) {
            loadingMessage.style.display = 'none';
            errorMessage.textContent = 'Error: ID de comercio no especificado en la URL.';
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/comercios/${itemId}`);
            if (!res.ok) throw new Error('Comercio no encontrado.');

            const item = await res.json();
            
            // El log de diagnóstico es crucial para el usuario final
            console.log("Datos del Comercio recibidos para el detalle:", item);

            // Rellenar los datos
            titleElement.textContent = item.nombre || '';
            categoryElement.textContent = item.categoria || '';
            
            // MODIFICACIÓN CLAVE: PRIORIZA 'descripcion', que es el nombre del campo en el modal de 'single.html'
            descriptionElement.textContent = item.descripcion || item.detalle || item.info || 'Sin descripción disponible.'; 
            
            imageElement.src = buildImageUrl(item.imagen);
            imageElement.alt = item.nombre;
            imageElement.onerror = () => { 
                imageElement.src = 'https://placehold.co/600x400?text=Imagen+No+Disponible';
            };
            
            // Éxito: Ocultar la carga y mostrar el contenido
            loadingMessage.style.display = 'none';
            mainContent.style.display = 'block';
            
        } catch (error) {
            console.error('Error al obtener los detalles:', error);
            
            // Error: Ocultar la carga y mostrar el mensaje de error
            loadingMessage.style.display = 'none';
            errorMessage.textContent = `Error al cargar los detalles: ${error.message}. Verifica el servidor de la API.`;
            errorMessage.style.display = 'block';
        }
    }

    // --- Inicialización General ---

    // Inicializa la visibilidad de los botones de admin/logout
    updateAdminButtons();
    
    // Determina qué función de carga ejecutar según la página
    const path = window.location.pathname;
    
    if (path.includes('comercio_detalle.html')) {
        // Ejecuta la función de detalle para llenar comercio_detalle.html
        loadDetails();
    } else if (path.includes('single.html')) {
        // Ejecuta la función de carga de listado para single.html
        loadComercios();
    }
});
