/* === C A R R I T O === */

const CARRITO = [];

function ordenarCarrito() {
  CARRITO.sort((a, b) => a.producto.nombre.localeCompare(b.producto.nombre));
}

/* === L O C A L    S T O R A G E === */
function setCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(CARRITO));
}

function getCarritoDesdeLocalStorage() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (!carrito) {
    location.href = "../";
    return;
  }
  CARRITO.push(...carrito);
}

function eliminarCarritoEnLocalStorage() {
  localStorage.removeItem("carrito");
}

/* === P R O D U C T O S === */
let col_productos;
function cargarProductosDelCarrito() {
  let item_carrito = "";
  col_productos = document.getElementById("col-productos");

  CARRITO.forEach((item, index) => {
    let bgLight2 = index == 0 || index % 2 == 0 ? "bg-light2" : "";
    let formatoProducto = getEtiquetaFormatoProducto(item.producto.medida);

    if (item.producto.img.length == 0) item.producto.img = "default.jpg";

    item_carrito += `
        <div class="carrito__item ${bgLight2}" id="item-${item.id}">
            <div class="carrito__img">
                <img class="img-fluid" src="../img/${item.producto.img}" alt="">
            </div>
            <div class="carrito__body">
                <div class="carrito__titulo">
                    <h5>${item.producto.nombre}</h5>
                    ${formatoProducto}
                </div>
                <div class="carrito__botones">
                    <div class="carrito__cantidad">
                    <small>Cantidad</small>
                    <div>
                      <button class="btn btn-sm btn-cantidad" data-id="${item.id}" data-operacion="-"><i class="fa-solid fa-minus"></i></button>
                      <span class="px-2" id="cant-${item.id}">${item.cantidad}</span>
                      <button class="btn btn-sm btn-cantidad" data-id="${item.id}" data-operacion="+"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    </div>
                    <div class="carrito__precio">
                      <small>Precio</small>
                      <div>
                        <span class="fw-bold">$ ${item.producto.precio}</span>
                      </div>
                    </div>
                    <div class="carrito__subtotal">
                      <small>SubTotal</small>
                      <div>
                        <span class="fw-bold" id="subt-${item.id}">$ ${item.subtotal}</span>
                      </div>
                    </div>
                    <div class="carrito__quitar">
                        <button class="btn btn-sm text-danger btn-borrar" data-id="${item.id}">
                          <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        `;
  }); /* CARRITO */

  /* Agrega el contenido html a la columna productos */
  col_productos.innerHTML = item_carrito;

  /* Agregando evento a los botones de cantidad y eliminar de los productos */
  agregarEventoBotonesCantidad();
  agregarEventoBotonesBorrar();
}

/* Agregando evento a los botones cantidad + o - */
let btnCantidad;
function agregarEventoBotonesCantidad() {
  btnCantidad = document.querySelectorAll(".btn-cantidad");

  btnCantidad.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      /* llama a funcion para actualizar cantidad de producto, se pasa ID y Operacion a realizar */
      actualizarCantidadProductoComprado(btn.getAttribute("data-id"), btn.getAttribute("data-operacion"));
    });
  });
}

/* Retorna etiqueta strong si el producto tiene mas de un formato de venta */
function getEtiquetaFormatoProducto(formato) {
  if (formato != "") {
    return `<strong class="text-danger">(*) ${formato}</strong>`;
  }
  return "";
}

/* Actualizar cantidad del producto comprado */
function actualizarCantidadProductoComprado(idItem, operacion) {
  CARRITO.find(({ id, cantidad, producto }, index) => {
    if (id == idItem) {
      console.log(producto.precio);
      if (operacion == "-" && cantidad == 1) return;
      /* Modifica la cantidad del producto en el array CARRITO */
      CARRITO[index].cantidad = operacion == "+" ? CARRITO[index].cantidad + 1 : CARRITO[index].cantidad - 1;

      /* Busca y actualiza el span de cantidad */
      document.getElementById(`cant-${idItem}`).textContent = CARRITO[index].cantidad;

      /* *** Actualiza SUBTOTAL *** */
      CARRITO[index].subtotal = CARRITO[index].cantidad * producto.precio;
      document.getElementById(`subt-${id}`).textContent = `$ ${CARRITO[index].subtotal}`;

      /* *** Guarda el CARRITO en localStorage */
      setCarritoEnLocalStorage();
    }
  });

  /* Actualizando TOTAL del carrito */
  actualizarTotalCarrito();
}

/* Agregando evento a los botones ELIMINAR item del carrito */
let btnBorrar;
function agregarEventoBotonesBorrar() {
  btnBorrar = document.querySelectorAll(".btn-borrar");
  btnBorrar.forEach((btn, index) => {
    btn.addEventListener("click", (e) => {
      borrarProuctoDelCarrito(btn.getAttribute("data-id"));
      if (CARRITO.length == 0) vaciarCarrito();
    });
  });
}

