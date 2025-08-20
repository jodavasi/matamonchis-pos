using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;   // o Microsoft.Data.SqlClient si usas ese paquete
using Dapper;
using MatamonchisAPI.Models;

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
        [HttpGet("ventas-por-producto")]
        public async Task<IActionResult> GetVentasPorProducto()
        {
            const string sql = @"
        SELECT 
            p.producto_id      AS ProductoId,
            p.nombre           AS Producto,
            SUM(dv.cantidad)   AS Cantidad
        FROM DetalleVenta dv
        INNER JOIN Productos p ON p.producto_id = dv.producto_id
        INNER JOIN Ventas v    ON v.venta_id    = dv.venta_id
        GROUP BY p.producto_id, p.nombre
        ORDER BY Cantidad DESC;";

            // Si en tu DetalleVenta tienes precio_unitario, usa esta línea en lugar de MontoCalc:
            // SUM(dv.cantidad * dv.precio_unitario) AS Monto

            using var conn = new SqlConnection(_cs);
            var data = await conn.QueryAsync<VentaPorProducto>(sql);
            return Ok(data);
        }
    }


}
