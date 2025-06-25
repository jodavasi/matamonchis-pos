using Microsoft.EntityFrameworkCore;
using MatamonchisAPI.Models;

namespace MatamonchisAPI.Models
{
    public class MatamonchisContext : DbContext
    {
        public MatamonchisContext(DbContextOptions<MatamonchisContext> options)
            : base(options)
        {
        }

        public DbSet<Usuarios> Usuarios { get; set; }
        public DbSet<Producto> Productos { get; set; }
        public DbSet<Venta> Ventas { get; set; }
        public DbSet<DetalleVenta> DetalleVenta { get; set; }
        public DbSet<Transaccion> Transacciones { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ⚠️ Evitar que EF cree Venta_Id1 automáticamente
            modelBuilder.Entity<Transaccion>()
                .HasOne(t => t.Venta)
                .WithMany() // o WithOne() si la relación es 1:1
                .HasForeignKey(t => t.Venta_Id)
                .OnDelete(DeleteBehavior.Restrict);

            // 🧮 Establecer precisión para los campos decimales

            modelBuilder.Entity<Producto>()
                .Property(p => p.Precio)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Venta>()
                .Property(v => v.Total)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Venta>()
                .Property(v => v.Monto_Efectivo)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<DetalleVenta>()
                .Property(d => d.Subtotal)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<DetalleVenta>()
                .Property(d => d.Descuento)
                .HasColumnType("decimal(10,2)");
        }
    }
}
