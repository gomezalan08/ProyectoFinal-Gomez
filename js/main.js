// --- VARIABLES Y REFERENCIAS DEL DOM ---
let productosDisponibles = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const contenedorProductos = document.getElementById('contenedor-productos');
const contenedorCarrito = document.getElementById('items-carrito');
const precioTotalElemento = document.getElementById('precio-total');
const loaderTexto = document.getElementById('loader-texto');
const inputBuscador = document.getElementById('input-buscador');
const btnVaciar = document.getElementById('btn-vaciar');
const btnFinalizar = document.getElementById('btn-finalizar'); 

// --- CARGA DE PRODUCTOS  ---
const pedirProductos = async () => {
    try {
        const response = await fetch('./data/productos.json');
        const data = await response.json();
        
        productosDisponibles = data;
        loaderTexto.style.display = 'none'; 
        renderizarProductos(productosDisponibles);
    } catch (error) {
        loaderTexto.innerText = "Error: No se pudieron cargar los productos.";
        loaderTexto.classList.add('text-danger');
    }
};

// --- RENDERIZADO DE PRODUCTOS ---
function renderizarProductos(lista) {
    contenedorProductos.innerHTML = "";
    
    lista.forEach(producto => {
        const div = document.createElement('div');
        div.classList.add('col-12', 'col-md-6', 'col-lg-4', 'mb-4');
        div.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${producto.img}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text fw-bold">$${producto.precio}</p>
                    <button id="btn-${producto.id}" class="btn btn-primary mt-auto">Comprar</button>
                </div>
            </div>
        `;
        contenedorProductos.appendChild(div);

        
        document.getElementById(`btn-${producto.id}`).addEventListener('click', () => {
            agregarAlCarrito(producto.id);
        });
    });
}

// --- LÓGICA DEL CARRITO ---
function agregarAlCarrito(id) {
    const producto = productosDisponibles.find(prod => prod.id === id);
    carrito.push(producto);
    
    actualizarCarrito();
    
    // Notificación Toastify (Verde)
    Toastify({
        text: `Agregaste: ${producto.nombre}`,
        duration: 3000,
        gravity: "bottom", 
        position: "right", 
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    
    // Notificación Toastify (Roja)
    Toastify({
        text: "Producto eliminado",
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "#ef4444",
        }
    }).showToast();
}

function actualizarCarrito() {
    contenedorCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach((producto, index) => {
        total += producto.precio;
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');
        
        li.innerHTML = `
            <span class="me-auto">${producto.nombre}</span>
            <div class="d-flex align-items-center">
                <span class="badge bg-primary rounded-pill me-2">$${producto.precio}</span>
                <button class="btn btn-danger btn-sm eliminar-item" data-index="${index}">X</button>
            </div>
        `;
        contenedorCarrito.appendChild(li);
    });

    precioTotalElemento.innerText = total;
    localStorage.setItem('carrito', JSON.stringify(carrito));

    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            eliminarDelCarrito(index);
        });
    });
}

// --- FINALIZAR COMPRA ---
function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            title: 'El carrito está vacío',
            text: 'Agrega productos antes de finalizar.',
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: '¿Confirmar compra?',
        text: `Total a pagar: $${precioTotalElemento.innerText}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, comprar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            Swal.fire(
                '¡Compra exitosa!',
                'Gracias por tu compra en TechStore.',
                'success'
            );
        }
    });
}

// --- EVENTOS GENERALES ---

btnFinalizar.addEventListener('click', finalizarCompra);

btnVaciar.addEventListener('click', () => {
    if(carrito.length === 0) return;

    Swal.fire({
        title: '¿Estás seguro?',
        text: "Se borrarán todos los productos del carrito",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, vaciar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            Swal.fire('Vaciado', 'El carrito está limpio.', 'success');
        }
    });
});

inputBuscador.addEventListener('input', (e) => {
    const busqueda = e.target.value.toLowerCase();
    
    const filtrados = productosDisponibles.filter(prod => 
        prod.nombre.toLowerCase().includes(busqueda)
    );
    renderizarProductos(filtrados);
});

// --- INICIALIZACIÓN ---
pedirProductos(); // Carga el JSON
actualizarCarrito(); // Carga el LocalStorage