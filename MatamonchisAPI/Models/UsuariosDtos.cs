namespace MatamonchisAPI.Models
{
    public class UsuarioListItemDto
    {
        public int usuario_id { get; set; }
        public string nombre { get; set; }
        public string username { get; set; }
        public string rol { get; set; }
        public string mail { get; set; }
    }

    public class UpdateUsuarioDto
    {
        public string nombre { get; set; }
        public string username { get; set; }
        public string rol { get; set; }
        public string mail { get; set; }
        // Opcional: si viene, se rehashea
        public string? password { get; set; }
    }
}
