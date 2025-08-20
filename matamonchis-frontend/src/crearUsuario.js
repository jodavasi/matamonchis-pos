document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("crear-usuario-form");
  const mensaje = document.getElementById("mensaje");
  const logoutBtn = document.getElementById("logout-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const rol = document.getElementById("rol").value;
    const correo = document.getElementById("correo").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();


if (password !== confirmPassword) {
  mensaje.textContent = "❌ Las contraseñas no coinciden.";
  mensaje.style.color = "red";
  return;
}

    try {
      const response = await fetch("http://localhost:5128/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nombre, 
          username, 
          password, 
          rol, 
          mail: correo  // Asegurate que el backend espere esta propiedad
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        mensaje.style.color = "red";
        mensaje.textContent = `❌ ${data.message} - ${data.detalle || ""}`;
        return;
      }

      mensaje.style.color = "green";
      mensaje.textContent = "✅ Usuario creado correctamente";

      form.reset();
    } catch (error) {
      console.error("❌ Error de red:", error);
      mensaje.style.color = "red";
      mensaje.textContent = "❌ Error de conexión al crear el usuario.";
    }
    
  });
});
