document.addEventListener('DOMContentLoaded', function () {
    const adminButton = document.getElementById('adminButton');
    const loginPopup = document.getElementById('loginPopup');
    const closeLoginPopup = document.getElementById('closeLoginPopup');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const popupButton = document.getElementById('popupNavButton');
    const imageUploadPopup = document.getElementById('imageUploadPopup');
    const closeImagePopup = document.getElementById('closeImagePopup');
    const popupImageInput = document.getElementById('popupImageInput');
    const saveImageButton = document.getElementById('saveImageButton');
    const publicPopup = document.getElementById('publicPopup');
    const publicImage = document.getElementById('publicImage');
    const closePublicPopup = document.getElementById('closePublicPopup');
  
    // Mostrar pop-up de login
    adminButton.addEventListener('click', () => {
      loginPopup.style.display = 'flex';
    });
  
    // Cerrar pop-up login
    closeLoginPopup.addEventListener('click', () => {
      loginPopup.style.display = 'none';
    });
  
    // Cerrar cualquier pop-up haciendo clic fuera
    window.addEventListener('click', function (e) {
      if (e.target === loginPopup) loginPopup.style.display = 'none';
      if (e.target === imageUploadPopup) imageUploadPopup.style.display = 'none';
      if (e.target === publicPopup) publicPopup.style.display = 'none';
    });
  
    // Mostrar/ocultar contraseña
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  
    // Login válido (usuario y contraseña fijos)
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = passwordInput.value;
  
      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('isLoggedIn', 'true');
        popupButton.style.display = 'block';
        loginPopup.style.display = 'none';
      } else {
        alert('Credenciales incorrectas');
      }
    });
  
    // Mostrar el botón POP-UP si ya está logueado desde antes
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
      popupButton.style.display = 'block';
    }
  
    // Mostrar pop-up para cargar imagen
    popupButton.addEventListener('click', () => {
      imageUploadPopup.style.display = 'flex';
    });
  
    // Cerrar pop-up de carga de imagen
    closeImagePopup.addEventListener('click', () => {
      imageUploadPopup.style.display = 'none';
    });
  
    // Guardar imagen en localStorage y mostrar al público
    saveImageButton.addEventListener('click', () => {
      const file = popupImageInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
          localStorage.setItem('popupImage', reader.result);
          alert('Imagen guardada con éxito.');
          imageUploadPopup.style.display = 'none';
          showPublicPopup(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Seleccioná una imagen');
      }
    });
  
    // Mostrar pop-up con imagen si existe en localStorage
    function showPublicPopup(src) {
      publicImage.src = src;
      publicPopup.style.display = 'flex';
    }
  
    // Cerrar pop-up público
    closePublicPopup.addEventListener('click', () => {
      publicPopup.style.display = 'none';
    });
  
    // Mostrar imagen al público al cargar la página
    const savedImage = localStorage.getItem('popupImage');
    if (savedImage) {
      showPublicPopup(savedImage);
    }
  });
  
  