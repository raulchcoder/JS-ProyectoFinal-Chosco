/* ==== G L O B A L E S ==== */
let CATEGORIAS = [];
let btnCrear = document.getElementById("btn-crear");
let modal = document.getElementById("modal");
let objModal = new bootstrap.Modal(modal);
let inputNombre = document.getElementById("nombre");
let btnGuardar = document.getElementById("btn-guardar");
let operacion = "create";
const btnLogout = document.getElementById("btn-logout");

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
    guardarCategoriaEnBD({ nombre: inputNombre.value });
  } else if (operacion == "update") {
    actualizarCategoriaEnBD({ id: btnGuardar.getAttribute("data-id"), nombre: inputNombre.value });
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
          eliminarCategoriaEnBD(btn.getAttribute("data-id"));
        }
      });
    });
  });
}
function agregarEventoBtnModificar() {
  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      setEstilosModalSegunAccion("update");
      let categoria = CATEGORIAS.find((cat) => cat.id == btn.getAttribute("data-id"));
      // Completando datos a los campos del form
      btnGuardar.setAttribute("data-id", categoria.id);
      inputNombre.value = categoria.nombre;
      // Fin
      objModal.show();
    });
  });
}

/* ==== F O R M U L A R I O ==== */
function limpiarCamposForm() {
  modal.querySelector("form").reset();
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

/* === U S O   D E    A P I === */
async function actualizarCategoriaEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/categorias`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarCategoriasAlHtml();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function eliminarCategoriaEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/categorias/${data}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarCategoriasAlHtml();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function guardarCategoriaEnBD(data) {
  try {
    const response = await fetch(`${URL_API}/categorias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      cargarCategoriasAlHtml();
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
      // console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    location.href = "../pages/login.html";
    // console.error("Error:", error.message);
  }
}

async function cargarCategoriasAlHtml() {
  CATEGORIAS = await getCategoriasDesdeAPI();
  let tbody = document.querySelector("#tabla-categorias tbody");
  tbody.innerHTML = "";
  CATEGORIAS.forEach((cat) => {
    tbody.innerHTML += `
            <tr>
              <td>${cat.nombre}</td>
              <td class="text-center">
                  <div class="btn-group btn-group-sm" role="group" aria-label="Basic mixed styles example">
                    <button type="button" class="btn btn-sm btn-outline-warning btn-editar" data-id="${cat.id}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${cat.id}">Delete</button>
                  </div>
              </td>
            </tr>
    `;
  });

  agregarEventoBtnEliminar();
  agregarEventoBtnModificar();
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
        // localStorage.setItem("session", JSON.stringify(result.datos));
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
document.addEventListener("DOMContentLoaded", (e) => {
  validarSession();
  cargarCategoriasAlHtml();
});
