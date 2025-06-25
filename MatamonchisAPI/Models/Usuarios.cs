using System.ComponentModel.DataAnnotations;
namespace MatamonchisAPI.Models
{
    public class Usuarios
    {
        [Key]
        public int Usuario_Id { get; set; }
        public required string Nombre { get; set; }
        public required string Username { get; set; }
        public required string Password_Hash { get; set; }
        public required string Rol { get; set; }
    }
}
