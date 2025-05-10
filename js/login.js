document.addEventListener('DOMContentLoaded', function () {
  // Variables de elementos DOM
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

  // Mostrar login
  adminButton.addEventListener('click', () => {
    loginPopup.style.display = 'flex';
  });

  // Cerrar login
  closeLoginPopup.addEventListener('click', () => {
    loginPopup.style.display = 'none';
  });

  // Procesar login
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('isLoggedIn', 'true');
      loginPopup.style.display = 'none';
      popupButton.style.display = 'inline-block';
      agregarComercioBtn.style.display = 'inline-block';
    } else {
      alert('Credenciales incorrectas');
    }
  });

  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    popupButton.style.display = 'inline-block';
    agregarComercioBtn.style.display = 'inline-block';
  }

  // Abrir el panel de administrador
  popupButton.addEventListener('click', () => {
    adminPanel.style.display = 'block';
  });

  // Cerrar el panel de administrador
  closeAdminPanel.addEventListener('click', () => {
    adminPanel.style.display = 'none';
  });

  // Guardar la imagen del popup
  savePopupBtn.addEventListener('click', () => {
    const input = popupImgInput;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        sessionStorage.setItem('popupImage', e.target.result);
        alert('Imagen guardada');
        imageOptions.style.display = 'block';
        adminPanel.style.display = 'none';
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  const savedImage = sessionStorage.getItem('popupImage');
  if (savedImage) {
    publicImage.src = savedImage;
    publicPopup.style.display = 'flex';

    closePublicPopup.addEventListener('click', () => {
      publicPopup.style.display = 'none';
    });

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
  } else {
    imageOptions.style.display = 'none';
  }

  // Abrir modal para agregar comercio
  agregarComercioBtn.addEventListener('click', () => {
    agregarComercioModal.style.display = 'block';
  });

  // Cerrar modal de agregar comercio
  closeAgregarComercioModal.addEventListener('click', () => {
    agregarComercioModal.style.display = 'none';
  });

  // Función para renderizar los comercios desde el sessionStorage
  function renderComercios() {
    const comercios = JSON.parse(sessionStorage.getItem('comercios')) || [];
    comerciosContainer.innerHTML = '';
    comercios.forEach((comercio, index) => {
      const newCommerce = document.createElement('div');
      newCommerce.classList.add('col-md-4', 'service-item');
      newCommerce.innerHTML = `
        <h3>${comercio.name}</h3>
        <p>${comercio.category}</p>
        <img src="${comercio.image}" alt="${comercio.name}" class="img-fluid">
        <button class="modifyBtn" data-index="${index}">Modificar</button>
        <button class="deleteBtn" data-index="${index}">Eliminar</button>
      `;
      comerciosContainer.appendChild(newCommerce);
    });

    // Añadir eventos a los botones de modificar y eliminar
    const modifyBtns = document.querySelectorAll('.modifyBtn');
    modifyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        const comercios = JSON.parse(sessionStorage.getItem('comercios'));
        const comercio = comercios[index];

        comercioNombreInput.value = comercio.name;
        comercioCategoriaInput.value = comercio.category;
        comercioImagenInput.value = ''; // Se puede agregar para cambiar la imagen si es necesario
        agregarComercioModal.style.display = 'block';

        // Cambiar el botón de guardar a "Modificar"
        const saveButton = document.getElementById('guardarComercioBtn');
        saveButton.textContent = 'Modificar';
        saveButton.onclick = () => {
          const updatedName = comercioNombreInput.value.trim();
          const updatedCategory = comercioCategoriaInput.value.trim();
          if (updatedName && updatedCategory) {
            comercio.name = updatedName;
            comercio.category = updatedCategory;
            sessionStorage.setItem('comercios', JSON.stringify(comercios));
            renderComercios();
            agregarComercioModal.style.display = 'none';
          } else {
            alert('Por favor complete todos los campos');
          }
        };
      });
    });

    const deleteBtns = document.querySelectorAll('.deleteBtn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        let comercios = JSON.parse(sessionStorage.getItem('comercios'));
        comercios.splice(index, 1);
        sessionStorage.setItem('comercios', JSON.stringify(comercios));
        renderComercios();
      });
    });
  }

  // Cargar los comercios al iniciar
  renderComercios();

  // Guardar el comercio al hacer clic en 'Guardar'
  document.getElementById('guardarComercioBtn').addEventListener('click', () => {
    const name = comercioNombreInput.value.trim();
    const category = comercioCategoriaInput.value.trim();
    const imageInput = comercioImagenInput.files[0];

    if (name && category && imageInput) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const newCommerce = {
          name: name,
          category: category,
          image: e.target.result
        };
        let comercios = JSON.parse(sessionStorage.getItem('comercios')) || [];
        comercios.push(newCommerce);
        sessionStorage.setItem('comercios', JSON.stringify(comercios));

        // Limpiar el formulario
        comercioNombreInput.value = '';
        comercioCategoriaInput.value = '';
        comercioImagenInput.value = '';

        // Cerrar el modal
        agregarComercioModal.style.display = 'none';

        // Volver a renderizar los comercios
        renderComercios();
      };
      reader.readAsDataURL(imageInput);
    } else {
      alert('Por favor complete todos los campos');
    }
  });
});
``
