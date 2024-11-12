/* ==== G L O B A L E S ==== */
let PRODUCTOS = [];

let btnCrear = document.getElementById("btn-crear");
let modal = document.getElementById("modal");
modal.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
});
let objModal = new bootstrap.Modal(modal);
let btnGuardar = document.getElementById("btn-guardar");
let operacion = "create";
/* campos formulario */
let inputNombre = document.getElementById("nombre");
let inputDetalle = document.getElementById("detalle");
let inputMedida = document.getElementById("medida");
let inputPrecio = document.getElementById("precio");
let imagen = document.getElementById("imagen");
let cboCategorias = document.getElementById("categorias");
let imagenTemp = document.getElementById("imagenTemp");
let selImagen = document.getElementById("selImagen");
let tbodyPrecios = document.querySelector("#tabla-precios tbody");
let btnPrecios = document.getElementById("btn-precios").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("divPrecios").classList.toggle("d-none");
});
let btnFormatoGuardar = document.getElementById("formatoGuardar");
const btnLogout = document.getElementById("btn-logout");

/* fin campos formulario */

/* ==== E V E N T O S === */

btnLogout.addEventListener("click", (e) => {
  localStorage.removeItem("session");
  location.href = "../";
});

btnCrear.addEventListener("click", (e) => {
  e.preventDefault();
  limpiarCamposForm();
  setEstilosModalSegunAccion("create");
  objModal.show();
});

btnGuardar.addEventListener("click", (e) => {
  if (!validarFormulario()) {
    Swal.fire({
      title: "CAMPOS VACIOS",
      text: "Complete los campos necesarios",
      icon: "error",
    });
    return;
  }

  if (operacion == "create") {
    guardarProductoEnBD(crearObjProducto());
  } else if (operacion == "update") {
    actualizarProductoEnBD(crearObjProducto(btnGuardar.getAttribute("data-id")));
  }

  objModal.hide();
});

function agregarEventoBtnEliminar() {
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      Swal.fire({
        title: "BORRAR REGISTRO",
        text: "Confirme para continuar",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarProductoEnBD(btn.getAttribute("data-id"));
        }
      });
    });
  });
}
function agregarEventoBtnModificar() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      limpiarCamposForm();
      setEstilosModalSegunAccion("update");

      let { id, nombre, detalle, medida, precio, img, categoria_id, precios } = PRODUCTOS.find(
        ({ id }) => id == btn.getAttribute("data-id")
      );

      // Completando datos a los campos del form
      btnGuardar.setAttribute("data-id", id);
      inputNombre.value = nombre;
      inputDetalle.value = detalle;
      // inputMedida.value = medida;
      inputPrecio.value = precio;
      imagen.src = `../img/${img}`;
      imagenTemp.value = img;
      cboCategorias.value = categoria_id;

      // Formatos y precios
      tbodyPrecios.innerHTML = "";
      precios.forEach((pr) => {
        tbodyPrecios.innerHTML += `
              <tr data-id="${pr.id}">
                <td>${pr.medida}</td>
                <td>${pr.info}</td>
                <td>${pr.precio}</td>
                <td>
                  <button onClick="editarItemTablaFormato(this)" data-id="${pr.id}">Edit</button>
                  <button onClick="eliminarItemTablaFormato(this)" data-id="${pr.id}">Del</button>
                </td>
              </tr>
              `;
      });

      // Fin
      objModal.show();
    });
  });
}

function agregarEventoSelImagen() {
  selImagen.addEventListener("change", (e) => {
    const [file] = selImagen.files;
    if (file) {
      imagen.src = window.URL.createObjectURL(file);
      return;
    }
    imagen.src = "";
  });
}
/* ==== F O R M U L A R I O ==== */

function limpiarCamposForm() {
  modal.querySelector("form").reset();
  imagen.src = "";
  tbodyPrecios.innerHTML = "";
}

function validarFormulario() {
  return inputNombre.value.trim() == "" ? false : true;
}

function setEstilosModalSegunAccion(accion) {
  if (accion.toLowerCase() == "create") {
    operacion = "create";
    modal.querySelector(".modal-header").className = "modal-header bg-info";
    modal.querySelector(".modal-footer").className = "modal-footer bg-info";
    modal.querySelector(".modal-title").textContent = "Nuevo Registro";
  } else if (accion.toLowerCase() == "update") {
    operacion = "update";
    modal.querySelector(".modal-header").className = "modal-header bg-warning";
    modal.querySelector(".modal-footer").className = "modal-footer bg-warning";
    modal.querySelector(".modal-title").textContent = "Modificar Registro";
  }
}

