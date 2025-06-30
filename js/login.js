document.addEventListener('DOMContentLoaded', function () {
  // Variables DOM
  const adminButton = document.getElementById('adminButton');
  const loginPopup = document.getElementById('loginPopup');
  const closeLoginPopup = document.getElementById('closeLoginPopup');
  const loginForm = document.getElementById('loginForm');
  const popupButton = document.getElementById('popupNavButton');
  const agregarComercioBtn = document.getElementById('agregarComercioBtn');
  const adminPanel = document.getElementById('adminPanel');
  const closeAdminPanel = document.getElementById('closeAdminPanel');
  const savePopupBtn = document.getElementById('savePopupBtn');
  const popupImgInput = document.getElementById('popupImgInput');
  const imageOptions = document.getElementById('imageOptions');
  const modifyPopupBtn = document.getElementById('modifyPopupBtn');
  const deletePopupBtn = document.getElementById('deletePopupBtn');
  const publicPopup = document.getElementById('publicPopup');
  const publicImage = document.getElementById('publicImage');
  const closePublicPopup = document.getElementById('closePublicPopup');
  const agregarComercioModal = document.getElementById('agregarComercioModal');
  const closeAgregarComercioModal = document.getElementById('closeAgregarComercioModal');
  const comercioNombreInput = document.getElementById('comercioNombre');
  const comercioCategoriaInput = document.getElementById('comercioCategoria');
  const comercioImagenInput = document.getElementById('comercioImagen');
  const comerciosContainer = document.getElementById('comerciosContainer');
  const agregarNoticiasBtn = document.getElementById('agregarNoticias');
  const noticiaPanel = document.getElementById('noticiaPanel');
  const guardarNoticiaBtn = document.getElementById('guardarNoticiaBtn');
  const noticiaTituloInput = document.getElementById('noticiaTitulo');
  const noticiaDescripcionInput = document.getElementById('noticiaDescripcion');
  const noticiaImagenInput = document.getElementById('noticiaImagen');

  // ====================
  // Login administrador
  // ====================
  adminButton.addEventListener('click', () => {
    loginPopup.style.display = 'flex';
  });

  closeLoginPopup.addEventListener('click', () => {
    loginPopup.style.display = 'none';
  });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('isLoggedIn', 'true');
      loginPopup.style.display = 'none';
      popupButton.style.display = 'inline-block';
      agregarComercioBtn.style.display = 'inline-block';
      agregarNoticiasBtn.style.display = 'inline-block';
    } else {
      alert('Credenciales incorrectas');
    }
  });

  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    popupButton.style.display = 'inline-block';
    agregarComercioBtn.style.display = 'inline-block';
    agregarNoticiasBtn.style.display = 'inline-block';
  }

  // ====================
  // Panel de POP-UP
  // ====================
  popupButton.addEventListener('click', () => adminPanel.style.display = 'block');
  closeAdminPanel.addEventListener('click', () => adminPanel.style.display = 'none');

  savePopupBtn.addEventListener('click', () => {
    const file = popupImgInput.files[0];
    if (!file) return alert('Selecciona una imagen');

    const formData = new FormData();
    formData.append('image', file);

    fetch('http://localhost:3000/api/popup', {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar imagen');
        alert('Imagen guardada');
        adminPanel.style.display = 'none';
        fetchAndShowPopup();
      })
      .catch(err => {
        console.error(err);
        alert('Error al subir la imagen');
      });
  });

  // ====================
  // POP-UP público
  // ====================
  closePublicPopup.addEventListener('click', () => publicPopup.style.display = 'none');

  modifyPopupBtn.addEventListener('click', () => {
    adminPanel.style.display = 'block';
    publicPopup.style.display = 'none';
    imageOptions.style.display = 'none';
  });

  deletePopupBtn.addEventListener('click', () => {
    sessionStorage.removeItem('popupImage');
    publicPopup.style.display = 'none';
    imageOptions.style.display = 'none';
    alert('Imagen eliminada');
  });

  function fetchAndShowPopup() {
    fetch('http://localhost:3000/api/popup')
      .then(res => {
        if (!res.ok) throw new Error('No hay imagen guardada');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        publicImage.src = url;
        publicPopup.style.display = 'flex';
      })
      .catch(err => {
        console.log('No se pudo cargar imagen del popup:', err.message);
      });
  }

  // ====================
  // Agregar comercio
  // ====================
  agregarComercioBtn.addEventListener('click', () => {
    agregarComercioModal.style.display = 'block';
    comercioNombreInput.value = '';
    comercioCategoriaInput.value = '';
    comercioImagenInput.value = '';
  });

  closeAgregarComercioModal.addEventListener('click', () => agregarComercioModal.style.display = 'none');

  document.getElementById('guardarComercioBtn').addEventListener('click', () => {
    const nombre = comercioNombreInput.value.trim();
    const categoria = comercioCategoriaInput.value.trim();
    const imagen = comercioImagenInput.files[0];

    if (!nombre || !categoria || !imagen) {
      alert('Por favor complete todos los campos');
      return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('categoria', categoria);
    formData.append('imagen', imagen);

    fetch('http://localhost:3000/api/comercios', {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar comercio');
        return res.json();
      })
      .then(() => {
        alert('Comercio guardado con éxito');
        agregarComercioModal.style.display = 'none';
        cargarComercios();
      })
      .catch(err => {
        console.error(err);
        alert('Error al guardar comercio');
      });
  });

  function cargarComercios() {
    fetch('http://localhost:3000/api/comercios')
      .then(res => res.json())
      .then(comercios => {
        comerciosContainer.innerHTML = '';
        comercios.forEach(comercio => {
          const comercioHTML = `
            <div class="col-md-4 service-item">
              <h3>${comercio.nombre}</h3>
              <p>${comercio.categoria}</p>
              <img src="${comercio.imagen}" alt="${comercio.nombre}" class="img-fluid">
            </div>
          `;
          comerciosContainer.insertAdjacentHTML('beforeend', comercioHTML);
        });
      })
      .catch(err => console.error('Error al cargar comercios:', err));
  }

  // ====================
  // Noticias
  // ====================
  agregarNoticiasBtn.addEventListener('click', () => {
    noticiaPanel.style.display = 'block';
  });

  guardarNoticiaBtn.addEventListener('click', () => {
    const titulo = noticiaTituloInput.value.trim();
    const descripcion = noticiaDescripcionInput.value.trim();
    const imagen = noticiaImagenInput.files[0];

    if (!titulo || !descripcion || !imagen) {
      alert('Por favor completa todos los campos');
      return;
    }

    const formData = new FormData();
    formData.append('title', titulo);
    formData.append('description', descripcion);
    formData.append('image', imagen);

    fetch('http://localhost:3000/api/noticias', {
      method: 'POST',
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar noticia');
        return res.json();
      })
      .then(() => {
        alert('Noticia guardada con éxito');
        noticiaPanel.style.display = 'none';
        noticiaTituloInput.value = '';
        noticiaDescripcionInput.value = '';
        noticiaImagenInput.value = '';
        renderNoticias();
      })
      .catch(err => {
        console.error(err);
        alert('Error al guardar la noticia');
      });
  });

  function renderNoticias() {
    const contenedor = document.getElementById('noticiasContainer');
    if (!contenedor) return;

    fetch('http://localhost:3000/api/noticias')
      .then(res => res.json())
      .then(noticias => {
        contenedor.innerHTML = '';
        noticias.forEach((noticia, index) => {
          const card = document.createElement('div');
          card.classList.add('col-md-3');
          card.innerHTML = `
            <div class="card h-100">
              <img src="http://localhost:3000/uploads/${noticia.image}" class="card-img-top" alt="${noticia.title}">
              <div class="card-body">
                <h5 class="card-title text-primary">Noticia ${index + 1}</h5>
                <p class="card-text">${noticia.description.slice(0, 100)}...</p>
              </div>
            </div>
          `;
          card.addEventListener('click', () => {
            mostrarNoticiaModal(noticia);
          });
          contenedor.appendChild(card);
        });
      })
      .catch(err => console.error('Error al cargar noticias:', err));
  }

  function mostrarNoticiaModal(noticia) {
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade', 'show');
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <button class="close" style="position: absolute; right: 10px; top: 5px; font-size: 2rem;">&times;</button>
          <img src="http://localhost:3000/uploads/${noticia.image}" class="img-fluid" alt="${noticia.title}">
          <div class="modal-header bg-dark text-white justify-content-center">
            <h5 class="modal-title">${noticia.title}</h5>
          </div>
          <div class="modal-body text-dark" style="max-height: 400px; overflow-y: auto;">
            <p>${noticia.description}</p>
          </div>
        </div>
      </div>
    `;
    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
  }

  // ====================
  // Ejecutar al cargar
  // ====================
  fetchAndShowPopup();
  cargarComercios();
  renderNoticias();
});
