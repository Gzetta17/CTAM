document.addEventListener('DOMContentLoaded', function () {
  const adminButton = document.getElementById('adminButton');
  const loginPopup = document.getElementById('loginPopup');
  const closeLoginPopup = document.getElementById('closeLoginPopup');
  const loginForm = document.getElementById('loginForm');
  const popupButton = document.getElementById('popupNavButton');
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

  // Abrir login
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
      popupButton.style.display = 'inline-block'; // Mostrar el botón de administrador
    } else {
      alert('Credenciales incorrectas');
    }
  });

  // Mostrar el botón si ya está logueado
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    popupButton.style.display = 'inline-block';
  }

  // Mostrar panel de carga al hacer clic en el botón Pop-Up
  popupButton.addEventListener('click', () => {
    adminPanel.style.display = 'block';
  });

  // Cerrar el panel de administración
  closeAdminPanel.addEventListener('click', () => {
    adminPanel.style.display = 'none';
  });

  // Guardar imagen y mostrar al público
  savePopupBtn.addEventListener('click', () => {
    const input = popupImgInput;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        localStorage.setItem('popupImage', e.target.result);
        alert('Imagen guardada. Se mostrará al iniciar la página.');
        imageOptions.style.display = 'block';  // Mostrar opciones de modificación y eliminación
        adminPanel.style.display = 'none';  // Ocultar el panel de administración
      };
      reader.readAsDataURL(input.files[0]);
    }
  });

  // Mostrar el popup público al visitante si existe imagen
  const savedImage = localStorage.getItem('popupImage');
  if (savedImage) {
    publicImage.src = savedImage;
    publicPopup.style.display = 'flex';

    // Cerrar el popup público
    closePublicPopup.addEventListener('click', () => {
      publicPopup.style.display = 'none';
    });

    // Opciones de modificar o eliminar imagen
    imageOptions.style.display = 'block'; // Mostrar las opciones

    // Modificar imagen
    modifyPopupBtn.addEventListener('click', () => {
      adminPanel.style.display = 'block';  // Mostrar panel de carga
      publicPopup.style.display = 'none';  // Ocultar pop-up público
      imageOptions.style.display = 'none';  // Ocultar las opciones
    });

    // Eliminar imagen
    deletePopupBtn.addEventListener('click', () => {
      localStorage.removeItem('popupImage');
      publicPopup.style.display = 'none';  // Ocultar pop-up público
      imageOptions.style.display = 'none';  // Ocultar las opciones
      alert('Imagen eliminada.');
    });
  } else {
    imageOptions.style.display = 'none';  // Asegurarse de que las opciones no se muestren si no hay imagen
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const togglePassword = document.getElementById('togglePassword');
  const passwordField = document.getElementById('password');

  togglePassword.addEventListener('click', function () {
    // Alternar el tipo de input entre 'password' y 'text'
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;

    // Cambiar el ícono de cruz (para contraseña oculta) o ojo (para contraseña visible)
    this.innerHTML = type === 'password' ? '&#128065;' : '&#10006;'; // Ojo (👁️) o Cruz (❌)
  });
});
