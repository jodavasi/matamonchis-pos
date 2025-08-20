document.addEventListener("DOMContentLoaded", () => {
  const API = window.API_BASE || "http://localhost:5128";

  const tbody = document.querySelector("#tabla-usuarios tbody");
  const form  = document.getElementById("form-edicion");

  const editIdSpan = document.getElementById("edit-id");
  const iNombre    = document.getElementById("edit-nombre");
  const iUsername  = document.getElementById("edit-username");
  const iRol       = document.getElementById("edit-rol");
  const iMail      = document.getElementById("edit-mail");
  const iPass      = document.getElementById("edit-password");
  const btnGuardar = document.getElementById("guardar-cambios");

  let usuarioActualId = null;

  const fetchJSON = async (url, opts={}) => {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.status === 204 ? null : res.json();
  };

  const cargarTabla = async () => {
    tbody.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;
    try {
      const usuarios = await fetchJSON(`${API}/api/usuarios`);
      tbody.innerHTML = "";
      usuarios.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.usuario_id}</td>
          <td>${u.nombre}</td>
          <td>${u.username}</td>
          <td>${u.rol}</td>
          <td>${u.mail ?? ""}</td>
          <td><button class="btn-accion" data-id="${u.usuario_id}">Editar</button></td>`;
        tbody.appendChild(tr);
      });
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="6">Error cargando usuarios</td></tr>`;
      console.error(e);
    }
  };

  tbody.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("button[data-id]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    try {
      const u = await fetchJSON(`${API}/api/usuarios/${id}`);
      usuarioActualId = id;
      editIdSpan.textContent = `#${id}`;
      iNombre.value   = u.nombre ?? "";
      iUsername.value = u.username ?? "";
      iRol.value      = (u.rol ?? "").toLowerCase();
      iMail.value     = u.mail ?? "";
      iPass.value     = "";
      form.style.display = "block";
      window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
    } catch (e) {
      alert("No se pudo cargar el usuario.");
      console.error(e);
    }
  });

  btnGuardar.addEventListener("click", async () => {
    if (!usuarioActualId) return;

    const payload = {
      nombre:   iNombre.value.trim(),
      username: iUsername.value.trim(),
      rol:      iRol.value.trim(),
      mail:     iMail.value.trim(),
      password: iPass.value.trim() || null
    };

    if (!payload.nombre || !payload.username || !payload.rol) {
      alert("Nombre, username y rol son obligatorios.");
      return;
    }

    try {
      await fetchJSON(`${API}/api/usuarios/${usuarioActualId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      alert("Usuario actualizado.");
      form.style.display = "none";
      await cargarTabla();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar. Verificá que el username no esté repetido.");
    }
  });

  // Inicial
  cargarTabla();
});
