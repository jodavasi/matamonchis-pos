using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MatamonchisAPI.Models
{
    public class Transaccion
{
    [Key]
    public int Transaccion_Id { get; set; }

    public string Estado { get; set; }

    public DateTime Fecha { get; set; }

    public string Referencia { get; set; }

    public int Venta_Id { get; set; }

    [ForeignKey("Venta_Id")]
    public Venta Venta { get; set; }
}
}
