/* =====================================
   PANEL DE ADMINISTRADOR - CINEMATRON
   Datos guardados en localStorage
===================================== */

const KEY = {
    peliculas: 'cinematron_peliculas',
    funciones: 'cinematron_funciones',
    reservas:  'cinematron_reservas'
};

/* ---------- Protección básica de la página ----------
   login.js debe guardar:  sessionStorage.setItem('admin', '1');
   y luego redirigir a administrador.html
   (Es solo de demostración: no es seguridad real.) */
if (!sessionStorage.getItem('admin')) {
    window.location.href = 'login.html';
}

/* ---------- Utilidades de almacenamiento ---------- */

function cargar(clave) {
    try {
        return JSON.parse(localStorage.getItem(clave)) || [];
    } catch (e) {
        return [];
    }
}

function guardar(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (e) {
        alert('No se pudo guardar la información.');
    }
}

function nuevoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* Crea un elemento con texto seguro (evita inyección de HTML) */
function el(tag, texto, clase) {
    const e = document.createElement(tag);
    if (texto !== undefined) e.textContent = texto;
    if (clase) e.className = clase;
    return e;
}

/* ---------- Referencias al DOM ---------- */

const formPelicula  = document.getElementById('form-pelicula');
const listaPeliculas = document.getElementById('lista-peliculas');
const formFuncion   = document.getElementById('form-funcion');
const selectPelicula = document.getElementById('f-pelicula');
const tbodyFunciones = document.querySelector('#tabla-funciones tbody');
const tbodyReservas  = document.querySelector('#tabla-reservas tbody');

/* ---------- PELÍCULAS ---------- */

function renderPeliculas() {
    const peliculas = cargar(KEY.peliculas);
    listaPeliculas.replaceChildren();

    if (peliculas.length === 0) {
        listaPeliculas.append(el('li', 'No hay películas en cartelera.'));
    }

    peliculas.forEach(p => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.append(el('strong', p.titulo), el('small', `${p.genero} · ${p.duracion} min`));

        const btn = el('button', 'Eliminar', 'btn-del');
        btn.type = 'button';
        btn.addEventListener('click', () => eliminarPelicula(p.id));

        li.append(info, btn);
        listaPeliculas.append(li);
    });

    renderSelectPeliculas(peliculas);
}

function renderSelectPeliculas(peliculas) {
    selectPelicula.replaceChildren();

    if (peliculas.length === 0) {
        const op = el('option', 'Primero crea una película');
        op.value = '';
        selectPelicula.append(op);
        return;
    }

    peliculas.forEach(p => {
        const op = el('option', p.titulo);
        op.value = p.id;
        selectPelicula.append(op);
    });
}

formPelicula.addEventListener('submit', e => {
    e.preventDefault();

    const titulo   = document.getElementById('p-titulo').value.trim();
    const genero   = document.getElementById('p-genero').value.trim();
    const duracion = parseInt(document.getElementById('p-duracion').value, 10);

    if (!titulo || !genero || !duracion) return;

    const peliculas = cargar(KEY.peliculas);

    if (peliculas.some(p => p.titulo.toLowerCase() === titulo.toLowerCase())) {
        alert('Esa película ya está en la cartelera.');
        return;
    }

    peliculas.push({ id: nuevoId(), titulo, genero, duracion });
    guardar(KEY.peliculas, peliculas);

    formPelicula.reset();
    renderPeliculas();
});

function eliminarPelicula(id) {
    if (!confirm('¿Eliminar esta película? También se eliminarán sus funciones.')) return;

    guardar(KEY.peliculas, cargar(KEY.peliculas).filter(p => p.id !== id));
    guardar(KEY.funciones, cargar(KEY.funciones).filter(f => f.peliculaId !== id));

    renderPeliculas();
    renderFunciones();
}

/* ---------- FUNCIONES ---------- */

function renderFunciones() {
    const peliculas = cargar(KEY.peliculas);
    const funciones = cargar(KEY.funciones)
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));

    tbodyFunciones.replaceChildren();

    if (funciones.length === 0) {
        const tr = document.createElement('tr');
        const td = el('td', 'No hay funciones programadas.', 'vacio');
        td.colSpan = 4;
        tr.append(td);
        tbodyFunciones.append(tr);
        return;
    }

    funciones.forEach(f => {
        const peli = peliculas.find(p => p.id === f.peliculaId);
        const tr = document.createElement('tr');

        const tdBtn = document.createElement('td');
        const btn = el('button', 'Eliminar', 'btn-del');
        btn.type = 'button';
        btn.addEventListener('click', () => eliminarFuncion(f.id));
        tdBtn.append(btn);

        tr.append(
            el('td', peli ? peli.titulo : '(película eliminada)'),
            el('td', f.fecha),
            el('td', f.hora),
            tdBtn
        );
        tbodyFunciones.append(tr);
    });
}

formFuncion.addEventListener('submit', e => {
    e.preventDefault();

    const peliculaId = selectPelicula.value;
    const fecha = document.getElementById('f-fecha').value;
    const hora  = document.getElementById('f-hora').value;

    if (!peliculaId || !fecha || !hora) {
        alert('Selecciona película, fecha y hora.');
        return;
    }

    const funciones = cargar(KEY.funciones);

    if (funciones.some(f => f.peliculaId === peliculaId && f.fecha === fecha && f.hora === hora)) {
        alert('Esa función ya existe.');
        return;
    }

    funciones.push({ id: nuevoId(), peliculaId, fecha, hora });
    guardar(KEY.funciones, funciones);

    document.getElementById('f-fecha').value = '';
    document.getElementById('f-hora').value = '';
    renderFunciones();
});

function eliminarFuncion(id) {
    if (!confirm('¿Eliminar esta función?')) return;
    guardar(KEY.funciones, cargar(KEY.funciones).filter(f => f.id !== id));
    renderFunciones();
}

/* ---------- RESERVAS (solo lectura) ----------
   Cada reserva debe guardarse así desde la página del cliente:
   { codigo: 'CIN-1234', pelicula: 'Título', asientos: ['A1','A2'], telefono: '3001234567' } */

function renderReservas() {
    const reservas = cargar(KEY.reservas);
    tbodyReservas.replaceChildren();

    if (reservas.length === 0) {
        const tr = document.createElement('tr');
        const td = el('td', 'Aún no hay reservas.', 'vacio');
        td.colSpan = 4;
        tr.append(td);
        tbodyReservas.append(tr);
        return;
    }

    reservas.forEach(r => {
        const asientos = Array.isArray(r.asientos) ? r.asientos.join(', ') : String(r.asientos ?? '');
        const tr = document.createElement('tr');
        tr.append(
            el('td', r.codigo),
            el('td', r.pelicula),
            el('td', asientos),
            el('td', r.telefono)
        );
        tbodyReservas.append(tr);
    });
}

/* ---------- Cerrar sesión ---------- */

document.getElementById('btn-salir').addEventListener('click', () => {
    sessionStorage.removeItem('admin');
    window.location.href = 'login.html';
});

/* ---------- Inicio ---------- */

renderPeliculas();
renderFunciones();
renderReservas();
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

document.getElementById('btn-salir').addEventListener('click', () => {
    localStorage.removeItem("token");
    window.location.href = 'login.html';
});