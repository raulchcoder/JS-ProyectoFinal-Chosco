/* === H E A D E R === */
/* Definiendo y agregando evento al botón carrito, si está vacío NO lo abre */
const BTN_CARRITO = document.getElementById("btn-carrito").addEventListener("click", abrirPaginaCarrito);
function abrirPaginaCarrito(e) {
  e.preventDefault();
  if (CARRITO.length == 0) {
    mostrarToast("El carrito aún está vacio", 1000, "bg-danger");
    return;
  }
  /* Si el carrito tiene productos abre la página */
  location.href = e.target.parentElement.href;
}

/* === C A T E G O R I A S === */
const CATEGORIA = function (id, nombre) {
  this.id = id;
  this.nombre = nombre;
};

let CATEGORIAS = [];

/* Cargar Categorias */
const NAVBAR_CONTENEDOR = document.getElementById("navbar-contenedor");
function cargarCategorias() {
  NAVBAR_CONTENEDOR.innerHTML = "";
  CATEGORIAS.forEach((cat) => {
    let LiNavItem = document.createElement("li");
    LiNavItem.innerHTML = `<div class="form-check">
                            <input class="form-check-input check-categoria" type="checkbox"  id="cat_${cat.id}" data-id="${cat.id}">
                            <label class="form-check-label" for="cat_${cat.id}">
                               ${cat.nombre}
                            </label>
                         </div>`;
    NAVBAR_CONTENEDOR.appendChild(LiNavItem);
  });

  /* Agrega evento a las categorias cargadas en el html */
  agregarEventoAchkCategoria();
}

function ordenarCategoriasPorNombre(array, orden = "ASC") {
  orden = orden.toLowerCase();
  if (orden == "desc") return array.sort((a, b) => b.nombre.localeCompare(a.nombre));
  return array.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

/* Retornar array de IDS de Categorias seleccionadas */
function categoriasSeleccionadas() {
  let catSelected = document.querySelectorAll("input[type='checkbox']:checked");
  let idCategorias = [];
  catSelected.forEach((tag) => {
    idCategorias.push(parseInt(tag.getAttribute("data-id")));
  });
  return idCategorias;
}

/* CheckBox Categorias */
let chksCategoria;
function agregarEventoAchkCategoria() {
  chksCategoria = document.querySelectorAll("input[type='checkbox'].check-categoria");

  chksCategoria.forEach((chk) => {
    chk.addEventListener("change", (event) => {
      /* IDS de categorias seleccionadas */
      let categorias = categoriasSeleccionadas();
      /* Seleccionar Productos según categoria */
      cargarProductos(productosPorCategoria(categorias));
    });
  });
}

/* === P R O D U C T O S === */
const PRODUCTO = function (id, nombre, detalle, precio, img, categoria_id, precios = [], medida = "") {
  this.id = id;
  this.nombre = nombre;
  this.detalle = detalle;
  this.medida = medida;
  this.precio = precio;
  this.precios = precios;
  this.img = img;
  this.categoria_id = categoria_id;
};

let PRODUCTOS = [];

/* Cargar Productos */
const ROW_PRODUCTOS = document.getElementById("row-productos");

function cargarProductos(arrProductos = []) {
  ROW_PRODUCTOS.innerHTML = "";

  /* Cuando NO tiene datos el arreglo */
  if (arrProductos.length == 0) {
    let colProd = document.createElement("div");
    colProd.classList.add("mt-4", "col-12");
    colProd.innerHTML = `
      <img class="d-block img-fluid mx-auto" src="./img/default.png">
      `;
    ROW_PRODUCTOS.append(colProd);
    return;
  }
  /* Fin cuando no tiene datos */

  arrProductos.forEach((prod) => {
    if (prod.img.length == 0) prod.img = "default.jpg";

    let colProd = document.createElement("div");
    colProd.classList.add("col-12", "col-md-6", "col-lg-4", "col-xl-3", "g-4");

    colProd.innerHTML = `
                          <div class="card mx-auto">
                            <a href="./img/${prod.img}" target="_blank">
                              <img class="card-img-top" src="./img/${prod.img}" alt="${prod.nombre}">
                            </a>
                            <div class="card-body">
                              <h6 class="card-title text-marron fw-bold">${prod.nombre}</h6>
                              <p class="card-text">${prod.detalle}</p>
                            </div>
                            <div class="card-footer">
                              <p class="card-footer__precio" id="precio-${prod.id}">$ ${prod.precio}</p>
                              
                              ${getMedidasDelProducto(prod)}

                              <a href="#" class="card-footer__btn btn text-marron btn-comprar" data-id="${prod.id}">
                                <i class="fa-solid fa-2xl fa-basket-shopping"></i>
                              </a>
                            </div>
                          </div>
                        `;

    ROW_PRODUCTOS.appendChild(colProd);
  });

  /* Agregar evento a los botones de comprar y combo select medida */
  agregarEventoBtnComprar();
  agregarEventoCombosMedidas();
}

function productosPorCategoria(idCategorias) {
  let prod = PRODUCTOS.filter((p) => idCategorias.includes(parseInt(p.categoria_id)));
  return prod;
}

function getProductoPorID(idProd) {
  return PRODUCTOS.find((p) => p.id == idProd);
}

function getMedidasDelProducto(prod) {
  if (prod.precios.length == 0) return "";
  let select = `<select class="card-footer__medida cbo-medida" id="medida-${prod.id}" data-id="${prod.id}">`;
  prod.precios.forEach((p) => {
    select += `<option value="${p.id}">${p.medida}</option>`;
  });
  return (select += `</select>`);
}

/* === H E R R A M I E N T A S === */
function imgExiste(imagen_url) {
  const img = new Image();
  img.src = imagen_url;
  return img.width == 0 ? true : false;
}

/* === C O M P R A R === */
const PRODUCTO_CARRITO = function (producto, cantidad = 1) {
  this.id = Date.now();
  this.producto = producto;
  this.cantidad = cantidad;
  this.subtotal = producto.precio;
};
const CARRITO = [];

/* Detectando CLICK botón comprar */
let btnComprar;
function agregarEventoBtnComprar() {
  btnComprar = document.querySelectorAll(".btn-comprar");
  btnComprar.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      let idProd = btn.getAttribute("data-id");

      agregarProductoAlCarrito(idProd);
    });
  });
}

