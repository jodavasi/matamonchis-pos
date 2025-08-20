document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");
  const crearUsuarioBtn = document.getElementById("crear-usuario-btn");
  const crearPedidoBtn = document.getElementById("crear-pedido-btn");

  // ---- Sesión ----
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  const rolUsuario = sessionStorage.getItem("rol");

  if (!usuario) {
    window.location.href = "/index.html";
    return;
  }

  // Mostrar info del usuario
  if (userInfo) {
    userInfo.textContent = `Usuario: ${usuario.nombre} | Rol: ${usuario.rol}`;
  }

  // Ocultar botón crear usuario si es cajero (tu lógica original)
  const btnCrearUsuario = document.getElementById("crear-usuario-btn");
  if (rolUsuario === "Cajero" && btnCrearUsuario) {
    btnCrearUsuario.style.display = "none";
  }

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("usuario");
      sessionStorage.removeItem("rol");
      window.location.href = "/index.html";
    });
  }

  // Navegación
  if (crearUsuarioBtn) {
    crearUsuarioBtn.addEventListener("click", () => {
      if ((usuario.rol || "").toLowerCase() === "admin") {
        window.location.href = "/src/crearUsuario.html";
      } else {
        alert("Acceso denegado. Solo los administradores pueden crear usuarios.");
      }
    });
  }

  if (crearPedidoBtn) {
    crearPedidoBtn.addEventListener("click", () => {
      window.location.href = "/src/nuevaVenta.html";
    });
  }

  // ---- Gráfico (una sola implementación) ----
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

let ventasChartInstance = null;

function renderBarChart(canvasId, labels, datasetLabel, data) {
  const el = document.getElementById(canvasId);
  if (!el || !window.Chart) return;

  // Asegura que el contenedor tenga altura (si el CSS tardó)
  const box = el.parentElement;
  if (box && !box.style.height) box.style.height = '320px';

  // Evita duplicar charts
  if (ventasChartInstance) {
    ventasChartInstance.destroy();
    ventasChartInstance = null;
  }

  const ctx = el.getContext('2d');
  ventasChartInstance = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: datasetLabel, data }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // usamos la altura del contenedor
      scales: { y: { beginAtZero: true } }
    }
  });
}

  async function loadChart() {
    // Usa window.API_BASE que defines en el HTML
    const base = window.API_BASE || "http://localhost:5000";
    const url = `${base}/api/analytics/ventas-por-vendedor`;

    const data = await fetchJSON(url); // [{ vendedorId, vendedor|Vendedor, monto|Monto }]
    const labels = data.map(x => x.vendedor ?? x.Vendedor);
    const montos = data.map(x => x.monto ?? x.Monto);

    renderBarChart("ventasChart", labels, "Ventas (₡)", montos);
  }

  loadChart().catch(err => console.error("Error cargando gráfico:", err));
});