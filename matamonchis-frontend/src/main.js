document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const errorMsg = document.getElementById("error");

  loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorMsg.textContent = "Por favor ingrese usuario y contraseña.";
      return;
    }

    try {
      const response = await fetch("http://localhost:5128/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || "Error en el login.";
        return;
      }

      // Guardamos el usuario en sessionStorage para la siguiente vista
      sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
      sessionStorage.setItem("rol", data.usuario.rol);

      // Redireccionamos a mainMatamonchis
      window.location.href = "/src/mainMatamonchis.html";
    } catch (err) {
      console.error("Error al conectar:", err);
      errorMsg.textContent = "No se pudo conectar con el servidor.";
    }
  });
  const forgotPasswordLink = document.getElementById("forgot-password-link");

  forgotPasswordLink.addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();

    if (!username) {
      alert("Por favor ingrese su nombre de usuario para recuperar la contraseña.");
      return;
    }

    // Aquí podrías abrir una nueva ventana, mostrar un modal o redirigir a una vista de recuperación
    alert(`Se enviarán instrucciones de recuperación al correo vinculado a ${username}.`);

    // Ejemplo: redireccionar a otra página
    // window.location.href = "/src/recuperarPassword.html?username=" + encodeURIComponent(username);
  });
});