/* Detectando CHANGE combo medidas */
let combosMedida;
function agregarEventoCombosMedidas() {
  combosMedida = document.querySelectorAll(".cbo-medida").forEach((cbo, index) => {
    cbo.addEventListener("change", (e) => {
      let prod = getProductoPorID(cbo.getAttribute("data-id"));
      let objPrecio = getPrecioPorIDSeleccionado(prod, cbo.value);
      /* cambia en el html el precio, de acuerdo a seleccionado en el combo*/
      document.getElementById(`precio-${prod.id}`).textContent = `$ ${objPrecio.precio}`;
    });
  });
}

/* Retorna el objeto precio buscado por idPrecio del producto */
function getPrecioPorIDSeleccionado(prod, idPrecio) {
  return prod.precios.find((p) => p.id == idPrecio);
}

/* Agregando producto por ID */
function agregarProductoAlCarrito(idProd) {
  /* Actualizar obj Producto según tipo de medida y precio */
  let producto = actualizarProductoSegunMedidaSeleccionada(idProd);

  /* Si ya existe el producto en el carrito RETORNA */
  if (buscarProductoEnCarrito(producto)) return;

  /* Agrega el producto al carrito */
  if (producto) CARRITO.push(new PRODUCTO_CARRITO(producto));
  /* Actualiza informacion relacionada a la compra */
  mostrarToast();
  actualizarCantidadCarrito();
  setCarritoEnLocalStorage();
}
/* Recibe y retorna un obj producto, modifica precio y medida según seleccion de usuario */
function actualizarProductoSegunMedidaSeleccionada(idProd) {
  let producto = getProductoPorID(idProd);
  let cbo = document.getElementById(`medida-${idProd}`);

  if (producto.precios.length) {
    let objPrecio = getPrecioPorIDSeleccionado(producto, cbo.value);
    producto.precio = objPrecio.precio;
    producto.medida = objPrecio.info;
  }
  /* Averiguar porque es necesario crear un nuevo obj,
    si solo modifico el que recibe, tambien se modifica en el array carrito.  
  */

  /* spread operator, para hacer copia del objeto */
  return { ...producto };
}

/* Buscar producto en Carrito - Evitar Duplicado */
function buscarProductoEnCarrito(producto) {
  return CARRITO.find((item) => item.producto.id == producto.id && item.producto.precio == producto.precio);
}

/* Actualizar valor del Carrito */
let cantidad_carrito = document.getElementById("carrito-cantidad");
function actualizarCantidadCarrito() {
  cantidad_carrito.textContent = CARRITO.length;
}

function mostrarToast(texto = "Producto agregado ...", tiempoDelay = 700, bg_body = "") {
  const toastTexto = document.getElementById("toast-texto");
  toastTexto.textContent = texto;
  const toastLiveExample = document.getElementById("liveToast");
  toastLiveExample.setAttribute("data-bs-delay", tiempoDelay);
  if (bg_body != "") toastLiveExample.querySelector(".toast-body").classList.add(bg_body);
  if (bg_body == "") toastLiveExample.querySelector(".toast-body").classList.remove("bg-danger");

  const toast = new bootstrap.Toast(toastLiveExample);
  toast.show();
}

/* === L O C A L    S T O R A G E === */
function setCarritoEnLocalStorage() {
  localStorage.setItem("carrito", JSON.stringify(CARRITO));
}

function getCarritoDesdeLocalStorage() {
  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (!carrito) return;
  CARRITO.push(...carrito);
  actualizarCantidadCarrito();
}

function eliminarCarritoEnLocalStorage() {
  localStorage.removeItem("carrito");
}

/* === U S O   D E    A P I === */
async function getProductosDesdeAPI() {
  try {
    const response = await fetch(`${URL_API}/productos`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result.datos;
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function getCategoriasDesdeAPI() {
  try {
    const response = await fetch(`${URL_API}/categorias`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      return result.datos;
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

/* === I N I C I O    D E L    S I S T E M A === */
async function inicializacion() {
  CATEGORIAS = await getCategoriasDesdeAPI();

  ordenarCategoriasPorNombre(CATEGORIAS);
  cargarCategorias();

  // PRODUCTOS = await getProductosDesdeAPI();

  /* En este función se puede especificar que categoria se carga por defecto,
  si se pasa un array vacio mostrara una imagen con el logo de la app.  
  */
  // cargarProductos(productosPorCategoria([10]));

  // getCarritoDesdeLocalStorage();
  // actualizarCantidadCarrito();
}

// eliminarCarritoEnLocalStorage();
inicializacion();
