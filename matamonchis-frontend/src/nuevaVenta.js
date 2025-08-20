document.addEventListener("DOMContentLoaded", async () => {
  // Helper de formato
  const formatoMonto = (n) =>
    Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const colones = (n) => `₡${formatoMonto(n)}`;

  // Sesión
  const usuarioSesion = JSON.parse(sessionStorage.getItem("usuario"));
  if (!usuarioSesion) {
    alert("Sesión no encontrada. Volvé a iniciar sesión.");
    window.location.href = "/index.html";
    return;
  }

  const contenedorProductos = document.getElementById("productos-container");
  const tablaDetalles       = document.getElementById("tabla-detalles");
  const totalVentaSpan      = document.getElementById("total-pedido");
  const btnTerminarVenta    = document.getElementById("finalizar-pedido");

  // Estructura del carrito: { [producto_id]: { nombre, precio, cantidad, producto_Id } }
  const carrito = {};
  btnTerminarVenta.disabled = true;

  const verificarEstadoBoton = () => {
    const nombreCliente = document.getElementById("nombre-cliente").value.trim();
    const metodoPago    = document.getElementById("metodo-pago").value;
    const hayProductos  = Object.keys(carrito).length > 0;
    btnTerminarVenta.disabled = !(nombreCliente && metodoPago && hayProductos);
  };

  // ======= PROMO 2x1 (mismo SKU) =======
  // Para cada producto: por cada par de unidades, 1 es gratis.
  // freeUnits = floor(cantidad / 2)
  // descuento = freeUnits * precio
  // subtotal  = cantidad * precio - descuento
  const calcularDescuentoItem = (item) => {
    const freeUnits = Math.floor((item.cantidad || 0) / 2);
    const descuento = freeUnits * Number(item.precio || 0);
    const subtotal  = (Number(item.precio || 0) * (item.cantidad || 0)) - descuento;
    return { freeUnits, descuento, subtotal };
  };

  const calcularTotales = () => {
    let totalDescuento = 0;
    let total = 0;

    Object.values(carrito).forEach(item => {
      const { descuento, subtotal } = calcularDescuentoItem(item);
      totalDescuento += descuento;
      total += subtotal;
    });

    return { totalDescuento, total };
  };

  const actualizarTabla = () => {
    tablaDetalles.innerHTML = "";
    const { total } = calcularTotales();

    Object.values(carrito).forEach(item => {
      const fila = document.createElement("tr");

      const tdNombre = document.createElement("td");
      tdNombre.textContent = item.nombre;

      const tdCantidad = document.createElement("td");
      tdCantidad.textContent = item.cantidad;

      const tdDescuento = document.createElement("td");
      const { descuento, subtotal, freeUnits } = calcularDescuentoItem(item);
      tdDescuento.textContent = colones(descuento);
      tdDescuento.classList.toggle("tiene-descuento", descuento > 0);

      const tdSubtotal = document.createElement("td");
      tdSubtotal.textContent = colones(subtotal);

      fila.appendChild(tdNombre);
      fila.appendChild(tdCantidad);
      fila.appendChild(tdDescuento);
      fila.appendChild(tdSubtotal);
      tablaDetalles.appendChild(fila);

      // Actualizar UI de la tarjeta (badge 2x1 activo si hay unidades gratis)
      marcarCardGratis(item.producto_Id, freeUnits > 0);
    });

    totalVentaSpan.textContent = colones(total);
    verificarEstadoBoton();
  };

  // Marca visual en la card cuando hay 2x1 activo para ese SKU
  const marcarCardGratis = (productoId, activo) => {
    const card = contenedorProductos.querySelector(`.producto-card[data-producto-id="${productoId}"]`);
    if (!card) return;
    card.classList.toggle("promo-activa", activo);

    let badge = card.querySelector(".badge-gratis");
    if (activo) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge-gratis";
        badge.textContent = "2x1 ACTIVO";
        card.appendChild(badge);
      }
    } else {
      if (badge) badge.remove();
    }
  };

  // Cargar productos
  try {
    const response  = await fetch("http://localhost:5128/api/productos");
    const productos = await response.json();

    productos.forEach((producto) => {
      const card  = document.createElement("div");
      card.className = "producto-card";
      card.dataset.productoId = producto.producto_id; // para marcar 2x1 en UI

      const imagen = document.createElement("img");
      imagen.src   = `/src/Productos/${producto.nombre}.jpg`;
      imagen.alt   = producto.nombre;
      imagen.className = "imagen-producto";

      const nombre = document.createElement("p");
      nombre.textContent = producto.nombre;

      const precio = document.createElement("p");
      precio.textContent = `Precio: ${colones(producto.precio)}`;

      const controlCantidad = document.createElement("div");
      controlCantidad.className = "control-cantidad";

      const btnMenos = document.createElement("button");
      btnMenos.textContent = "−";
      btnMenos.setAttribute("aria-label", "Disminuir");

      const cantidadSpan = document.createElement("span");
      cantidadSpan.textContent = "0";

      const btnMas = document.createElement("button");
      btnMas.textContent = "+";
      btnMas.setAttribute("aria-label", "Aumentar");

      btnMas.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        cantidad++;
        cantidadSpan.textContent = String(cantidad);

        carrito[producto.producto_id] = {
          nombre: producto.nombre,
          precio: Number(producto.precio),
          cantidad,
          producto_Id: producto.producto_id,
        };
        actualizarTabla();
      });

      btnMenos.addEventListener("click", () => {
        let cantidad = parseInt(cantidadSpan.textContent);
        if (cantidad > 0) {
          cantidad--;
          cantidadSpan.textContent = String(cantidad);
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
  const modalExito  = document.getElementById("modal-exito");
  const cerrarModal = document.getElementById("cerrar-modal");

  document.getElementById("nombre-cliente").addEventListener("input",  verificarEstadoBoton);
  document.getElementById("metodo-pago").addEventListener("change",    verificarEstadoBoton);

  btnTerminarVenta.addEventListener("click", async () => {
    const nombreCliente = document.getElementById("nombre-cliente").value.trim();
    const metodoPago    = document.getElementById("metodo-pago").value;

    if (!nombreCliente || !metodoPago) {
      alert("Por favor, completá el nombre del cliente y método de pago.");
      return;
    }
    if (Object.keys(carrito).length === 0) {
      alert("El carrito está vacío");
      return;
    }

    // Detalle (mismas cantidades seleccionadas)
    const detalleFinal = Object.values(carrito).map(item => ({
      producto_Id: item.producto_Id,
      cantidad: item.cantidad
    }));

    // Total aplicando 2x1
    const { totalDescuento, total } = calcularTotales();

    const venta = {
      cliente: nombreCliente,
      metodo_Pago: metodoPago,
      detalleVenta: detalleFinal,
      total: total,                            // total ya con 2x1 aplicado
      usuario_Id: Number(usuarioSesion.id),
      descuento_Aplicado: totalDescuento > 0,  // bandera informativa
      monto_Efectivo: metodoPago === "Efectivo" ? total : 0
    };

    try {
      const response = await fetch("http://localhost:5128/api/ventas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venta)
      });

      if (!response.ok) throw new Error("Hubo un problema al conectar con el servidor.");

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
      verificarEstadoBoton();
    } catch (error) {
      alert(error.message);
    }
  });

  cerrarModal.addEventListener("click", () => {
    modalExito.style.display = "none";
  });
});
