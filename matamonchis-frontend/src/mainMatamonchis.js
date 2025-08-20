document.addEventListener("DOMContentLoaded", () => {
  const userInfo           = document.getElementById("user-info");
  const logoutBtn          = document.getElementById("logout-btn");
  const crearUsuarioBtn    = document.getElementById("crear-usuario-btn");
  const editarUsuariosBtn  = document.getElementById("editar-usuarios-btn");
  const crearPedidoBtn     = document.getElementById("crear-pedido-btn");

  // Sesión
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));
  if (!usuario) { window.location.href = "/index.html"; return; }
  const rol = (sessionStorage.getItem("rol") || usuario.rol || "").toLowerCase();

  if (userInfo) userInfo.textContent = `Usuario: ${usuario.nombre} | Rol: ${usuario.rol}`;
  if (rol !== "admin") {
    crearUsuarioBtn?.classList.add("hidden");
    editarUsuariosBtn?.classList.add("hidden");
  }

  // Navegación
  logoutBtn?.addEventListener("click", () => {
    sessionStorage.removeItem("usuario");
    sessionStorage.removeItem("rol");
    window.location.href = "/index.html";
  });
  crearUsuarioBtn?.addEventListener("click", () => {
    if (rol === "admin") window.location.href = "/src/crearUsuario.html";
    else alert("Acceso denegado. Solo administradores.");
  });
  editarUsuariosBtn?.addEventListener("click", () => {
    if (rol === "admin") window.location.href = "/src/editarUsuarios.html";
    else alert("Acceso denegado. Solo administradores.");
  });
  crearPedidoBtn?.addEventListener("click", () => {
    window.location.href = "/src/nuevaVenta.html";
  });

  // Helpers
  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  // Chart: Ventas por Vendedor (₡)
  let ventasChartInstance = null;
  function renderBarChartMoney(canvasId, labels, datasetLabel, data) {
    const el = document.getElementById(canvasId);
    if (!el || !window.Chart) return;
    const box = el.parentElement; if (box && !box.style.height) box.style.height = "320px";

    if (ventasChartInstance) { ventasChartInstance.destroy(); ventasChartInstance = null; }

    const ctx = el.getContext("2d");
    ventasChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: datasetLabel,
          data,
          backgroundColor: "#f9c307",
          borderColor: "#d4a106",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { callback: v => `₡${fmt.format(v)}` } } },
        plugins: { tooltip: { callbacks: { label: c => `${c.dataset.label}: ₡${fmt.format(c.raw)}` } } }
      }
    });
  }

  async function loadChartVendedores() {
    const base = window.API_BASE || "http://localhost:5128";
    const url  = `${base}/api/analytics/ventas-por-vendedor`;
    const data = await fetchJSON(url); // [{ Vendedor, Monto }]
    const labels = data.map(x => x.vendedor ?? x.Vendedor);
    const montos = data.map(x => x.monto ?? x.Monto);
    renderBarChartMoney("ventasChart", labels, "Ventas (₡)", montos);
  }

  // Chart: Unidades por Producto
  function renderBarChartInt(canvasId, labels, datasetLabel, data) {
    const el = document.getElementById(canvasId);
    if (!el || !window.Chart) return;     // si no existe el canvas, no intento dibujar
    const box = el.parentElement; if (box && !box.style.height) box.style.height = "320px";

    const ctx = el.getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: datasetLabel,
          data,
          backgroundColor: "#f9c307",
          borderColor: "#d4a106",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: {
          tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw} unidades` } },
          legend: { position: "top" }
        }
      }
    });
  }

  async function loadProductosCantidadChart() {
    const base = window.API_BASE || "http://localhost:5128";
    const url  = `${base}/api/analytics/ventas-por-producto`; // <-- tu endpoint que devuelve Producto + Cantidad
    const data = await fetchJSON(url); // [{ Producto, Cantidad }]
    const labels     = data.map(x => x.producto  ?? x.Producto);
    const cantidades = data.map(x => x.cantidad ?? x.Cantidad);
    renderBarChartInt("chartProductosCant", labels, "Unidades", cantidades);
  }

  // Cargar ambos charts
  Promise.all([
    loadChartVendedores(),
    loadProductosCantidadChart()
  ]).catch(err => console.error("Error cargando charts:", err));
});
