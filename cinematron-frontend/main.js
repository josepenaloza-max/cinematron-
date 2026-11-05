const API_URL = "http://localhost:3000/api";
let funcionActual = null;
let asientosSeleccionados = [];
let precioEntrada = 0;

// --- 1. NAVEGACIÓN ENTRE PANTALLAS ---
function mostrarSeccion(id) {
  document.querySelectorAll("main").forEach((m) => (m.hidden = true));
  document.getElementById(`vista-${id}`).hidden = false;
  window.scrollTo(0, 0);
}

// --- 2. CARGAR CARTELERA DESDE EL BACKEND ---
async function cargarCartelera() {
  try {
    // Asumiendo que tienes un endpoint GET /api/funciones que trae pelicula y sala
    const response = await fetch(`${API_URL}/funciones`);
    const data = await response.json();

    const grid = document.getElementById("grid-peliculas");
    grid.innerHTML = "";

    if (data.data.length === 0) {
      grid.innerHTML = "<p>No hay funciones disponibles.</p>";
      return;
    }

    // Agrupar funciones por película
    const peliculas = {};
    data.data.forEach((func) => {
      if (!peliculas[func.pelicula]) {
        peliculas[func.pelicula] = [];
      }
      peliculas[func.pelicula].push(func);
    });

    // Dibujar las tarjetas
    for (const [nombrePelicula, funciones] of Object.entries(peliculas)) {
      const colores = ["#79C7FF", "#FF8FB8", "#FFE14D", "#9BF0C9"];
      const colorRandom = colores[Math.floor(Math.random() * colores.length)];

      let botonesFunciones = funciones
        .map((f) => {
          const hora = new Date(f.fechaHora).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `<button class="btn-funcion" onclick="seleccionarFuncion(${f.idFuncion}, '${nombrePelicula}', '${f.sala}', ${f.precio})">
                    ${hora} <small>${f.sala} - ${f.tipo_sala}</small>
                </button>`;
        })
        .join("");

      grid.innerHTML += `
                <article class="film-card box">
                    <div class="film-header" style="background:${colorRandom}">
                        <h3>${nombrePelicula}</h3>
                    </div>
                    <div class="film-body">
                        <p class="meta">Selecciona tu horario:</p>
                        <div class="funciones-lista">
                            ${botonesFunciones}
                        </div>
                    </div>
                </article>
            `;
    }
  } catch (error) {
    console.error("Error cargando cartelera:", error);
    document.getElementById("grid-peliculas").innerHTML =
      "<p>Error al conectar con el servidor. ¿Está encendido Node.js?</p>";
  }
}

// --- 3. SELECCIONAR FUNCIÓN Y VER ASIENTOS ---
async function seleccionarFuncion(id, pelicula, sala, precio) {
  funcionActual = { id, pelicula, sala };
  precioEntrada = precio;
  asientosSeleccionados = [];
  actualizarResumen();

  document.getElementById("titulo-asientos").textContent =
    `${pelicula} - ${sala}`;
  mostrarSeccion("asientos");

  try {
    // 1. Traemos TODOS los asientos de la sala (necesitamos saber el ID de la sala, asumiremos que la 1 es ID 1, etc.)
    // Como en el HTML no tenemos el ID de la sala, lo extraemos del nombre (ej. "Sala 1" -> 1)
    const idSala = parseInt(sala.replace(/\D/g, "")) || 1;

    const resTodos = await fetch(`${API_URL}/asientos/sala/${idSala}`);
    const dataTodos = await resTodos.json();

    // 2. Traemos los asientos OCUPADOS para esta función específica
    const resOcupados = await fetch(
      `${API_URL}/asientos/funcion/${id}/ocupados`,
    );
    const dataOcupados = await resOcupados.json();

    // Creamos un arreglo con los IDs de los asientos ocupados
    const idsOcupados = dataOcupados.data.map((a) => a.idAsiento);

    const grid = document.getElementById("grid-asientos");
    grid.innerHTML = "";

    // 3. Dibujamos TODOS los asientos de la sala
    dataTodos.data.forEach((asiento) => {
      const div = document.createElement("div");
      div.className = "asiento";
      div.dataset.id = asiento.idAsiento;

      // Si el asiento está en la lista de ocupados, le ponemos la clase 'ocupado'
      if (idsOcupados.includes(asiento.idAsiento)) {
        div.classList.add("ocupado");
      } else {
        // Si está libre, le activamos el clic para seleccionar
        div.onclick = () => toggleAsiento(div, asiento);
      }

      div.innerHTML = `
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.9707031 2C7.3167031 2 5.9707031 3.346 5.9707031 5L5.9804688 8.1386719C7.1614687 8.4556719 8.1586406 9.3175781 8.6816406 10.517578L9.5019531 12L14.484375 12L15.363281 10.388672C15.865281 9.2456719 16.853344 8.4347656 18.027344 8.1347656L18.027344 5C18.027344 3.346 16.681344 2 15.027344 2L8.9707031 2 z M 19.027344 10C18.208344 10 17.471969 10.498766 17.167969 11.259766L15.671875 14L8.3222656 14L6.8808594 11.392578C6.5888594 10.662578 5.9421563 10.083766 5.1601562 10.009766C4.7601562 9.9727656 4.3715781 10.050234 4.0175781 10.240234C3.1005781 10.733234 2.7731563 11.899234 3.1601562 12.865234L4.859375 16.115234C5.315375 17.253234 6.4185313 18 7.6445312 18L11 18L11 20L8 20L8 22L16 22L16 20L13 20L13 18L16.347656 18C17.574656 18 18.677813 17.252281 19.132812 16.113281L20.841797 12.841797C21.211797 11.915797 20.919453 10.806969 20.064453 10.292969C19.744453 10.099969 19.392344 10 19.027344 10 z"></path>
                </svg>
                <span>${asiento.fila}${asiento.columna}</span>
            `;

      grid.appendChild(div);
    });
  } catch (error) {
    console.error("Error al cargar asientos:", error);
  }
}

