namespace MatamonchisAPI.Models
{
    public class VentaPorProducto
    {
        public int ProductoId { get; set; }
        public string Producto { get; set; } = "";
        public int Cantidad { get; set; }
        public decimal Monto { get; set; }
    }
}