// La URL base de la API. En un entorno de producción, esto debería ser una variable de entorno.
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM y Variables de Estado ---
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const adminDropMenu = document.getElementById('adminDropMenu'); // Se mantiene por si se usa en el HTML
    const loginButton = document.querySelector('[data-bs-target="#loginPopup"]');
    const logoutButton = document.getElementById('logoutButton');
    const loginForm = document.getElementById('loginForm');
    const statusMessage = document.getElementById('statusMessage');
    
    // Elementos de la nueva funcionalidad de Promociones
    const agregarPromocionBtn = document.getElementById('agregarPromocionBtn');
    const promocionesContainer = document.getElementById('promocionesContainer');
    const agregarPromocionForm = document.getElementById('agregarPromocionForm'); // Asume que tienes este formulario
    const editarPromocionForm = document.getElementById('editarPromocionForm'); // Asume que tienes este formulario

    // Inicialización de Modales de Bootstrap (Asegúrate de tener estos IDs en tu HTML)
    const loginPopup = document.getElementById('loginPopup') 
        ? new bootstrap.Modal(document.getElementById('loginPopup')) 
        : null;
    const editarPromocionModal = document.getElementById('editarPromocionModal') 
        ? new bootstrap.Modal(document.getElementById('editarPromocionModal')) 
        : null;
    const agregarPromocionModal = document.getElementById('agregarPromocionModal') 
        ? new bootstrap.Modal(document.getElementById('agregarPromocionModal')) 
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

    /** * Construye la URL completa de la imagen. 
     * @param {string} imagePath - La ruta relativa de la imagen devuelta por la API (ej: 'uploads/file.jpg')
     * @returns {string} La URL completa (ej: 'http://localhost:3000/uploads/file.jpg')
     */
    function buildImageUrl(imagePath) {
        if (!imagePath) {
            // Retorna un placeholder genérico si no hay ruta
            return 'https://placehold.co/600x400?text=Imagen+No+Disponible';
        }
        
        // 1. Asegura que la ruta de la imagen inicie con /
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        // 2. Construye la URL completa.
        return `${API_BASE}${cleanPath}`;
    }


    /** Actualiza la visibilidad de los botones de administración según el estado de autenticación */
    function updateAdminButtons() {
        if (isAuthenticated) {
            if (loginButton) loginButton.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            if (agregarPromocionBtn) agregarPromocionBtn.style.display = 'block';
        } else {
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (agregarPromocionBtn) agregarPromocionBtn.style.display = 'none';
        }
    }

    function openLoginModal() {
        if (loginPopup) loginPopup.show();
    }
    
    /** Abre el modal para agregar una nueva promoción */
    function openAgregarPromocionModal() {
        if (agregarPromocionModal) agregarPromocionModal.show();
    }

    /** * Abre el modal de edición de promoción y prepara el campo ID.
     */
    function openEditarPromocionModal(promocionId) {
        // NOTA: Debes tener un campo oculto en el formulario de edición con ID 'editarPromocionId'
        const promocionIdField = document.getElementById('editarPromocionId');
        if (promocionIdField) promocionIdField.value = promocionId;
        
        if (editarPromocionModal) editarPromocionModal.show();
    }

    // --- Lógica de Autenticación (Login/Logout) ---

    // Toggle para el menú de administrador (si existe)
    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            if (adminDropMenu) adminDropMenu.classList.toggle('visible');
        });
    }

    // Botón para abrir el modal de login
    if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }

    // Botón de CERRAR SESIÓN
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            isAuthenticated = false;
            updateAdminButtons();
            showStatusMessage('Sesión cerrada correctamente. Recargando página...');
            setTimeout(() => window.location.reload(), 500); 
        });
    }

    // Manejo del formulario de INICIO DE SESIÓN
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
                    const errorMessage = errorData.message || 'Credenciales incorrectas';
                    showStatusMessage(errorMessage, true);
                }
            } catch (error) {
                console.error('Error de login:', error);
                showStatusMessage('Error de conexión con el servidor. Por favor, inténtalo de nuevo más tarde.', true);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // --- Lógica de Gestión de Promociones (CRUD) ---

    /** Elimina una promoción por ID */
    const deletePromocion = async (id) => {
        if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
        
        // Se asume que la UI tiene un modal de confirmación, aquí solo se ejecuta la lógica de eliminación.
        console.log(`Intentando eliminar promoción con ID: ${id}`); 

        try {
            // Endpoint cambiado a /api/promociones
            const response = await fetch(`${API_BASE}/api/promociones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showStatusMessage('Promoción eliminada correctamente.');
                loadPromociones(); // Recargar la lista
            } else {
                throw new Error('Error al eliminar la promoción.');
            }
        } catch (error) {
            console.error('Error al eliminar la promoción:', error);
            showStatusMessage('Ocurrió un error al intentar eliminar la promoción.', true);
        }
    };
    
    // Manejador del botón para AGREGAR promoción
    if (agregarPromocionBtn) {
        agregarPromocionBtn.addEventListener('click', openAgregarPromocionModal);
    }
    
    /** Manejador del formulario para AGREGAR promoción */
    if (agregarPromocionForm) {
        agregarPromocionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
            
            const formData = new FormData();
            // Nombres de campos adaptados a la entidad Promoción
            formData.append('titulo', document.getElementById('promocionTitulo').value);
            formData.append('descripcion', document.getElementById('promocionDescripcion').value);
            
            // Asegúrate de que el input de archivo tenga el ID 'promocionImagen'
            const imagenInput = document.getElementById('promocionImagen');
            if (imagenInput && imagenInput.files.length > 0) {
                formData.append('imagen', imagenInput.files[0]);
            }

            try {
                // Endpoint cambiado a /api/promociones
                const res = await fetch(`${API_BASE}/api/promociones`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (res.ok) {
                    showStatusMessage('Promoción agregada exitosamente');
                    if (agregarPromocionModal) agregarPromocionModal.hide();
                    agregarPromocionForm.reset();
                    loadPromociones(); // Recargar la lista
                } else {
                    const errorData = await res.json();
                    showStatusMessage(`Error al agregar la promoción: ${errorData.message || 'Verifica los datos.'}`, true);
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                showStatusMessage('Error de conexión con la API.', true);
            }
        });
    }
    
    /** Manejador del formulario para EDITAR promoción */
    if (editarPromocionForm) {
        editarPromocionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthenticated) return showStatusMessage('No estás autenticado.', true);
            
            // ID del campo oculto cambiado
            const promocionId = document.getElementById('editarPromocionId').value;
            if (!promocionId) return showStatusMessage('ID de promoción no encontrado para edición.', true);
            
            const formData = new FormData();
            // Nombres de campos adaptados a la entidad Promoción
            formData.append('titulo', document.getElementById('editarPromocionTitulo').value);
            formData.append('descripcion', document.getElementById('editarPromocionDescripcion').value);
            
            const imagenInput = document.getElementById('editarPromocionImagen');
            if (imagenInput && imagenInput.files.length > 0) {
                formData.append('imagen', imagenInput.files[0]);
            }
            
            try {
                // Endpoint cambiado a /api/promociones
                const res = await fetch(`${API_BASE}/api/promociones/${promocionId}`, {
                    method: 'PUT', // o 'PATCH', dependiendo de tu API
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });

                if (res.ok) {
                    showStatusMessage('Promoción editada exitosamente');
                    if (editarPromocionModal) editarPromocionModal.hide();
                    loadPromociones();
                } else {
                    const errorData = await res.json();
                    showStatusMessage(`Error al editar la promoción: ${errorData.message || 'Verifica los datos.'}`, true);
                }
            } catch (error) {
                console.error('Error al enviar el formulario de edición:', error);
                showStatusMessage('Error de conexión con la API.', true);
            }
        });
    }

    // --- Lógica de Renderizado y Carga (READ) ---

    /** Renderiza las tarjetas de promociones en el contenedor */
    const renderPromociones = (container, items) => {
        if (!container) return;
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = '<p class="text-center w-full">No hay promociones disponibles en esta sección.</p>';
            return;
        }

        items.forEach(item => {
            const imageUrl = buildImageUrl(item.imagen);

            const card = document.createElement('div');
            card.className = 'promocionCard'; // Cambiado a promocionCard

            card.innerHTML = `
                <a href="promocion_detalle.html?id=${item._id}">
                    <img src="${imageUrl}" class="card-img-top" alt="${item.titulo}" onerror="this.src='https://placehold.co/600x400?text=Imagen+no+disponible'">
                    <h3>${item.titulo}</h3>
                    <p>${item.descripcion}</p>
                </a>
                ${isAuthenticated ? `
                    <div class="buttons">
                        <button class="btn btn-warning btn-sm editar-btn" data-id="${item._id}">Editar</button>
                        <button class="btn btn-danger btn-sm eliminar-btn" data-id="${item._id}">Eliminar</button>
                    </div>
                ` : ''}
            `;
            container.appendChild(card);
        });

        // Adjuntar eventos a los botones de administración
        if (isAuthenticated) {
            container.querySelectorAll('.editar-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    await loadPromocionDataForEdit(id); // Función renombrada
                    openEditarPromocionModal(id); // Función renombrada
                });
            });

            container.querySelectorAll('.eliminar-btn').forEach(button => {
                button.addEventListener('click', (e) => deletePromocion(e.target.dataset.id)); // Función renombrada
            });
        }
    };

    /** Carga los datos de una promoción específica y los rellena en el formulario de edición */
    const loadPromocionDataForEdit = async (id) => {
        try {
            // Endpoint cambiado a /api/promociones
            const res = await fetch(`${API_BASE}/api/promociones/${id}`);
            if (!res.ok) throw new Error('No se pudo cargar la promoción para edición.');
            
            const item = await res.json();

            // Rellena los campos del formulario de edición (IDs de campos cambiados)
            document.getElementById('editarPromocionId').value = id;
            document.getElementById('editarPromocionTitulo').value = item.titulo || '';
            document.getElementById('editarPromocionDescripcion').value = item.descripcion || '';
            
            // Opcional: mostrar la imagen actual en el modal
            const currentImage = document.getElementById('currentPromocionImage');
            if (currentImage) {
                currentImage.src = buildImageUrl(item.imagen);
                currentImage.style.display = 'block';
            }

        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            showStatusMessage('No se pudieron cargar los datos de la promoción.', true);
        }
    };


    /** Carga la lista completa de promociones */
    const loadPromociones = async () => {
        try {
            // Endpoint cambiado a /api/promociones
            const res = await fetch(`${API_BASE}/api/promociones`);
            const promociones = await res.json();
            if (promocionesContainer) renderPromociones(promocionesContainer, promociones);
        } catch (error) {
            // **IMPORTANTE PARA DEPURAR:** Añadimos un console.log claro del error de la API
            console.error('Error al cargar las promociones:', error);
            if (promocionesContainer) promocionesContainer.innerHTML = '<p class="text-danger">Error al cargar las promociones. Revisa la consola del servidor (backend) para configurar la ruta de archivos estáticos.</p>';
        }
    };

    /** Carga los detalles de una sola promoción */
    async function loadDetails() {
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');
        const contentContainer = document.getElementById('main-content');
        const titleElement = document.getElementById('itemTitle');
        const categoryElement = document.getElementById('itemCategory');
        const imageElement = document.getElementById('itemImage');
        
        if (!contentContainer) return;

        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');

        if (!itemId) {
            if (errorMessage) errorMessage.textContent = 'Error: ID de promoción no encontrado.';
            return;
        }

        try {
            // Endpoint cambiado a /api/promociones
            const fetchUrl = `${API_BASE}/api/promociones/${itemId}`;
            const res = await fetch(fetchUrl);
            
            if (!res.ok) throw new Error('Promoción no encontrada o error de servidor.');

            const item = await res.json();
            if (titleElement) titleElement.textContent = item.titulo; // Campo cambiado
            if (categoryElement) categoryElement.textContent = item.descripcion; // Campo cambiado
            
            const imagenURL = buildImageUrl(item.imagen);
            
            if (imageElement) {
                imageElement.src = imagenURL;
                imageElement.alt = item.titulo;
                imageElement.setAttribute('onerror', `this.src='https://placehold.co/600x400?text=Imagen+No+Disponible'`);
            }
            if (loadingMessage) loadingMessage.style.display = 'none';
            contentContainer.style.display = 'block';
        } catch (error) {
            console.error('Error al obtener los detalles de la promoción:', error);
            if (loadingMessage) loadingMessage.style.display = 'none';
            if (errorMessage) {
                errorMessage.textContent = `Error al cargar los detalles: ${error.message}`;
                errorMessage.style.display = 'block';
            }
        }
    }

    // --- Inicialización General ---

    // 1. Mostrar/ocultar botones de admin
    updateAdminButtons();
    
    // 2. Ejecutar la lógica de carga apropiada según la página actual
    const path = window.location.pathname;
    
    // Asegúrate de que las rutas de tus páginas HTML coincidan con estos nombres
    if (path.includes('promocion_detalle.html')) {
        loadDetails();
    } else if (path.includes('single.html') || path.includes('/')) {
        // Carga la lista si está en la página principal de lista
        loadPromociones();
    }
});
