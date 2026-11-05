const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


const formPelicula = document.getElementById('form-pelicula');
const listaPeliculas = document.getElementById('lista-peliculas');
const formFuncion = document.getElementById('form-funcion');
const selectPelicula = document.getElementById('f-pelicula');
const tbodyFunciones = document.querySelector('#tabla-funciones tbody');
const tbodyReservas = document.querySelector('#tabla-reservas tbody');

// Función para crear elementos HTML de forma segura
function el(tag, texto, clase) {
    const e = document.createElement(tag);
    if (texto !== undefined) e.textContent = texto;
    if (clase) e.className = clase;
    return e;
}

// películas 

async function cargarPeliculas() {
    try {
        const res = await fetch(`${API_URL}/peliculas`);
        const data = await res.json();
        const peliculas = data.data;

        listaPeliculas.replaceChildren();
        
        if (peliculas.length === 0) {
            listaPeliculas.append(el('li', 'No hay películas en cartelera.'));
        }

        peliculas.forEach(p => {
            const li = document.createElement('li');
            const info = document.createElement('div');
            info.append(el('strong', p.titulo), el('small', `${p.genero || 'Sin género'}`));

            const btn = el('button', 'Eliminar', 'btn-del');
            btn.type = 'button';
            btn.addEventListener('click', () => eliminarPelicula(p.idPelicula));

            li.append(info, btn);
            listaPeliculas.append(li);
        });

        renderSelectPeliculas(peliculas);
    } catch (error) {
        console.error("Error al cargar películas:", error);
    }
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
        op.value = p.idPelicula;
        selectPelicula.append(op);
    });
}

formPelicula.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('p-titulo').value.trim();
    const genero = document.getElementById('p-genero').value.trim();
    const duracion = document.getElementById('p-duracion').value;
    const sinopsis = document.getElementById('p-sinopsis').value.trim();

    const duracionFormateada = `0${Math.floor(duracion/60)}:${duracion%60}:00`;
        const nuevaPelicula = {
        titulo: titulo,
        genero: genero,
        autor: "Admin",
        anio: 2026,
        duracion: duracionFormateada,
        sinopsis: sinopsis
    };

    try {
        const res = await fetch(`${API_URL}/peliculas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(nuevaPelicula)
        });
        if (res.ok) {
            formPelicula.reset();
            cargarPeliculas(); 
        } else {
            alert("Error al crear película");
        }
    } catch (error) {
        console.error(error);
    }
});

async function eliminarPelicula(id) {
    if (!confirm('¿Eliminar esta película?')) return;
    try {
        await fetch(`${API_URL}/peliculas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarPeliculas();
    } catch (error) {
        console.error(error);
    }
}

// funciones

async function cargarFunciones() {
    try {
        const res = await fetch(`${API_URL}/funciones`);
        const data = await res.json();
        const funciones = data.data;

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
            const tr = document.createElement('tr');
            const tdBtn = document.createElement('td');
            const btn = el('button', 'Eliminar', 'btn-del');
            btn.type = 'button';
            btn.addEventListener('click', () => eliminarFuncion(f.idFuncion));
            tdBtn.append(btn);

            const fechaObj = new Date(f.fechaHora);
            const fechaStr = fechaObj.toLocaleDateString();
            const horaStr = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            tr.append(
                el('td', f.pelicula),
                el('td', fechaStr),
                el('td', horaStr),
                tdBtn
            );
            tbodyFunciones.append(tr);
        });
    } catch (error) {
        console.error("Error al cargar funciones:", error);
    }
}

formFuncion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idPelicula = selectPelicula.value;
    const fecha = document.getElementById('f-fecha').value;
    const hora = document.getElementById('f-hora').value;

    if (!idPelicula || !fecha || !hora) return alert('Selecciona película, fecha y hora.');

    const fechaHora = `${fecha} ${hora}:00`;
    
    const nuevaFuncion = {
        idPelicula: idPelicula,
        idSala: 1, 
        fechaHora: fechaHora,
        precio: 15000
    };

    try {
        const res = await fetch(`${API_URL}/funciones`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevaFuncion)
        });
        if (res.ok) {
            document.getElementById('f-fecha').value = '';
            document.getElementById('f-hora').value = '';
            cargarFunciones();
        } else {
            alert("Error al crear función");
        }
    } catch (error) {
        console.error(error);
    }
});

async function eliminarFuncion(id) {
    if (!confirm('¿Eliminar esta función?')) return;
    try {
        await fetch(`${API_URL}/funciones/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        cargarFunciones();
    } catch (error) {
        console.error(error);
    }
}

// reservas

async function cargarReservas() {
    try {
        const res = await fetch(`${API_URL}/reservas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const reservas = data.data;

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
            const tr = document.createElement('tr');
            tr.append(
                el('td', r.codigo),
                el('td', 'Ver detalle'),
                el('td', 'Asientos'),
                el('td', r.telefono)
            );
            tbodyReservas.append(tr);
        });
    } catch (error) {
        console.error("Error al cargar reservas:", error);
    }
}

// Salir

document.getElementById('btn-salir').addEventListener('click', () => {
    localStorage.removeItem("token");
    window.location.href = 'login.html';
});

// Cargar todo al abrir la página
document.addEventListener("DOMContentLoaded", () => {
    cargarPeliculas();
    cargarFunciones();
    cargarReservas();
});