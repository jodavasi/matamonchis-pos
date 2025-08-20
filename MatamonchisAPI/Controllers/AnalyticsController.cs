using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;   // o Microsoft.Data.SqlClient si usas ese paquete
using Dapper;

namespace MatamonchisAPI.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly string _cs;

        public AnalyticsController(IConfiguration config)
        {
            _cs = config.GetConnectionString("DefaultConnection")!;
        }

        public class VentaPorVendedorDto
        {
            public int VendedorId { get; set; }
            public string Vendedor { get; set; }
            public decimal Monto { get; set; }
        }

        [HttpGet("ventas-por-vendedor")]
        public async Task<IActionResult> GetVentasPorVendedor()
        {
            const string sql = @"
                 SELECT 
            v.usuario_id   AS VendedorId,
            u.nombre       AS Vendedor,
            SUM(v.total)   AS Monto
        FROM Ventas v
        JOIN Usuarios u ON u.usuario_id = v.usuario_id
        GROUP BY v.usuario_id, u.nombre
        ORDER BY Monto DESC;";

            using var conn = new SqlConnection(_cs);
            var data = await conn.QueryAsync<VentaPorVendedorDto>(sql);
            return Ok(data);
        }
    }
}
