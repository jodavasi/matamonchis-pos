using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using MatamonchisAPI.Models;

namespace MatamonchisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _config;

        public LoginController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Obtener la cadena de conexión desde appsettings.json
            string connectionString = _config.GetConnectionString("DefaultConnection");

            // Abrimos conexión a la base de datos
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // Buscamos al usuario por nombre de usuario (username)
                string sql = "SELECT * FROM Usuarios WHERE username = @username";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@username", request.Username);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        // Si encuentra al usuario...
                        if (reader.Read())
                        {
                            // Obtenemos el hash de la base de datos
                            string storedHash = reader["password_hash"].ToString();

                            // Comparamos el hash con la contraseña ingresada usando BCrypt
                            bool passwordOk = BCrypt.Net.BCrypt.Verify(request.Password, storedHash);

                            // Si la contraseña no coincide, devolvemos error
                            if (!passwordOk)
                                return Unauthorized(new { message = "Credenciales inválidas" });

                            // Si todo está bien, devolvemos éxito
                            return Ok(new
                            {
                                message = "Login exitoso",
                                usuario = new
                                {
                                    id = reader["usuario_id"],
                                    nombre = reader["nombre"],
                                    rol = reader["rol"]
                                }
                            });
                        }
                        else
                        {
                            // Usuario no encontrado
                            return Unauthorized(new { message = "Credenciales inválidas" });
                        }
                    }
                }
            }
        }
    }
}
