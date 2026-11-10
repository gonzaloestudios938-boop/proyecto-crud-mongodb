// Recuerdo: como el front se sirve desde el mismo servidor, uso rutas relativas
const API = '/api';

const contenedor = document.getElementById('productos');
const filtros = document.getElementById('filtros');
const hero = document.getElementById('hero');
const zonaSesion = document.getElementById('zona-sesion');
const seccionLogin = document.getElementById('seccion-login');
const formLogin = document.getElementById('form-login');
const mensajeLogin = document.getElementById('mensaje-login');

const panelAdmin = document.getElementById('panel-admin');
const formCategoria = document.getElementById('form-categoria');
const mensajeCategoria = document.getElementById('mensaje-categoria');
const formProducto = document.getElementById('form-producto');
const mensajeProducto = document.getElementById('mensaje-producto');
const tituloFormProducto = document.getElementById('titulo-form-producto');
const botonGuardar = document.getElementById('boton-guardar');
const botonCancelar = document.getElementById('boton-cancelar');
const selectCategoria = document.getElementById('prod-categoria');

// Elementos del carrito
const botonCarrito = document.getElementById('boton-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const overlayCarrito = document.getElementById('overlay-carrito');
const panelCarrito = document.getElementById('panel-carrito');
const botonCerrarCarrito = document.getElementById('cerrar-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const botonFinalizar = document.getElementById('boton-finalizar');
const botonVaciar = document.getElementById('boton-vaciar');
const mensajeCarrito = document.getElementById('mensaje-carrito');

// Recuerdo: si esto tiene un id, el formulario está en modo "editar"; si es null, en modo "crear"
let productoEditandoId = null;

// Guardo lo que traigo de la API para poder filtrar sin volver a pedirlo
let categorias = [];
let productos = [];
// Recuerdo: si es null muestro todas las categorías; si tiene un id, solo esa
let categoriaActiva = null;

// ----- Carrito (todo en el front, no toca la API) -----

// Leo el carrito guardado en el navegador. Si no hay nada o está roto, arranco vacío
const leerCarritoGuardado = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem('carrito'));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return [];
  }
};

// Recuerdo: cada item del carrito es { id, nombre, precio, cantidad }
let carrito = leerCarritoGuardado();

const guardarCarrito = () => {
  try {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  } catch (error) {
    // si el navegador no deja guardar, el carrito funciona igual mientras la página esté abierta
  }
};

const formatearPrecio = (numero) => `$ ${numero.toLocaleString('es-AR')}`;

const mostrarMensajeCarrito = (texto, ok = false) => {
  mensajeCarrito.textContent = texto;
  mensajeCarrito.className = ok ? 'mensaje ok' : 'mensaje';
};

// Cada vez que cargo los productos de la API, actualizo el carrito con los datos nuevos:
// saco lo que se borró o quedó sin stock, y ajusto cantidades y precios
const sincronizarCarrito = () => {
  carrito = carrito
    .map((item) => {
      const producto = productos.find((p) => p._id === item.id);
      if (!producto || producto.stock === 0) return null;
      return {
        id: producto._id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: Math.min(item.cantidad, producto.stock),
      };
    })
    .filter(Boolean);
  guardarCarrito();
};

const abrirCarrito = () => {
  mostrarMensajeCarrito('');
  panelCarrito.classList.add('abierto');
  overlayCarrito.classList.remove('oculto');
};

const cerrarCarrito = () => {
  panelCarrito.classList.remove('abierto');
  overlayCarrito.classList.add('oculto');
};

botonCarrito.addEventListener('click', abrirCarrito);
botonCerrarCarrito.addEventListener('click', cerrarCarrito);
overlayCarrito.addEventListener('click', cerrarCarrito);

