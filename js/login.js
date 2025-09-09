  'use strict';

  // login.js (versión final robusta)
  document.addEventListener('DOMContentLoaded', () => {
    /**************
     * CONFIG
     **************/
    const API_BASE = 'http://localhost:3000';
    const ENDPOINTS = {
      popup:     API_BASE + '/api/popup',
      comercios: API_BASE + '/api/comercios',
      noticias:  API_BASE + '/api/noticias'
    };

    /**************
     * HELPERS
     **************/
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const exists = (el) => !!el;

    // safe show/hide for regular elements (non-overlay)
    const show = (el, display = 'block') => { if (el) el.style.display = display; };
    const hide = (el) => { if (el) el.style.display = 'none'; };

    const escapeHTML = (s) => String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    /**************
     * ELEMENTS (may be null on some pages)
     **************/
    const adminButton        = $('#adminButton');
    const popupButton        = $('#popupNavButton');
    const agregarComercioBtn = $('#agregarComercioBtn');
    const agregarNoticiaBtn  = $('#agregarNoticiaBtn');

    const loginPopup            = $('#loginPopup');
    const loginForm             = $('#loginForm');
    const closeLoginPopup       = $('#closeLoginPopup');
    const togglePassword        = $('#togglePassword');
    const usernameInput         = $('#username');
    const passwordInput         = $('#password');

    const adminPanel            = $('#adminPanel');
    const closeAdminPanel       = $('#closeAdminPanel');
    const savePopupBtn          = $('#savePopupBtn');
    const popupImgInput         = $('#popupImgInput');
    const imageOptions          = $('#imageOptions');
    const modifyPopupBtn        = $('#modifyPopupBtn');
    const deletePopupBtn        = $('#deletePopupBtn');

    const publicPopup           = $('#publicPopup');
    const publicImage           = $('#publicImage');
    const closePublicPopup      = $('#closePublicPopup');

    const agregarComercioModal  = $('#agregarComercioModal');
    const closeAgregarComercioModal = $('#closeAgregarComercioModal');
    const comercioNombreInput   = $('#comercioNombre');
    const comercioCategoriaInput= $('#comercioCategoria');
    const comercioImagenInput   = $('#comercioImagen');
    const comerciosContainer    = $('#comerciosContainer');
    const comerciosSection      = $('#comerciosSection') || comerciosContainer?.closest('section');

    const agregarnoticiaModal   = $('#agregarnoticiaModal');
    const closeAgregarnoticiaModal = $('#closeAgregarnoticiaModal');
    const noticiaNombreInput    = $('#noticiaNombre');
    const noticiaCategoriaInput = $('#noticiaCategoria');
    const noticiaImagenInput    = $('#noticiaImagen');
    const noticiasContainer     = $('#noticiasContainer');
    const noticiasSection       = $('#noticiasSection') || noticiasContainer?.closest('section');

    /**************
     * ADMIN UI
     **************/
    function applyAdminUI(isOn) {
      if (isOn) {
        if (popupButton) show(popupButton, 'inline-block');
        if (agregarComercioBtn) show(agregarComercioBtn, 'inline-block');
        if (agregarNoticiaBtn) show(agregarNoticiaBtn, 'inline-block');
      } else {
        if (popupButton) hide(popupButton);
        if (agregarComercioBtn) hide(agregarComercioBtn);
        if (agregarNoticiaBtn) hide(agregarNoticiaBtn);
      }
    }
    applyAdminUI(sessionStorage.getItem('isLoggedIn') === 'true');

    /**************
     * MODAL OPEN/CLOSE (robusto)
     **************/
    function openModal(el) {
      if (!el) return;
      // If element looks like a modal (has class 'modal') we'll treat as overlay
      // Create wrapper overlay to ensure always visible
      if (!el.dataset._wrapped) {
        el.dataset._wrapped = '1';
        el.classList.add('custom-modal-overlay');
        el.style.display = 'flex';
        el.style.position = 'fixed';
        el.style.inset = '0';
        el.style.background = 'rgba(0,0,0,0.6)';
        el.style.zIndex = 9999;
        // look for inner dialog and give it a class for max-width
        const dialog = el.querySelector('.modal-dialog') || el.querySelector('.popupContent') || el;
        if (dialog) dialog.classList.add('custom-modal-dialog');
      } else {
        el.style.display = 'flex';
      }
      el.setAttribute('data-open', 'true');
      // close modal when clicking overlay background
      el.addEventListener('click', overlayClickHandler);
    }

    function closeModal(el) {
      if (!el) return;
      el.removeAttribute('data-open');
      el.style.display = 'none';
      el.removeEventListener('click', overlayClickHandler);
    }

    function overlayClickHandler(e) {
      // If clicked the overlay itself (not children) -> close
      if (e.target && e.currentTarget && e.target === e.currentTarget) {
        closeModal(e.currentTarget);
      }
    }

    // close all open modals by Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // close known ones
        [loginPopup, adminPanel, publicPopup, agregarComercioModal, agregarnoticiaModal,
        $('#editarComercioModal'), $('#editarnoticiaModal')].forEach(closeModal);
      }
    });

    /**************
     * LOGIN
     **************/
    if (adminButton) adminButton.addEventListener('click', () => openModal(loginPopup));
    if (closeLoginPopup) closeLoginPopup.addEventListener('click', () => closeModal(loginPopup));
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = (usernameInput && usernameInput.value || '').trim();
        const pass = (passwordInput && passwordInput.value || '').trim();
        if (user === 'admin' && pass === 'admin123') {
          sessionStorage.setItem('isLoggedIn', 'true');
          applyAdminUI(true);
          closeModal(loginPopup);
        } else {
          alert('Credenciales incorrectas');
        }
      });
    }
    if (togglePassword) togglePassword.addEventListener('click', () => {
      if (!passwordInput) return;
      const t = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = t;
    });

    /**************
     * POPUP ADMIN
     **************/
    if (popupButton) popupButton.addEventListener('click', () => openModal(adminPanel));
    if (closeAdminPanel) closeAdminPanel.addEventListener('click', () => closeModal(adminPanel));
    if (closePublicPopup) closePublicPopup.addEventListener('click', () => closeModal(publicPopup));

    if (savePopupBtn) {
      savePopupBtn.addEventListener('click', async () => {
        const file = popupImgInput && popupImgInput.files && popupImgInput.files[0];
        if (!file) { alert('Selecciona una imagen'); return; }
        const fd = new FormData(); fd.append('image', file);
        try {
          const res = await fetch(ENDPOINTS.popup, { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Error al guardar imagen: ' + res.status);
          alert('Imagen guardada');
          closeModal(adminPanel);
          await fetchAndShowPopup();
        } catch (err) {
          console.error(err);
          alert('Error al subir la imagen');
        }
      });
    }

    if (modifyPopupBtn) modifyPopupBtn.addEventListener('click', () => {
      openModal(adminPanel);
      closeModal(publicPopup);
      hide(imageOptions);
    });

    if (deletePopupBtn) {
      deletePopupBtn.addEventListener('click', () => {
        // Si tu backend soporta DELETE, llamalo aquí
        sessionStorage.removeItem('popupImage');
        closeModal(publicPopup);
        hide(imageOptions);
        alert('Imagen eliminada (local).');
      });
    }

    async function fetchAndShowPopup() {
      try {
        const res = await fetch(ENDPOINTS.popup);
        if (!res.ok) throw new Error('No hay imagen guardada');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (publicImage) publicImage.src = url;
        openModal(publicPopup);
      } catch (e) {
        console.log('No se pudo cargar imagen del popup:', e.message);
      }
    }

    /**************
     * COMERCIOS
     **************/
    // Abrir modal (botón header)
    if (agregarComercioBtn) agregarComercioBtn.addEventListener('click', () => {
      if (comercioNombreInput) comercioNombreInput.value = '';
      if (comercioCategoriaInput) comercioCategoriaInput.value = '';
      if (comercioImagenInput) comercioImagenInput.value = '';
      openModal(agregarComercioModal);
    });

    if (closeAgregarComercioModal) closeAgregarComercioModal.addEventListener('click', () => closeModal(agregarComercioModal));

    // Guardar comercio
    const guardarComercioBtn = $('#guardarComercioBtn');
    if (guardarComercioBtn) {
      guardarComercioBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const nombre    = (comercioNombreInput && comercioNombreInput.value || '').trim();
        const categoria = (comercioCategoriaInput && comercioCategoriaInput.value || '').trim();
        const imagen    = comercioImagenInput && comercioImagenInput.files && comercioImagenInput.files[0];

        if (!nombre || !categoria || !imagen) { alert('Por favor complete todos los campos'); return; }

        const fd = new FormData();
        fd.append('nombre', nombre); fd.append('categoria', categoria); fd.append('imagen', imagen);

        try {
          const res = await fetch(ENDPOINTS.comercios, { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Error al guardar comercio: ' + res.status);
          alert('Comercio guardado con éxito');
          closeModal(agregarComercioModal);
          await cargarComercios();
        } catch (err) {
          console.error(err);
          alert('Error al guardar comercio');
        }
      });
    }

    async function cargarComercios() {
      if (!comerciosContainer) return;
      const isAdmin = sessionStorage.getItem('isLoggedIn') === 'true';
      try {
        const res = await fetch(ENDPOINTS.comercios);
        const comercios = await res.json();
        comerciosContainer.innerHTML = '';
        comercios.forEach((comercio) => {
          const card = document.createElement('div');
          card.className = 'col-md-4 service-item';
          const imgSrc = (comercio.imagen && comercio.imagen.startsWith('/uploads/'))
            ? API_BASE + comercio.imagen
            : API_BASE + '/uploads/' + (comercio.imagen || '');
          const adminBtns = isAdmin
            ? '<button class="btn btn-warning btn-sm mt-2 editar-comercio">Editar</button>' +
              '<button class="btn btn-danger btn-sm mt-2 eliminar-comercio">Eliminar</button>'
            : '';
          card.innerHTML =
            '<h3>' + escapeHTML(comercio.nombre) + '</h3>' +
            '<p>' + escapeHTML(comercio.categoria) + '</p>' +
            '<img src="' + imgSrc + '" alt="' + escapeHTML(comercio.nombre) + '" class="img-fluid">' +
            adminBtns;

          // attach actions after appended
          comerciosContainer.appendChild(card);

          if (isAdmin) {
            const btnEliminar = card.querySelector('.eliminar-comercio');
            const btnEditar   = card.querySelector('.editar-comercio');

            if (btnEliminar) {
              btnEliminar.addEventListener('click', async () => {
                if (!confirm('¿Estás seguro de eliminar este comercio?')) return;
                try {
                  const del = await fetch(ENDPOINTS.comercios + '/' + comercio._id, { method: 'DELETE' });
                  if (!del.ok) throw new Error('Error al eliminar comercio: ' + del.status);
                  alert('Comercio eliminado correctamente');
                  cargarComercios();
                } catch (e) {
                  console.error(e);
                  alert('Hubo un error al eliminar el comercio.');
                }
              });
            }

            if (btnEditar) {
              btnEditar.addEventListener('click', () => mostrarEditarComercioModal(comercio));
            }
          }
        });

        if (comercios.length > 0 && comerciosSection) show(comerciosSection, 'block');
      } catch (e) {
        console.error('Error al cargar comercios:', e);
      }
    }

    function mostrarEditarComercioModal(comercio) {
      // construye modal dinámico (overlay incluido en el div)
      const modal = document.createElement('div');
      modal.className = 'custom-modal-overlay';
      modal.style.background = 'rgba(0,0,0,0.6)';
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered custom-modal-dialog" role="document" style="background:#fff; padding:16px; border-radius:8px;">
          <div class="modal-content">
            <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
              <h5 class="modal-title">Editar Comercio</h5>
              <button type="button" class="close">&times;</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Nombre</label>
                <input type="text" class="form-control" id="editarNombre" value="${escapeHTML(comercio.nombre)}">
              </div>
              <div class="form-group">
                <label>Categoría</label>
                <input type="text" class="form-control" id="editarCategoria" value="${escapeHTML(comercio.categoria)}">
              </div>
              <div class="form-group">
                <label>Imagen (opcional)</label>
                <input type="file" class="form-control-file" id="editarImagen">
              </div>
            </div>
            <div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;">
              <button class="btn btn-secondary cerrar-modal">Cancelar</button>
              <button class="btn btn-primary guardar-cambios">Guardar Cambios</button>
            </div>
          </div>
        </div>
      `;
      // cerrar
      modal.querySelector('.close')?.addEventListener('click', () => modal.remove());
      modal.querySelector('.cerrar-modal')?.addEventListener('click', () => modal.remove());
      modal.querySelector('.guardar-cambios')?.addEventListener('click', async () => {
        const nuevoNombre    = (modal.querySelector('#editarNombre').value || '').trim();
        const nuevaCategoria = (modal.querySelector('#editarCategoria').value || '').trim();
        const nuevaImagen    = modal.querySelector('#editarImagen').files[0];
        if (!nuevoNombre || !nuevaCategoria) { alert('Nombre y categoría son obligatorios.'); return; }
        const fd = new FormData(); fd.append('nombre', nuevoNombre); fd.append('categoria', nuevaCategoria);
        if (nuevaImagen) fd.append('imagen', nuevaImagen);
        try {
          const up = await fetch(ENDPOINTS.comercios + '/' + comercio._id, { method: 'PUT', body: fd });
          if (!up.ok) throw new Error('Error al actualizar comercio: ' + up.status);
          alert('Comercio actualizado con éxito');
          modal.remove();
          cargarComercios();
        } catch (e) {
          console.error(e);
          alert('Error al actualizar comercio');
        }
      });

      document.body.appendChild(modal);
    }

    /**************
     * NOTICIAS
     **************/
    if (agregarNoticiaBtn) agregarNoticiaBtn.addEventListener('click', () => {
      if (noticiaNombreInput) noticiaNombreInput.value = '';
      if (noticiaCategoriaInput) noticiaCategoriaInput.value = '';
      if (noticiaImagenInput) noticiaImagenInput.value = '';
      openModal(agregarnoticiaModal);
    });
    if (closeAgregarnoticiaModal) closeAgregarnoticiaModal.addEventListener('click', () => closeModal(agregarnoticiaModal));

    const guardarnoticiaBtn = $('#guardarnoticiaBtn');
    if (guardarnoticiaBtn) {
      guardarnoticiaBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const nombre    = (noticiaNombreInput && noticiaNombreInput.value || '').trim();
        const categoria = (noticiaCategoriaInput && noticiaCategoriaInput.value || '').trim();
        const imagen    = noticiaImagenInput && noticiaImagenInput.files && noticiaImagenInput.files[0];
        if (!nombre || !categoria || !imagen) { alert('Por favor complete todos los campos'); return; }
        const fd = new FormData(); fd.append('nombre', nombre); fd.append('categoria', categoria); fd.append('imagen', imagen);
        try {
          const res = await fetch(ENDPOINTS.noticias, { method: 'POST', body: fd });
          if (!res.ok) throw new Error('Error al guardar noticia: ' + res.status);
          alert('Noticia guardada con éxito');
          closeModal(agregarnoticiaModal);
          await cargarNoticia();
        } catch (err) {
          console.error(err);
          alert('Error al guardar Noticia');
        }
      });
    }

    async function cargarNoticia() {
      if (!noticiasContainer) return;
      const isAdmin = sessionStorage.getItem('isLoggedIn') === 'true';
      try {
        const res = await fetch(ENDPOINTS.noticias);
        const noticias = await res.json();
        noticiasContainer.innerHTML = '';
        noticias.forEach((noticia) => {
          const card = document.createElement('div');
          card.className = 'col-md-4 service-item';
          const imgSrc = (noticia.imagen && noticia.imagen.startsWith('/uploads/'))
            ? API_BASE + noticia.imagen
            : API_BASE + '/uploads/' + (noticia.imagen || '');
          const adminBtns = isAdmin
            ? '<button class="btn btn-warning btn-sm mt-2 editar-noticia">Editar</button>' +
              '<button class="btn btn-danger btn-sm mt-2 eliminar-noticia">Eliminar</button>'
            : '';

          card.innerHTML =
            '<h3>' + escapeHTML(noticia.nombre) + '</h3>' +
            '<p>' + escapeHTML(noticia.categoria) + '</p>' +
            '<img src="' + imgSrc + '" alt="' + escapeHTML(noticia.nombre) + '" class="img-fluid">' +
            adminBtns;

          noticiasContainer.appendChild(card);

          if (isAdmin) {
            const btnEliminar = card.querySelector('.eliminar-noticia');
            const btnEditar   = card.querySelector('.editar-noticia');

            if (btnEliminar) {
              btnEliminar.addEventListener('click', async () => {
                if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;
                try {
                  const del = await fetch(ENDPOINTS.noticias + '/' + noticia._id, { method: 'DELETE' });
                  if (!del.ok) throw new Error('Error al eliminar noticia: ' + del.status);
                  alert('Noticia eliminada correctamente');
                  cargarNoticia();
                } catch (e) {
                  console.error(e);
                  alert('Hubo un error al eliminar la noticia.');
                }
              });
            }

            if (btnEditar) btnEditar.addEventListener('click', () => mostrarEditarNoticiaModal(noticia));
          }
        });

        if (noticias.length > 0 && noticiasSection) show(noticiasSection, 'block');
      } catch (e) {
        console.error('Error al cargar noticias:', e);
      }
    }

    function mostrarEditarNoticiaModal(noticia) {
      const modal = document.createElement('div');
      modal.className = 'custom-modal-overlay';
      modal.innerHTML =
        '<div class="modal-dialog modal-dialog-centered custom-modal-dialog" role="document" style="background:#fff;padding:16px;border-radius:8px;">' +
          '<div class="modal-content">' +
            '<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">' +
              '<h5 class="modal-title">Editar Noticia</h5>' +
              '<button type="button" class="close">&times;</button>' +
            '</div>' +
            '<div class="modal-body">' +
              '<div class="form-group"><label>Nombre</label><input type="text" class="form-control" id="editarNombre" value="' + escapeHTML(noticia.nombre) + '"></div>' +
              '<div class="form-group"><label>Categoría</label><input type="text" class="form-control" id="editarCategoria" value="' + escapeHTML(noticia.categoria) + '"></div>' +
              '<div class="form-group"><label>Imagen (opcional)</label><input type="file" class="form-control-file" id="editarImagen"></div>' +
            '</div>' +
            '<div class="modal-footer" style="display:flex;justify-content:flex-end;gap:8px;">' +
              '<button class="btn btn-secondary cerrar-modal">Cancelar</button>' +
              '<button class="btn btn-primary guardar-cambios">Guardar Cambios</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      modal.querySelector('.close')?.addEventListener('click', () => modal.remove());
      modal.querySelector('.cerrar-modal')?.addEventListener('click', () => modal.remove());
      modal.querySelector('.guardar-cambios')?.addEventListener('click', async () => {
        const nuevoNombre    = (modal.querySelector('#editarNombre').value || '').trim();
        const nuevaCategoria = (modal.querySelector('#editarCategoria').value || '').trim();
        const nuevaImagen    = modal.querySelector('#editarImagen').files[0];
        if (!nuevoNombre || !nuevaCategoria) { alert('Nombre y categoría son obligatorios.'); return; }
        const fd = new FormData(); fd.append('nombre', nuevoNombre); fd.append('categoria', nuevaCategoria);
        if (nuevaImagen) fd.append('imagen', nuevaImagen);
        try {
          const up = await fetch(ENDPOINTS.noticias + '/' + noticia._id, { method: 'PUT', body: fd });
          if (!up.ok) throw new Error('Error al actualizar noticia: ' + up.status);
          alert('Noticia actualizada con éxito');
          modal.remove();
          cargarNoticia();
        } catch (e) { console.error(e); alert('Error al actualizar noticia'); }
      });
      document.body.appendChild(modal);
    }

    /**************
     * ON LOAD initial
     **************/
    fetchAndShowPopup().catch(()=>{});
    if (comerciosContainer) cargarComercios();
    if (noticiasContainer)  cargarNoticia();
  });