function crearObjProducto(id = "") {
  let precios1 = crearObjPreciosDesdeTabla();
  const PRODUCTO = {
    id: id,
    nombre: inputNombre.value,
    detalle: inputDetalle.value,
    medida: "",
    precio: inputPrecio.value,
    precios: precios1,
    img: selImagen.files.length > 0 ? selImagen.files[0].name : imagenTemp.value,
    categoria_id: cboCategorias.value,
  };
  return PRODUCTO;
}

/* Guardar nuevo formato de proucto y precio */
btnFormatoGuardar.addEventListener("click", (e) => {
  e.preventDefault();
  let id = e.target.getAttribute("data-id");
  let tr = document.createElement("tr");
  tr.setAttribute("data-id", id);
  let medida = document.getElementById("formatoMedida");
  let info = document.getElementById("formatoInfo");
  let precio = document.getElementById("formatoPrecio");
  tr.innerHTML = `
                <td>${medida.value}</td>
                <td>${info.value}</td>
                <td>${precio.value}</td>
                <td>
                  <button onClick="editarItemTablaFormato(this)" data="${id}">Edit</button>
                  <button onClick="eliminarItemTablaFormato(this)" data="${id}">Del</button>
                </td>
              `;
  tbodyPrecios.appendChild(tr);
  medida.value = "";
  info.value = "";
  precio.value = "";
  document.getElementById("btn-precios").click();
});

/* Eliminar Item de tabla formatos y precio */
function eliminarItemTablaFormato(e) {
  e.parentNode.parentNode.remove();
}

/* Editar Item de la tabla formatos y precio */
function editarItemTablaFormato(e) {
  let id = e.getAttribute("data-id");
  let tr = e.parentNode.parentNode;
  tr.setAttribute("data-id", id);
  let tds = tr.querySelectorAll("td");
  formatoMedida.value = tds[0].innerText;
  formatoInfo.value = tds[1].innerText;
  formatoPrecio.value = tds[2].innerText;
  btnFormatoGuardar.setAttribute("data-id", id);
  document.getElementById("divPrecios").classList.remove("d-none");
  //
  eliminarItemTablaFormato(e);
}

/* Crear ObjPrecios a partir de tabla */
function crearObjPreciosDesdeTabla() {
  let precios = [];
  tbodyPrecios.querySelectorAll("tr").forEach((fila) => {
    let col = fila.querySelectorAll("td");
    let obj = {
      id: fila.getAttribute("data-id"),
      medida: col[0].innerText,
      info: col[1].innerText,
      precio: col[2].innerText,
    };
    precios.push(obj);
  });
  return precios;
}

/* === U S O   D E    A P I === */
async function actualizarProductoEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/productos`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarProductosAlHtml();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function eliminarProductoEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/productos/${data}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarProductosAlHtml();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function guardarProductoEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/productos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarProductosAlHtml();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
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
      throw new Error("Hubo un error");
    }
  } catch (error) {
    location.href = "../pages/login.html";
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
      throw new Error("Hubo un error");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

async function cargarProductosAlHtml() {
  PRODUCTOS = await getProductosDesdeAPI();
  let tbody = document.querySelector("#tabla-productos tbody");
  tbody.innerHTML = "";
  PRODUCTOS.forEach(({ id, nombre, detalle, precio, precios }) => {
    tbody.innerHTML += `
            <tr>
              <td>${nombre}</td>
              <td>${detalle}</td>
              <td valign="middle">${precio}</td>
              <td class="text-center" valign="middle">
                  <div class="btn-group btn-group-sm" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-sm btn-outline-warning btn-editar" data-id="${id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${id}">Delete</button>
                  </div>
              </td>
            </tr>
    `;
  });

  agregarEventoBtnEliminar();
  agregarEventoBtnModificar();
}

async function cargarCategoriasAlHtml() {
  let CATEGORIAS = await getCategoriasDesdeAPI();
  cboCategorias.innerHTML = "";

  cboCategorias.innerHTML += `
            <option disabled selected>Categorías ...</option>
    `;
  CATEGORIAS.forEach(({ id, nombre }) => {
    cboCategorias.innerHTML += `
            <option class="fw-bold" value="${id}">${nombre}</option>
    `;
  });
}

async function validarSession() {
  let data = JSON.parse(localStorage.getItem("session"));
  if (!data) return;

  try {
    const response = await fetch(`${URL_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.resultado == false) {
        location.href = "../pages/login.html";
      }
    } else {
      location.href = "../pages/login.html";
      return;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

/* ==== I N I C I O   D E L   S I S T E M A ==== */
document.addEventListener("DOMContentLoaded", () => {
  validarSession();
  cargarProductosAlHtml();
  cargarCategoriasAlHtml();
  agregarEventoSelImagen();
});
