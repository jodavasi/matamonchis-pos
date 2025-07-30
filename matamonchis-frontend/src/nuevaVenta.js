document.addEventListener("DOMContentLoaded", async () => {
  const contenedorProductos = document.getElementById("productos-container");
  const tablaDetalles = document.getElementById("tabla-detalles");
  const totalVentaSpan = document.getElementById("total-pedido");
  const carrito = {}; // Objeto para mantener el estado del carrito

  const btnTerminarVenta = document.getElementById("finalizar-pedido");
  btnTerminarVenta.disabled = true;

  const verificarEstadoBoton = () => {
    const nombreCliente = document.getElementById("nombre-cliente").value.trim();
    const metodoPago = document.getElementById("metodo-pago").value;
    const hayProductos = Object.keys(carrito).length > 0;

    btnTerminarVenta.disabled = !(nombreCliente && metodoPago && hayProductos);
  };
  const actualizarTabla = () => {
    tablaDetalles.innerHTML = "";
    let total = 0;

    Object.values(carrito).forEach(item => {
      const fila = document.createElement("tr");

      const tdNombre = document.createElement("td");
      tdNombre.textContent = item.nombre;

      const tdCantidad = document.createElement("td");
      tdCantidad.textContent = item.cantidad;

      const tdDescuento = document.createElement("td");
      tdDescuento.textContent = "₡0.00";

      const tdSubtotal = document.createElement("td");
      const subtotal = item.precio * item.cantidad;
      tdSubtotal.textContent = `₡${subtotal.toFixed(2)}`;

      total += subtotal;

      fila.appendChild(tdNombre);
      fila.appendChild(tdCantidad);
      fila.appendChild(tdDescuento);
      fila.appendChild(tdSubtotal);

      tablaDetalles.appendChild(fila);

     
    });

    document.getElementById("total-pedido").textContent = `₡${total.toFixed(2)}`;
    totalVentaSpan.textContent = `₡${total.toFixed(2)}`;

    // Habilitar o deshabilitar el botón de finalizar venta
    verificarEstadoBoton();
  };

  // Obtener productos del backend
  try {
    const response = await fetch("http://localhost:5128/api/productos");
    const productos = await response.json();

    productos.forEach((producto) => {
      const card = document.createElement("div");
      card.className = "producto-card";



      const imagen = document.createElement("img");
      imagen.src = `/src/Productos/${producto.nombre}.jpg`;
      imagen.alt = producto.nombre;
      imagen.className = "imagen-producto";

      const nombre = document.createElement("p");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = `Precio: ₡${producto.precio}`;

      const controlCantidad = document.createElement("div");
      controlCantidad.className = "control-cantidad";

      const btnMenos = document.createElement("button");
      btnMenos.textContent = "-";

      const cantidadSpan = document.createElement("span");
      cantidadSpan.textContent = "0";

      const btnMas = document.createElement("button");
      btnMas.textContent = "+";

      btnMas.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        cantidad++;
        cantidadSpan.textContent = cantidad;
        carrito[producto.producto_id] = {
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          producto_Id: producto.producto_id,
        };
        actualizarTabla();
      });

      btnMenos.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        if (cantidad > 0) {
          cantidad--;
          cantidadSpan.textContent = cantidad;
          if (cantidad === 0) {
            delete carrito[producto.producto_id];
          } else {
            carrito[producto.producto_id].cantidad = cantidad;
          }
          actualizarTabla();
        }
      });

      controlCantidad.appendChild(btnMenos);
      controlCantidad.appendChild(cantidadSpan);
      controlCantidad.appendChild(btnMas);

      card.appendChild(precio);
      card.appendChild(imagen);
      card.appendChild(nombre);
      card.appendChild(controlCantidad);

      contenedorProductos.appendChild(card);
    });
  } catch (err) {
    console.error("Error al obtener productos:", err);
  }

  // Finalizar Pedido
  const modalExito = document.getElementById("modal-exito");
  const cerrarModal = document.getElementById("cerrar-modal");
  document.getElementById("nombre-cliente").addEventListener("input", verificarEstadoBoton);
  document.getElementById("metodo-pago").addEventListener("change", verificarEstadoBoton);

  btnTerminarVenta.addEventListener("click", async () => {
    const nombreCliente = document.getElementById("nombre-cliente").value.trim();
    const metodoPago = document.getElementById("metodo-pago").value;

    if (!nombreCliente || !metodoPago) {
      alert("Por favor, completá el nombre del cliente y método de pago.");
      return;
    }

    if (Object.keys(carrito).length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const detalleFinal = Object.values(carrito).map(item => ({
      producto_Id: item.producto_Id,
      cantidad: item.cantidad
    }));

    const total = Object.values(carrito).reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    const venta = {
      cliente: nombreCliente,
      metodo_Pago: metodoPago,
      detalleVenta: detalleFinal,
      total: total,
      usuario_Id: 1, // ⚠️ Cambiar según el usuario actual
      descuento_Aplicado: false,
      monto_Efectivo: metodoPago === "Efectivo" ? total : 0
    };

    try {
      const response = await fetch("http://localhost:5128/api/ventas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });

      if (!response.ok) {
        throw new Error("Hubo un problema al conectar con el servidor.");
      }

      // Mostrar modal
      modalExito.style.display = "block";

      // Limpiar todo
      document.getElementById("nombre-cliente").value = "";
      document.getElementById("metodo-pago").value = "";
      for (const span of document.querySelectorAll(".control-cantidad span")) {
        span.textContent = "0";
      }
      Object.keys(carrito).forEach(key => delete carrito[key]);
      actualizarTabla();
    } catch (error) {
      alert(error.message);
    }
  });

  cerrarModal.addEventListener("click", () => {
    modalExito.style.display = "none";
  });


});
