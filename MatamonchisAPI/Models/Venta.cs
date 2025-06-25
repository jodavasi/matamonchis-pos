using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MatamonchisAPI.Models
{
    public class Venta
    {
        [Key]
        public int Venta_Id { get; set; }
        public DateTime Fecha { get; set; }
        public int Usuario_Id { get; set; }
        public string Cliente { get; set; }
        public string Metodo_Pago { get; set; }
        public decimal Total { get; set; }
        public bool Descuento_Aplicado { get; set; }
        public decimal Monto_Efectivo { get; set; }

        // Relación con DetalleVentas
        public ICollection<DetalleVenta> DetalleVentas { get; set; }
    }
}