// --- 4. LÓGICA DE SELECCIÓN DE ASIENTOS ---
function toggleAsiento(elemento, asiento) {
  const id = asiento.idAsiento;
  if (asientosSeleccionados.includes(id)) {
    // Deseleccionar
    asientosSeleccionados = asientosSeleccionados.filter((a) => a !== id);
    elemento.classList.remove("seleccionado");
  } else {
    // Seleccionar (Máximo 4)
    if (asientosSeleccionados.length >= 4) {
      alert("Solo puedes seleccionar hasta 4 asientos.");
      return;
    }
    asientosSeleccionados.push(id);
    elemento.classList.add("seleccionado");
  }
  actualizarResumen();
}

function actualizarResumen() {
  const txtAsientos = document.getElementById("asientos-seleccionados");
  const txtTotal = document.getElementById("total-pagar");
  const btn = document.getElementById("btn-ir-formulario");

  if (asientosSeleccionados.length === 0) {
    txtAsientos.textContent = "Ninguno";
    txtTotal.textContent = "$0";
    btn.disabled = true;
  } else {
    txtAsientos.textContent = `${asientosSeleccionados.length} asientos`;
    txtTotal.textContent =
      "$" + (asientosSeleccionados.length * precioEntrada).toLocaleString();
    btn.disabled = false;
  }
}

// --- 5. CONFIRMAR RESERVA (GUARDAR EN MYSQL) ---
async function confirmarReserva(event) {
  event.preventDefault();
  const btn = event.target.querySelector("button");
  btn.textContent = "Procesando...";
  btn.disabled = true;

  const datos = {
    nombre: document.getElementById("nombre").value,
    apellido: "", // Opcional
    cedula: document.getElementById("cedula").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
    funcionId: funcionActual.id,
    asientosIds: asientosSeleccionados,
  };

  try {
    const res = await fetch(`${API_URL}/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json();

    if (data.success) {
      // Llenar el comprobante
      const d = data.data;
      document.getElementById("ticket-codigo").textContent = d.codigo;
      document.getElementById("ticket-cliente").textContent = d.cliente;
      document.getElementById("ticket-cedula").textContent = d.cedula;
      document.getElementById("ticket-pelicula").textContent = d.pelicula;
      document.getElementById("ticket-funcion").textContent = new Date(
        d.fechaHora,
      ).toLocaleString();
      document.getElementById("ticket-asientos").textContent = d.asientos;
      document.getElementById("ticket-total").textContent =
        "$" + (asientosSeleccionados.length * precioEntrada).toLocaleString();

      mostrarSeccion("comprobante");
    } else {
      alert("Error: " + data.message);
      btn.textContent = "Confirmar Reserva";
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    alert("Error al conectar con el servidor.");
    btn.textContent = "Confirmar Reserva";
    btn.disabled = false;
  }
}

// --- 6. DESCARGAR PDF ---
function descargarPDF() {
  const elemento = document.getElementById("ticket");
  html2pdf().from(elemento).save("reserva-cinematron.pdf");
}

// --- 7. LOGIN ADMIN ---
async function hacerLogin(event) {
  event.preventDefault();
  const user = document.getElementById("admin-user").value;
  const pass = document.getElementById("admin-pass").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: user, password: pass }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.data.token);
      document.getElementById("form-login").hidden = true;
      document.getElementById("admin-panel").hidden = false;
    } else {
      alert("Credenciales incorrectas");
    }
  } catch (error) {
    alert("Error de conexión");
  }
}

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  cargarCartelera();
  mostrarSeccion("cartelera");
});

// --- 8. FILTRAR POR SALA (OPCIONAL) ---
function filtrarSala(idSala) {
  // Por ahora, esta función solo recarga la cartelera para que no dé error
  console.log("Filtrando por sala:", idSala);
  cargarCartelera();
}
