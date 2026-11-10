# TechStore - API RESTful con Node.js, Express y MongoDB

API RESTful para gestionar los productos y categorías de una tienda de tecnología, con un front web simple que la consume. Implementa operaciones CRUD, separación de responsabilidades con una capa de servicios, autenticación con JWT y contraseñas encriptadas con bcrypt.

## Esquema de la base de datos

### Colección `categorias`
| Campo | Tipo | Detalle |
|---|---|---|
| nombre | String | Obligatorio, único |
| descripcion | String | Opcional |

### Colección `productos`
| Campo | Tipo | Detalle |
|---|---|---|
| nombre | String | Obligatorio |
| descripcion | String | Opcional |
| precio | Number | Obligatorio, mínimo 0 |
| stock | Number | Obligatorio, mínimo 0 |
| imagen | String | Opcional, link que empieza con http:// o https:// |
| categoria | ObjectId | Obligatorio, referencia a `categorias` (se usa populate) |

### Colección `usuarios`
| Campo | Tipo | Detalle |
|---|---|---|
| nombre | String | Obligatorio |
| email | String | Obligatorio, único |
| password | String | Obligatorio, mínimo 6 caracteres, se guarda encriptada con bcrypt |
| rol | String | `admin` o `cliente` (por defecto `cliente`) |

Todas las colecciones incluyen `createdAt` y `updatedAt` automáticos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas y Mongoose
- bcrypt (encriptación de contraseñas)
- jsonwebtoken (autenticación JWT)
- dotenv (variables de entorno)
- cors
- nodemon (desarrollo)
- HTML, CSS y JavaScript (front)

## Estructura del proyecto

```
proyecto-crud-mongodb/
├── app.js
├── .env
├── package.json
├── public/            <- front (HTML, CSS y JS)
└── src/
    ├── models/
    ├── services/      <- lógica de negocio y acceso a la base
    ├── controllers/   <- manejo de HTTP
    ├── routes/
    ├── config/
    └── middleware/    <- verifyToken (JWT)
```

## Instalación y ejecución

1. Clonar el repositorio:
```bash
git clone https://github.com/gonzaloestudios938-boop/proyecto-crud-mongodb.git
cd proyecto-crud-mongodb
```
2. Instalar dependencias:
```bash
npm install
```
3. Configurar el archivo `.env` con tu cadena de conexión de MongoDB y tu clave JWT (ver ejemplo más abajo).
4. Iniciar el servidor:
```bash
npm run dev
```
(o `npm start` para ejecutarlo sin nodemon).

El servidor corre en `http://localhost:3000`, donde también se ve el front. La API responde en `http://localhost:3000/api`.

## Archivo .env de ejemplo

```
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/tienda?appName=Cluster0
JWT_SECRET=clave_secreta_de_ejemplo
```

## Endpoints

### Usuarios (públicos)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/usuarios/register` | Registrar un usuario |
| POST | `/api/usuarios/login` | Iniciar sesión y obtener el token |

### Categorías
| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| GET | `/api/categorias` | Listar categorías | No |
| POST | `/api/categorias` | Crear una categoría | Sí |
| DELETE | `/api/categorias/:id` | Eliminar una categoría | Sí |

### Productos
| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| GET | `/api/productos` | Listar productos (con la categoría completa) | No |
| GET | `/api/productos/:id` | Obtener un producto por id | No |
| POST | `/api/productos` | Crear un producto | Sí |
| PUT | `/api/productos/:id` | Actualizar un producto | Sí |
| DELETE | `/api/productos/:id` | Eliminar un producto | Sí |

Para las rutas protegidas hay que enviar el header:
```
Authorization: Bearer <token>
```

## Ejemplos de datos (JSON)

### POST /api/usuarios/register
```json
{
  "nombre": "Gonzalo",
  "email": "gonzalo@mail.com",
  "password": "123456"
}
```
Respuesta (201):
```json
{
  "_id": "6aea7a1b6475747f22da1e00",
  "nombre": "Gonzalo",
  "email": "gonzalo@mail.com"
}
```

