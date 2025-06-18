
console.log(rol.value)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("crear-usuario-form");
  const mensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value.trim().toLowerCase(); // 🔥 FIX

    try {
      const response = await fetch("http://localhost:5128/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, username, password, rol }),
      });

      const data = await response.json();

      if (!response.ok) {
        mensaje.textContent = `❌ ${data.message} - ${data.detalle || ""}`;
        mensaje.style.color = "red";
        return;
      }

      mensaje.style.color = "green";
      mensaje.textContent = "✅ Usuario creado correctamente";
      form.reset();
    } catch (error) {
      console.error("❌ Error en conexión:", error);
      mensaje.style.color = "red";
      mensaje.textContent = "❌ Error de red al crear usuario.";
    }

  });
});
