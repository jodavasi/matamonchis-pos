using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using Dapper;
using MatamonchisAPI.Models;

namespace MatamonchisAPI.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    public class UsuariosAdminController  : ControllerBase
    {
        private readonly string _cs;

        public UsuariosAdminController (IConfiguration cfg)
        {
            _cs = cfg.GetConnectionString("DefaultConnection")!;
        }

        // GET: api/usuarios  -> lista para tabla
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            const string sql = @"
                SELECT usuario_id, nombre, username, rol, mail
                FROM Usuarios
                ORDER BY usuario_id DESC;";

            using var conn = new SqlConnection(_cs);
            var data = await conn.QueryAsync<UsuarioListItemDto>(sql);
            return Ok(data);
        }

        // GET: api/usuarios/5 -> detalle para precargar formulario
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            const string sql = @"
                SELECT usuario_id, nombre, username, rol, mail
                FROM Usuarios
                WHERE usuario_id = @id;";

            using var conn = new SqlConnection(_cs);
            var u = await conn.QuerySingleOrDefaultAsync<UsuarioListItemDto>(sql, new { id });

            if (u is null) return NotFound(new { message = "Usuario no encontrado" });
            return Ok(u);
        }

        // PUT: api/usuarios/5  -> actualizar (password opcional)
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUsuarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.nombre) ||
                string.IsNullOrWhiteSpace(dto.username) ||
                string.IsNullOrWhiteSpace(dto.rol))
            {
                return BadRequest(new { message = "Nombre, username y rol son obligatorios." });
            }

            const string sqlCheck = @"SELECT COUNT(1) FROM Usuarios WHERE username = @username AND usuario_id <> @id;";
            const string sqlUpdSinPass = @"
                UPDATE Usuarios
                SET nombre = @nombre, username = @username, rol = @rol, mail = @mail
                WHERE usuario_id = @id;";
            const string sqlUpdConPass = @"
                UPDATE Usuarios
                SET nombre = @nombre, username = @username, rol = @rol, mail = @mail, password_hash = @password_hash
                WHERE usuario_id = @id;";

            using var conn = new SqlConnection(_cs);

            // username único (excepto el propio)
            var existe = await conn.ExecuteScalarAsync<int>(sqlCheck, new { dto.username, id });
            if (existe > 0) return Conflict(new { message = "El username ya está en uso." });

            if (!string.IsNullOrWhiteSpace(dto.password))
            {
                var hash = BCrypt.Net.BCrypt.HashPassword(dto.password);
                await conn.ExecuteAsync(sqlUpdConPass, new
                {
                    id,
                    dto.nombre,
                    dto.username,
                    dto.rol,
                    dto.mail,
                    password_hash = hash
                });
            }
            else
            {
                await conn.ExecuteAsync(sqlUpdSinPass, new
                {
                    id,
                    dto.nombre,
                    dto.username,
                    dto.rol,
                    dto.mail
                });
            }

            return NoContent(); // 204
        }
    }
}