### POST /api/usuarios/login
```json
{
  "email": "gonzalo@mail.com",
  "password": "123456"
}
```
Respuesta (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "_id": "6aea7a1b6475747f22da1e00",
    "nombre": "Gonzalo",
    "email": "gonzalo@mail.com"
  }
}
```

### POST /api/categorias
```json
{
  "nombre": "Audio",
  "descripcion": "Auriculares, parlantes y micrófonos"
}
```

### POST /api/productos
```json
{
  "nombre": "Auriculares Bluetooth",
  "descripcion": "Auriculares inalámbricos con cancelación de ruido",
  "precio": 45000,
  "stock": 20,
  "imagen": "https://ejemplo.com/auriculares.jpg",
  "categoria": "ID_DE_LA_CATEGORIA"
}
```

### PUT /api/productos/:id
```json
{
  "precio": 39999,
  "stock": 15
}
```

### GET /api/categorias
Respuesta (200):
```json
[
  {
    "_id": "6aea70976475747f22da1ddd",
    "nombre": "Audio",
    "descripcion": "Auriculares, parlantes y micrófonos",
    "createdAt": "2026-11-03T23:39:03.483Z",
    "updatedAt": "2026-11-03T23:39:03.483Z"
  }
]
```

### GET /api/productos
Cada producto trae la categoría completa (populate). Respuesta (200):
```json
[
  {
    "_id": "6aea76f46475747f22da1df0",
    "nombre": "Auriculares Bluetooth",
    "descripcion": "Auriculares inalámbricos con cancelación de ruido",
    "precio": 45000,
    "stock": 20,
    "imagen": "https://ejemplo.com/auriculares.jpg",
    "categoria": {
      "_id": "6aea70976475747f22da1ddd",
      "nombre": "Audio",
      "descripcion": "Auriculares, parlantes y micrófonos"
    },
    "createdAt": "2026-11-04T00:10:44.200Z",
    "updatedAt": "2026-11-04T00:10:44.200Z"
  }
]
```

### GET /api/productos/:id
Devuelve un solo producto, con la misma forma que cada elemento de la lista anterior.
Si el id no existe, responde 404:
```json
{
  "mensaje": "Producto no encontrado"
}
```

### DELETE /api/productos/:id
Respuesta (200):
```json
{
  "mensaje": "Producto eliminado correctamente"
}
```

### DELETE /api/categorias/:id
Respuesta (200):
```json
{
  "mensaje": "Categoría eliminada correctamente"
}
```
Si la categoría tiene productos asociados, responde 400:
```json
{
  "mensaje": "No se puede eliminar: hay productos con esta categoría"
}
```

### Ejemplo de error por falta de token
Al llamar a una ruta protegida sin el header `Authorization`, responde 401:
```json
{
  "mensaje": "Acceso denegado: falta el token"
}
```

### Códigos de respuesta
| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Recurso creado |
| 400 | Datos inválidos, id inválido o categoría inexistente |
| 401 | Falta el token, token inválido o credenciales incorrectas |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

## Funcionalidades implementadas

- CRUD completo de productos
- GET, POST y DELETE de categorías
- Relación producto-categoría con `populate`
- No se puede eliminar una categoría que tenga productos asociados
- Registro y login de usuarios
- Contraseñas encriptadas con bcrypt (pre-save hook de Mongoose)
- Autenticación con JWT y middleware `verifyToken` en las rutas de creación, actualización y eliminación
- Variables de entorno con dotenv y CORS habilitado
- Capa de servicios separada de los controladores
- Front web:
  - Tienda con productos agrupados por categoría y filtros
  - Imagen opcional por producto, que se muestra completa
  - Etiquetas de "Últimas unidades" y "Sin stock"
  - Carrito de compras simple para visitantes (agregar, cambiar cantidades, total y compra simulada), guardado en el navegador
  - Login y panel de administrador para crear, editar y eliminar productos y crear categorías

## Funcionalidades a futuro

- Aplicar permisos según el rol del usuario (hoy cualquier usuario logueado puede gestionar el catálogo)
- Guardar los pedidos reales en la base de datos (colección de órdenes) y descontar el stock al comprar
- Paginación y búsqueda en el listado de productos
- Subida de imágenes desde la computadora