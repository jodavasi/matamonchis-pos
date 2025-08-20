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

  // Mostrar info
  userInfo.textContent = `Usuario: ${usuario.nombre} | Rol: ${usuario.rol}`;

  // Ocultar crear/editar para no-admin
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

  // -------- Chart --------
  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  let ventasChartInstance = null;

  function renderBarChart(canvasId, labels, datasetLabel, data) {
    const el = document.getElementById(canvasId);
    if (!el || !window.Chart) return;

    // Asegurar altura del contenedor
    const box = el.parentElement;
    if (box && !box.style.height) box.style.height = "320px";

    // Destruir instancia previa
    if (ventasChartInstance) {
      ventasChartInstance.destroy();
      ventasChartInstance = null;
    }

    const ctx = el.getContext("2d");
    ventasChartInstance = new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: [{ label: datasetLabel, data }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `₡${fmt.format(value)}`
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ₡${fmt.format(ctx.raw)}`
            }
          },
          legend: { position: "top" }
        }
      }
    });
  }

  async function loadChart() {
    const base = window.API_BASE || "http://localhost:5128";
    const url  = `${base}/api/analytics/ventas-por-vendedor`;
    const data = await fetchJSON(url); // [{ vendedorId, vendedor, monto }]
    const labels = data.map(x => x.vendedor ?? x.Vendedor);
    const montos = data.map(x => x.monto ?? x.Monto);
    renderBarChart("ventasChart", labels, "Ventas (₡)", montos);
  }

  loadChart().catch(err => console.error("Error cargando gráfico:", err));
});
