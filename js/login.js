let formLogin = document.getElementById("login-form");
let usuario = document.getElementById("usuario");
let password = document.getElementById("password");
let btnEnviar = document.getElementById("login-btn");

function validarFormulario() {
  if (usuario.value.trim() == "" || password.value.trim() == "") {
    Swal.fire({
      icon: "error",
      title: "Validación",
      text: "Debe completar todos los campos",
    });
    return false;
  }
  return true;
}

function habilitarBtnEnviar() {
  if (usuario.value.trim().length > 3 && password.value.trim().length > 3) {
    btnEnviar.removeAttribute("disabled");
    return;
  }
  btnEnviar.disabled = true;
}

document.addEventListener("DOMContentLoaded", (e) => {
  validarSession();
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    realizarLogin();
  });
  //
  usuario.addEventListener("focusout", (e) => {
    if (usuario.value.trim().length < 4) {
      if (!usuario.classList.contains("is-invalid")) usuario.classList.add("is-invalid");
      habilitarBtnEnviar();
      return;
    }
    usuario.classList.remove("is-invalid");
    habilitarBtnEnviar();
  });
  //
  password.addEventListener("focusout", (e) => {
    if (password.value.trim().length < 4) {
      if (!password.classList.contains("is-invalid")) password.classList.add("is-invalid");
      habilitarBtnEnviar();
      return;
    }
    password.classList.remove("is-invalid");
    habilitarBtnEnviar();
  });
}); /* DOMContentLoaded */

/* ====== U S O    D E   A P I ===== */
async function realizarLogin() {
  if (!validarFormulario()) return;
  let data = {
    usuario: usuario.value,
    password: password.value,
  };
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
      if (result.resultado == true) {
        localStorage.setItem("session", JSON.stringify(result.datos));
        window.location.href = "../pages/categorias.html";
      }
    } else {
      const result = await response.json();
      Swal.fire({
        icon: "error",
        title: "Validación",
        text: result.mensaje,
      });
      // console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
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
      if (result.resultado == true) {
        // localStorage.setItem("session", JSON.stringify(result.datos));
        location.href = "../pages/categorias.html";
      }
    } else {
      return;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}
