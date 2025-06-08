// Función para verificar el estado de login y las modificaciones entre dispositivos
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // Mostrar u ocultar elementos basados en el estado de login
    if (isLoggedIn) {
        // Si el usuario está logueado, mostrar el botón de carga de pop-up
        document.getElementById("popup-button").style.display = 'inline-block'; 
        
        // Mostrar imagen de pop-up si existe
        const storedImage = localStorage.getItem('popupImage');
        if (storedImage) {
            document.getElementById("pop-up").style.display = 'block';
            document.getElementById("pop-up").innerHTML = `<img src="${storedImage}" alt="Publicidad">`;
        }
    } else {
        // Si no está logueado, ocultar el botón de carga de pop-up
        document.getElementById("popup-button").style.display = 'none'; 
    }
}

// Función para manejar el login
function handleLogin(username, password) {
    if (username === "admin" && password === "admin123") {
        // Guardar estado de login en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        checkLoginState();
        alert("Inicio de sesión exitoso");
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
}

// Función para manejar el cierre de sesión
function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    checkLoginState();
    alert("Has cerrado sesión.");
}

// Función para manejar la carga de imagen para el pop-up
function handleImageUpload(inputElement) {
    const file = inputElement.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            const imageUrl = reader.result;
            localStorage.setItem('popupImage', imageUrl);
            document.getElementById("pop-up").style.display = 'block';
            document.getElementById("pop-up").innerHTML = `<img src="${imageUrl}" alt="Publicidad">`;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Por favor, selecciona una imagen.");
    }
}

// Escuchar cambios en el almacenamiento para actualizar sin recargar la página
window.addEventListener('storage', checkLoginState);







 