// Devuelve true si se pudo agregar, false si ya no queda stock
const agregarAlCarrito = (producto) => {
  const item = carrito.find((i) => i.id === producto._id);
  const cantidadActual = item ? item.cantidad : 0;

  // Recuerdo: no dejo pasar la cantidad del stock disponible
  if (cantidadActual >= producto.stock) return false;

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({
      id: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
  }

  guardarCarrito();
  dibujarCarrito();
  return true;
};

// Sumo o resto una unidad (delta es +1 o -1). Si llega a 0, saco el producto
const cambiarCantidad = (id, delta) => {
  const item = carrito.find((i) => i.id === id);
  const producto = productos.find((p) => p._id === id);
  if (!item || !producto) return;

  mostrarMensajeCarrito('');
  const nuevaCantidad = item.cantidad + delta;

  if (nuevaCantidad <= 0) {
    carrito = carrito.filter((i) => i.id !== id);
  } else if (nuevaCantidad > producto.stock) {
    mostrarMensajeCarrito('No hay más stock de este producto');
    return;
  } else {
    item.cantidad = nuevaCantidad;
  }

  guardarCarrito();
  dibujarCarrito();
};

// Dibujo el contador, la lista y el total del carrito
const dibujarCarrito = () => {
  const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  contadorCarrito.textContent = cantidadTotal;

  listaCarrito.innerHTML = '';

  if (carrito.length === 0) {
    const vacio = document.createElement('p');
    vacio.className = 'carrito-vacio';
    vacio.textContent = 'Tu carrito está vacío';
    listaCarrito.appendChild(vacio);
  }

  carrito.forEach((item) => {
    const fila = document.createElement('div');
    fila.className = 'carrito-item';

    // Uso textContent y no innerHTML para que nadie pueda meter código en los datos
    const nombre = document.createElement('p');
    nombre.className = 'carrito-item-nombre';
    nombre.textContent = item.nombre;

    const precio = document.createElement('p');
    precio.className = 'carrito-item-precio';
    precio.textContent = `${formatearPrecio(item.precio)} c/u`;

    const controles = document.createElement('div');
    controles.className = 'carrito-item-controles';

    const botonMenos = document.createElement('button');
    botonMenos.className = 'boton-cantidad secundario';
    botonMenos.textContent = '-';
    botonMenos.addEventListener('click', () => cambiarCantidad(item.id, -1));

    const cantidad = document.createElement('span');
    cantidad.className = 'cantidad';
    cantidad.textContent = item.cantidad;

    const botonMas = document.createElement('button');
    botonMas.className = 'boton-cantidad';
    botonMas.textContent = '+';
    botonMas.addEventListener('click', () => cambiarCantidad(item.id, 1));

    const subtotal = document.createElement('span');
    subtotal.className = 'carrito-item-subtotal';
    subtotal.textContent = formatearPrecio(item.precio * item.cantidad);

    controles.append(botonMenos, cantidad, botonMas, subtotal);
    fila.append(nombre, precio, controles);
    listaCarrito.appendChild(fila);
  });

  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  totalCarrito.textContent = formatearPrecio(total);
};

botonVaciar.addEventListener('click', () => {
  carrito = [];
  guardarCarrito();
  dibujarCarrito();
  mostrarMensajeCarrito('');
});

// Recuerdo: la compra es simulada. No guardo ningún pedido ni descuento stock en la base
botonFinalizar.addEventListener('click', () => {
  if (carrito.length === 0) {
    mostrarMensajeCarrito('El carrito está vacío');
    return;
  }

  carrito = [];
  guardarCarrito();
  dibujarCarrito();
  mostrarMensajeCarrito('¡Gracias por tu compra! Es una simulación: no se guardó ningún pedido.', true);
});

// ----- Sesión -----

const obtenerToken = () => localStorage.getItem('token');

// Dibujo la parte de arriba a la derecha y muestro u oculto cosas según haya sesión
const mostrarSesion = () => {
  zonaSesion.innerHTML = '';

  if (obtenerToken()) {
    const saludo = document.createElement('span');
    saludo.textContent = `Hola, ${localStorage.getItem('nombre')}`;

    const botonSalir = document.createElement('button');
    botonSalir.textContent = 'Cerrar sesión';
    botonSalir.addEventListener('click', cerrarSesion);

    zonaSesion.append(saludo, botonSalir);
    seccionLogin.classList.add('oculto');
    panelAdmin.classList.remove('oculto');
    hero.classList.add('oculto'); // el admin no necesita ver el banner
    botonCarrito.classList.add('oculto'); // ni el carrito
    cerrarCarrito();
  } else {
    const botonEntrar = document.createElement('button');
    botonEntrar.textContent = 'Iniciar sesión';
    botonEntrar.addEventListener('click', () => {
      seccionLogin.classList.toggle('oculto');
    });

    zonaSesion.append(botonEntrar);
    panelAdmin.classList.add('oculto');
    hero.classList.remove('oculto');
    botonCarrito.classList.remove('oculto');
  }
};

const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre');
  salirDeEdicion();
  mostrarSesion();
  dibujarCatalogo(); // vuelvo a dibujar para que cambien los botones de las tarjetas
};

