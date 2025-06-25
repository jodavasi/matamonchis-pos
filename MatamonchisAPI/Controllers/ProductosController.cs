using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Collections.Generic;
using System;


[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IConfiguration _config;

    public ProductosController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet]
    public IActionResult ObtenerProductos()
    {
        List<object> productos = new();
        string connectionString = _config.GetConnectionString("DefaultConnection");

        using SqlConnection conn = new(connectionString);
        conn.Open();

        string sql = "SELECT producto_id, nombre, precio FROM Productos";
        using SqlCommand cmd = new(sql, conn);
        using SqlDataReader reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            productos.Add(new
            {
                producto_id = reader["producto_id"],
                nombre = reader["nombre"],
                precio = Convert.ToDecimal(reader["precio"])
            });
        }

        return Ok(productos);
    }
}
