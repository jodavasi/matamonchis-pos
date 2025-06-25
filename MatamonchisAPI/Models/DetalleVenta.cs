using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatamonchisAPI.Models
{
    [Table("DetalleVenta")]
    public class DetalleVenta
    {
        [Key]
        [Column("detalle_id")]
        public int DetalleVenta_Id { get; set; }

        [Column("venta_id")]
        public int Venta_Id { get; set; }

        [Column("producto_id")]
        public int Producto_Id { get; set; }

        [Column("cantidad")]
        public int Cantidad { get; set; }

        [Column("subtotal")]
        public decimal Subtotal { get; set; }

        [Column("descuento")]
        public decimal Descuento { get; set; }

        // Relaciones
        [ForeignKey("Venta_Id")]
        public Venta Venta { get; set; }

        [ForeignKey("Producto_Id")]
        public Producto Producto { get; set; }
    }
}
