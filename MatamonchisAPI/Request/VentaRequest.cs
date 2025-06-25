
namespace MatamonchisAPI.Requests
{
    public class VentaRequest
    {
        public int Usuario_Id { get; set; }
        public string Cliente { get; set; }
        public string Metodo_Pago { get; set; }
        public decimal Total { get; set; }
        public bool Descuento_Aplicado { get; set; }
        public decimal Monto_Efectivo { get; set; }

        

        public List<DetalleVentaRequest> DetalleVenta { get; set; }
    }

    public class DetalleVentaRequest
    {
        public int Producto_Id { get; set; }
        public int Cantidad { get; set; }
    }
}
