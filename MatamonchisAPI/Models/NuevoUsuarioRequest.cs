using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using MatamonchisAPI.Models;
namespace MatamonchisAPI.Models
{
    public class NuevoUsuarioRequest
    {
        public string Nombre { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Rol { get; set; } = "usuario";
        public string Mail { get; set; } = string.Empty;
    }
}

// Paso 2: Crear endpoint en el LoginController o UsuariosController


namespace MatamonchisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IConfiguration _config;

        public UsuariosController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        public IActionResult CrearUsuario([FromBody] NuevoUsuarioRequest nuevoUsuario)
        {
            if (string.IsNullOrWhiteSpace(nuevoUsuario.Nombre) ||
                string.IsNullOrWhiteSpace(nuevoUsuario.Username) ||
                string.IsNullOrWhiteSpace(nuevoUsuario.Password))
            {
                return BadRequest(new { message = "Faltan campos obligatorios" });
            }

            string hash = BCrypt.Net.BCrypt.HashPassword(nuevoUsuario.Password);
            string connectionString = _config.GetConnectionString("DefaultConnection");

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                string sql = "INSERT INTO Usuarios (nombre, username, password_hash, rol, mail) VALUES (@nombre, @username, @password, @rol, @mail)";
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@nombre", nuevoUsuario.Nombre);
                    cmd.Parameters.AddWithValue("@username", nuevoUsuario.Username);
                    cmd.Parameters.AddWithValue("@password", hash);
                    cmd.Parameters.AddWithValue("@rol", nuevoUsuario.Rol);
                    cmd.Parameters.AddWithValue("@mail", nuevoUsuario.Mail);
                    

                    try
                    {
                        cmd.ExecuteNonQuery();
                        return Ok(new { message = "Usuario creado exitosamente" });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("❌ ERROR: " + ex.Message);
                        return StatusCode(500, new
                        {
                            message = "Error al crear el usuario",
                            detalle = ex.Message
                        });
                    }
                }
            }
        }
    }
}
