using System.ComponentModel.DataAnnotations;

namespace MatamonchisAPI.Models
{
    public class Producto
    {
        [Key]
        public int Producto_Id { get; set; }

        public string Nombre { get; set; }

        public decimal Precio { get; set; }

        public string Descripcion { get; set; }

        // Podés agregar más campos como imagen, stock, etc. según necesités
    }
}
