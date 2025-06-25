using Microsoft.AspNetCore.Mvc;
using MatamonchisAPI.Models;
using MatamonchisAPI.Requests;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace matamonchisAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly MatamonchisContext _context;

        public VentasController(MatamonchisContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Route("crear")]
        public async Task<IActionResult> CrearVenta([FromBody] VentaRequest venta)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Crear la venta
                var nuevaVenta = new Venta
                {
                    Fecha = DateTime.Now,
                    Cliente = venta.Cliente,
                    Usuario_Id = venta.Usuario_Id,
                    Metodo_Pago = venta.Metodo_Pago,
                    Total = venta.Total,
                    Descuento_Aplicado = venta.Descuento_Aplicado,
                    Monto_Efectivo = venta.Monto_Efectivo
                };

                _context.Ventas.Add(nuevaVenta);
                await _context.SaveChangesAsync();

                // 2. Crear los detalles
                foreach (var detalle in venta.DetalleVenta)
                {
                    var nuevoDetalle = new DetalleVenta
                    {
                        Venta_Id = nuevaVenta.Venta_Id,
                        Producto_Id = detalle.Producto_Id,
                        Cantidad = detalle.Cantidad
                    };
                    _context.DetalleVenta.Add(nuevoDetalle);
                }

                await _context.SaveChangesAsync();

                // 3. Crear la transacción
                var transaccion = new Transaccion
                {
                    Venta_Id = nuevaVenta.Venta_Id,
                    Estado = "Completada",
                    Referencia = Guid.NewGuid().ToString(),
                    Fecha = DateTime.Now
                };

                _context.Transacciones.Add(transaccion);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return Ok(new { message = "✅ Venta registrada con éxito" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = "❌ Error al guardar la venta", detalle = ex.Message });
            }
        }
    }
}