/* Borrar producto de carrito */
function borrarProuctoDelCarrito(idItem) {
  let index = CARRITO.findIndex((item) => item.id == idItem);

  CARRITO.splice(index, 1);
  document.getElementById(`item-${idItem}`).remove();

  /* Actualizando TOTAL del carrito */
  actualizarTotalCarrito();

  setCarritoEnLocalStorage();
}

/* Actualizando TOTAL del carrito */
function actualizarTotalCarrito() {
  if (CARRITO.length == 0) return;
  let total = CARRITO.reduce((a, b) => parseFloat(a) + parseFloat(b.subtotal), 0);
  document.getElementById("total").textContent = parseFloat(total).toFixed(2);
}

/* === BOTONES PAGAR, SEGUIR, VACIAR CARRITO === *
/* Agregar evento al boton vaciar carrito */
const BTN_VACIAR_CARRITO = document.getElementById("btn-vaciar").addEventListener("click", vaciarCarrito);
function vaciarCarrito() {
  // CARRITO.length = 0;
  eliminarCarritoEnLocalStorage();
  location.href = "../";
}

/* ==== P A G A R    O    E N C A R G A R ==== */
/* Agregar evento al boton PAGAR */
const BTN_PAGAR = document.getElementById("btn-pagar").addEventListener("click", async (e) => {
  e.preventDefault();
  //
  // determinarSiRealizarPruebaDeEnvio();
  confirmarEnvioPedido();
});
/* === Para simular el envio o compra del carrito ==== */
function confirmarEnvioPedido() {
  Swal.fire({
    title: "Envio",
    text: "Confirma el envio de su pedido ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "SI",
  }).then((result) => {
    if (result.isConfirmed) {
      enviandoPedido();
    }
  });
} /* confirmarEnvioPedido */

function enviandoPedido() {
  let timerInterval;
  Swal.fire({
    title: "Enviar pedido",
    html: "Por favor espere mientras lo enviamos ...<br>Tiempo restante <b></b> milliseconds.",
    timer: 3000,
    color: "brown",
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timer = Swal.getPopup().querySelector("b");
      timerInterval = setInterval(() => {
        timer.textContent = `${Swal.getTimerLeft()}`;
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      confirmacionDelEnvioAlComercio();
    }
  });
} /* enviandoPedido */

function confirmacionDelEnvioAlComercio() {
  Swal.fire({
    title: "Envio",
    text: "Gracias por tu compra!!!",
    icon: "success",
    showConfirmButton: false,
  });

  setTimeout(() => {
    /* termina el proceso de envio o compra del carrito */
    vaciarCarrito();
  }, 2000);
}

/* === */
async function determinarSiRealizarPruebaDeEnvio() {
  const { value: numeroWsp } = await Swal.fire({
    title: "Enviar Pedido por WSP (Pruebas)",
    input: "text",
    inputLabel: "Ingrese un número valido, sin 0 y sin 15.",
    inputPlaceholder: "Ej:  1145698753",
  });
  if (!isNaN(numeroWsp) && numeroWsp.length >= 10) {
    enviarPorWSP(numeroWsp);
    setTimeout(() => vaciarCarrito(), 2900);
    return;
  }
}

/* Prepara texto a enviar por la url a WSP, por el momento está sin el número cel */
function enviarPorWSP(numeroWsp = "#") {
  let numeroCel = numeroWsp;
  let nPedido = Date.now();
  let productos = "";

  CARRITO.forEach((item) => {
    if (item.producto.medida == "") {
      productos += `${item.cantidad} ${item.producto.nombre}  *Precio:* $ ${item.producto.precio}  *Subtotal:* $ ${item.subtotal}%0a`;
    } else {
      /* Si el producto tiene un formato (1/2, unidad, etc) distinto al default, lo agrega en negrita */
      let medida = item.producto.precios.find((pr) => pr.info == item.producto.medida).medida;
      productos += `${item.cantidad} *${medida}* ${item.producto.nombre}  *Precio:* $ ${item.producto.precio}  *Subtotal:* $ ${item.subtotal}%0a`;
    }
  });

  let total = document.getElementById("total").textContent;
  let url = `https://wa.me/${numeroCel}?text=Pedido: *${nPedido}*%0a${productos}%0aTotal: *$ ${total}*`;

  window.open(url, "_blank").focus();
}

/* === H E R R A M I E N T A S === */
function mostrarToast(texto = "Producto agregado ...", tiempoDelay = 700, bg_body = "bg-marron") {
  const toastTexto = document.getElementById("toast-texto");
  toastTexto.textContent = texto;
  const toastLiveExample = document.getElementById("liveToast");
  toastLiveExample.setAttribute("data-bs-delay", tiempoDelay);
  toastLiveExample.querySelector(".toast-body").className = `toast-body p-3 text-white ${bg_body}`;

  const toast = new bootstrap.Toast(toastLiveExample);
  toast.show();
}
/* === I N I C I A L I Z A C I O N === */
function inicializacionSistema() {
  getCarritoDesdeLocalStorage();
  ordenarCarrito();
  cargarProductosDelCarrito();
  actualizarTotalCarrito();
}

window.onload = function () {
  inicializacionSistema();
};
