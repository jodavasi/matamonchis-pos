document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const crearUsuarioBtn = document.getElementById("crear-usuario-btn");

  // Obtener datos del usuario desde sessionStorage
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  // Si no hay datos, redirige al login
  if (!usuario) {
    window.location.href = "/index.html";
    return;
  }

  // Mostrar info del usuario
  userInfo.textContent = `Usuario: ${usuario.nombre} | Rol: ${usuario.rol}`;

  // Cerrar sesión
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("usuario");
    window.location.href = "/index.html";
  });

  // Redirigir a crear usuario si es admin
  if (crearUsuarioBtn) {
    crearUsuarioBtn.addEventListener("click", () => {
      if (usuario.rol === "admin") {
        window.location.href = "/src/crearUsuario.html";
      } else {
        alert("Acceso denegado. Solo los administradores pueden crear usuarios.");
      }
    });
  }
});