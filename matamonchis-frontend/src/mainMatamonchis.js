document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const crearUsuarioBtn = document.getElementById("crear-usuario-btn");
  const crearPedidoBtn = document.getElementById("crear-pedido-btn"); // Nuevo botón

  // Obtener datos del usuario desde sessionStorage
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  document.addEventListener("DOMContentLoaded", () => {
  const rolUsuario = sessionStorage.getItem("rol");

  const btnCrearUsuario = document.getElementById("crear-usuario-btn");
  
  if (rolUsuario === "Cajero" && btnCrearUsuario) {
    btnCrearUsuario.style.display = "none";
  }
});

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

  // Redirigir a nueva venta (todos los roles)
  if (crearPedidoBtn) {
    crearPedidoBtn.addEventListener("click", () => {
      window.location.href = "/src/nuevaVenta.html";
    });
  }
});