// Recuerdo: uso esta función para todos los pedidos que necesitan token.
// Si la API responde 401, el token venció o es inválido, así que cierro la sesión
const pedidoProtegido = async (url, opciones = {}) => {
  const respuesta = await fetch(url, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${obtenerToken()}`,
    },
  });

  if (respuesta.status === 401) {
    cerrarSesion();
    throw new Error('Tu sesión venció, iniciá sesión de nuevo');
  }

  return respuesta;
};

// Login
formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensajeLogin.textContent = '';

  const datos = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
  };

  try {
    const respuesta = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensajeLogin.textContent = resultado.mensaje;
      return;
    }

    localStorage.setItem('token', resultado.token);
    localStorage.setItem('nombre', resultado.usuario.nombre);
    formLogin.reset();
    mostrarSesion();
    dibujarCatalogo(); // vuelvo a dibujar para que aparezcan los botones de editar y eliminar
  } catch (error) {
    mensajeLogin.textContent = 'No se pudo conectar con el servidor';
  }
});

// ----- Categorías (formulario del admin) -----

// Lleno el desplegable del formulario de productos con las categorías
const llenarSelectCategorias = () => {
  selectCategoria.innerHTML = '';

  const opcionInicial = document.createElement('option');
  opcionInicial.value = '';
  opcionInicial.textContent = 'Elegí una categoría';
  selectCategoria.appendChild(opcionInicial);

  categorias.forEach((categoria) => {
    const opcion = document.createElement('option');
    opcion.value = categoria._id; // guardo el id, que es lo que pide la API
    opcion.textContent = categoria.nombre;
    selectCategoria.appendChild(opcion);
  });
};

formCategoria.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensajeCategoria.textContent = '';
  mensajeCategoria.className = 'mensaje';

  const datos = {
    nombre: document.getElementById('cat-nombre').value,
    descripcion: document.getElementById('cat-descripcion').value,
  };

  try {
    const respuesta = await pedidoProtegido(`${API}/categorias`, {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensajeCategoria.textContent = resultado.mensaje;
      return;
    }

    mensajeCategoria.textContent = 'Categoría creada';
    mensajeCategoria.className = 'mensaje ok';
    formCategoria.reset();
    cargarDatos(); // recargo todo: aparece la categoría en el desplegable, en los filtros y como título
  } catch (error) {
    mensajeCategoria.textContent = error.message;
  }
});

// ----- Productos (formulario del admin) -----

// Dejo el formulario de productos en modo "crear"
const salirDeEdicion = () => {
  productoEditandoId = null;
  formProducto.reset();
  tituloFormProducto.textContent = 'Nuevo producto';
  botonGuardar.textContent = 'Crear producto';
  botonCancelar.classList.add('oculto');
};

botonCancelar.addEventListener('click', salirDeEdicion);

// Paso el formulario a modo "editar" y lo relleno con los datos del producto
const empezarEdicion = (producto) => {
  productoEditandoId = producto._id;
  document.getElementById('prod-nombre').value = producto.nombre;
  document.getElementById('prod-descripcion').value = producto.descripcion;
  document.getElementById('prod-imagen').value = producto.imagen || '';
  document.getElementById('prod-precio').value = producto.precio;
  document.getElementById('prod-stock').value = producto.stock;
  selectCategoria.value = producto.categoria._id;

  tituloFormProducto.textContent = 'Editando producto';
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelar.classList.remove('oculto');
  mensajeProducto.textContent = '';

  formProducto.scrollIntoView({ behavior: 'smooth' });
};

// Recuerdo: este mismo formulario sirve para crear (POST) y para editar (PUT)
formProducto.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  mensajeProducto.textContent = '';
  mensajeProducto.className = 'mensaje';

  const datos = {
    nombre: document.getElementById('prod-nombre').value,
    descripcion: document.getElementById('prod-descripcion').value,
    imagen: document.getElementById('prod-imagen').value,
    precio: Number(document.getElementById('prod-precio').value),
    stock: Number(document.getElementById('prod-stock').value),
    categoria: selectCategoria.value,
  };

  const editando = productoEditandoId !== null;
  const url = editando ? `${API}/productos/${productoEditandoId}` : `${API}/productos`;
  const metodo = editando ? 'PUT' : 'POST';

  try {
    const respuesta = await pedidoProtegido(url, {
      method: metodo,
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      mensajeProducto.textContent = resultado.mensaje;
      return;
    }

    mensajeProducto.textContent = editando ? 'Producto actualizado' : 'Producto creado';
    mensajeProducto.className = 'mensaje ok';
    salirDeEdicion();
    cargarDatos();
  } catch (error) {
    mensajeProducto.textContent = error.message;
  }
});

const eliminarProducto = async (producto) => {
  // Pido confirmación para no borrar por error
  if (!confirm(`¿Seguro que querés eliminar "${producto.nombre}"?`)) return;

  try {
    const respuesta = await pedidoProtegido(`${API}/productos/${producto._id}`, {
      method: 'DELETE',
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      alert(resultado.mensaje);
      return;
    }

    // Si justo estaba editando ese producto, salgo del modo edición
    if (productoEditandoId === producto._id) salirDeEdicion();
    cargarDatos();
  } catch (error) {
    alert(error.message);
  }
};

// ----- Catálogo (lo que ve el visitante) -----

// Armo la tarjeta de un producto
const crearTarjeta = (producto) => {
  const tarjeta = document.createElement('div');
  tarjeta.className = 'tarjeta';

  const imagen = document.createElement('div');
  imagen.className = 'tarjeta-imagen';

  // La inicial del producto la uso cuando no hay foto o cuando la foto no carga
  const inicial = document.createElement('span');
  inicial.className = 'inicial';
  inicial.textContent = producto.nombre.charAt(0).toUpperCase();

  if (producto.imagen) {
    const foto = document.createElement('img');
    foto.src = producto.imagen;
    foto.alt = producto.nombre;
    foto.loading = 'lazy';

    // Recuerdo: si el link está roto, saco la foto y muestro la inicial
    foto.addEventListener('error', () => {
      foto.remove();
      imagen.classList.add('sin-foto');
      imagen.prepend(inicial);
    });

    imagen.appendChild(foto);
  } else {
    imagen.classList.add('sin-foto');
    imagen.appendChild(inicial);
  }

  // Etiqueta según el stock: sin stock o últimas unidades
  if (producto.stock === 0) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-stock agotado';
    etiqueta.textContent = 'Sin stock';
    imagen.appendChild(etiqueta);
  } else if (producto.stock <= 5) {
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-stock';
    etiqueta.textContent = 'Últimas unidades';
    imagen.appendChild(etiqueta);
  }

  const cuerpo = document.createElement('div');
  cuerpo.className = 'tarjeta-cuerpo';

  // Uso textContent y no innerHTML para que nadie pueda meter código en los datos
  const titulo = document.createElement('h3');
  titulo.textContent = producto.nombre;

  const descripcion = document.createElement('p');
  descripcion.className = 'descripcion';
  descripcion.textContent = producto.descripcion;

  const precio = document.createElement('p');
  precio.className = 'precio';
  precio.textContent = formatearPrecio(producto.precio);

  const stock = document.createElement('p');
  stock.className = 'stock';
  stock.textContent = `Stock: ${producto.stock}`;

  cuerpo.append(titulo, descripcion, precio, stock);

  if (obtenerToken()) {
    // Si hay sesión (admin), muestro editar y eliminar
    const acciones = document.createElement('div');
    acciones.className = 'acciones';

    const botonEditar = document.createElement('button');
    botonEditar.textContent = 'Editar';
    botonEditar.addEventListener('click', () => empezarEdicion(producto));

    const botonEliminar = document.createElement('button');
    botonEliminar.textContent = 'Eliminar';
    botonEliminar.className = 'peligro';
    botonEliminar.addEventListener('click', () => eliminarProducto(producto));

    acciones.append(botonEditar, botonEliminar);
    cuerpo.appendChild(acciones);
  } else {
    // Si no hay sesión (visitante), muestro el botón de agregar al carrito
    const botonComprar = document.createElement('button');
    botonComprar.className = 'boton-comprar';

    if (producto.stock === 0) {
      botonComprar.textContent = 'Sin stock';
      botonComprar.disabled = true;
    } else {
      botonComprar.textContent = 'Agregar al carrito';
      botonComprar.addEventListener('click', () => {
        const agregado = agregarAlCarrito(producto);
        botonComprar.textContent = agregado ? '¡Agregado!' : 'No hay más stock';

        // Recuerdo: después de un ratito el botón vuelve a su texto normal
        setTimeout(() => {
          botonComprar.textContent = 'Agregar al carrito';
        }, 1200);
      });
    }

    cuerpo.appendChild(botonComprar);
  }

  tarjeta.append(imagen, cuerpo);
  return tarjeta;
};

// Dibujo los botones de filtro: "Todos" y uno por cada categoría
const dibujarFiltros = () => {
  filtros.innerHTML = '';

  const crearChip = (texto, id) => {
    const chip = document.createElement('button');
    chip.className = categoriaActiva === id ? 'chip activo' : 'chip';
    chip.textContent = texto;
    chip.addEventListener('click', () => {
      categoriaActiva = id;
      dibujarFiltros();
      dibujarCatalogo();
    });
    return chip;
  };

  filtros.appendChild(crearChip('Todos', null));
  categorias.forEach((categoria) => {
    filtros.appendChild(crearChip(categoria.nombre, categoria._id));
  });
};

// Dibujo las secciones con los datos que ya tengo guardados (sin volver a pedir a la API)
const dibujarCatalogo = () => {
  contenedor.innerHTML = '';

  if (categorias.length === 0) {
    contenedor.textContent = 'Todavía no hay categorías cargadas';
    return;
  }

  // Si hay un filtro activo, muestro solo esa categoría
  const categoriasAMostrar = categoriaActiva
    ? categorias.filter((categoria) => categoria._id === categoriaActiva)
    : categorias;

  categoriasAMostrar.forEach((categoria) => {
    const seccion = document.createElement('section');
    seccion.className = 'seccion-categoria';

    // Gracias al populate, producto.categoria es un objeto, así que comparo por su _id
    const productosDeLaCategoria = productos.filter(
      (producto) => producto.categoria && producto.categoria._id === categoria._id
    );

    const tituloCategoria = document.createElement('h3');
    tituloCategoria.className = 'titulo-categoria';
    tituloCategoria.textContent = `${categoria.nombre} `;

    const cantidad = document.createElement('small');
    cantidad.textContent = `(${productosDeLaCategoria.length})`;
    tituloCategoria.appendChild(cantidad);

    const grilla = document.createElement('div');
    grilla.className = 'grilla';

    if (productosDeLaCategoria.length === 0) {
      const vacio = document.createElement('p');
      vacio.className = 'vacio';
      vacio.textContent = 'Todavía no hay productos en esta categoría';
      grilla.appendChild(vacio);
    } else {
      productosDeLaCategoria.forEach((producto) => {
        grilla.appendChild(crearTarjeta(producto));
      });
    }

    seccion.append(tituloCategoria, grilla);
    contenedor.appendChild(seccion);
  });
};

// Pido categorías y productos a la API, los guardo y dibujo todo.
// Recuerdo: la llamo al abrir la página y cada vez que se crea, edita o borra algo
const cargarDatos = async () => {
  try {
    // Pido las dos cosas al mismo tiempo
    const [respuestaCategorias, respuestaProductos] = await Promise.all([
      fetch(`${API}/categorias`),
      fetch(`${API}/productos`),
    ]);
    categorias = await respuestaCategorias.json();
    productos = await respuestaProductos.json();

    // Si el filtro activo era de una categoría que ya no existe, lo reseteo
    if (!categorias.some((categoria) => categoria._id === categoriaActiva)) {
      categoriaActiva = null;
    }

    sincronizarCarrito(); // el carrito se ajusta a los precios y stock actuales
    llenarSelectCategorias();
    dibujarFiltros();
    dibujarCatalogo();
    dibujarCarrito();
  } catch (error) {
    contenedor.textContent = 'No se pudieron cargar los productos';
  }
};

// ----- Al abrir la página -----
mostrarSesion();
dibujarCarrito();
cargarDatos();