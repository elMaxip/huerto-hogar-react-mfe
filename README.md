# HuertoHogar — Tienda online con React y micro-frontends

Proyecto para la **segunda evaluación** de la asignatura **Fullstack 2**. Es la evolución de la primera entrega (`fullstack-2-ev-1`, hecha con Web Components y TypeScript): la misma tienda **HuertoHogar**, ahora con **React** y dividida en **micro-frontends** con **Module Federation**.

## Qué problema resuelve

HuertoHogar vende frutas, verduras y productos orgánicos/lácteos de productores locales y necesita una tienda web donde los clientes puedan explorar el catálogo, ver el detalle de los productos, crear una cuenta, iniciar sesión y armar un carrito.

Además del caso de negocio, el proyecto busca resolver un problema de arquitectura: **separar la aplicación en partes independientes** (tienda, autenticación y carrito) que se desarrollan, compilan y despliegan por separado, pero que el usuario ve como una sola página.

## Cómo lo hace

La aplicación es un **monorepo con pnpm workspaces** que contiene cuatro aplicaciones Vite + React y un paquete compartido:

```
              ┌────────────────────────── host :5173 ──────────────────────────┐
              │  Router, layout (navbar, footer), errores y 404                │
              └───────┬────────────────────┬────────────────────┬──────────────┘
                      │ remoteEntry.js     │ remoteEntry.js     │ remoteEntry.js
              ┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
              │  shop  :5174  │    │  auth  :5175  │    │  cart  :5176  │
              │ home, catálogo│    │ login,registro│    │    carrito    │
              │  y producto   │    │ y SessionCard │    │               │
              └───────────────┘    └───────────────┘    └───────────────┘
                         todos usan  packages/shared  (@huerto/shared)
```

- **`apps/host`**: la aplicación contenedora. Define las rutas con React Router y carga cada página desde su remoto con `lazy: () => import("shop/home")`, etc. También tiene la navbar, el footer, la barra de progreso de navegación y las páginas de error.
- **`apps/shop`**: expone `home`, `catalog` y `product`.
- **`apps/auth`**: expone `login`, `register` y el componente `SessionCard` que se muestra en el menú de cuenta.
- **`apps/cart`**: expone la página `cart`.
- **`packages/shared`** (`@huerto/shared`): modelos, servicios (IndexedDB, carrito, sesión, validadores), hooks, componentes de UI (`InputLabel`, `Modal`, `PrimaryButton`), imágenes de productos y estilos globales.

Cada remoto expone un **módulo de ruta** (`src/routes/*.ts`) que exporta `Component` y `loader`, el formato que espera `lazy` de React Router. Así los datos se cargan **antes** de renderizar la página.

Como no hay backend, los datos se guardan en el navegador: **IndexedDB** para productos y usuarios, y **localStorage** para el carrito y la sesión.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| **React 19** | Interfaz de usuario. |
| **React Compiler** | Memoización automática de componentes (plugin de Babel). |
| **React Router 8** | Rutas, `loader`s, carga diferida y manejo de errores. |
| **TypeScript** | Tipado estricto en todas las apps. |
| **Vite** | Servidor de desarrollo y build de cada app. |
| **Module Federation** (`@module-federation/vite`) | Micro-frontends: carga de remotos en tiempo de ejecución, dependencias compartidas y tipos generados (`@mf-types`). |
| **pnpm workspaces** | Monorepo con `apps/*` y `packages/*`. |
| **React Hook Form + Zod** | Formularios de inicio de sesión y registro con validación por esquema. |
| **CSS Modules** | Estilos encapsulados por componente. |
| **IndexedDB / localStorage** | Persistencia en el navegador. |
| **ESLint** | Linter con reglas de hooks y React Refresh. |

## Cómo usar el proyecto

Requisitos: **Node.js** y **pnpm**.

```bash
pnpm install    # instala las dependencias de todo el monorepo
pnpm dev        # levanta host y remotos en modo desarrollo
pnpm build      # compila todas las apps
pnpm preview    # sirve las builds en paralelo
pnpm lint       # ejecuta ESLint en todas las apps
```

Después abre **http://localhost:5173** (el host). Los puertos están definidos en `federation.config.ts`:

| App | Puerto |
| --- | --- |
| host | 5173 |
| shop | 5174 |
| auth | 5175 |
| cart | 5176 |

Los puertos usan `strictPort`, así que tienen que estar libres. También se puede correr una sola app con `pnpm --filter <app> dev` (por ejemplo `pnpm --filter shop dev`); el host necesita que los remotos estén levantados para mostrar sus páginas.

### Despliegue

Las URLs de los remotos se pueden cambiar con variables de entorno al compilar el host, sin tocar el código:

```bash
SHOP_URL=https://shop.ejemplo.com AUTH_URL=https://auth.ejemplo.com CART_URL=https://cart.ejemplo.com pnpm --filter host build
```

Si no se definen, se usa `http://localhost:<puerto>`.

## Funcionalidades

- **Inicio**: productos en oferta, destacados y tarjetas de categorías.
- **Catálogo** con filtro por categoría (`/catalog/frutas-frescas`, `/catalog/verdura-organica`…).
- **Detalle de producto**: precio con descuento, stock, unidad de venta y selector de cantidad.
- **Carrito**: modificar cantidades, eliminar productos, vaciar el carrito, total con descuentos y compra simulada.
- **Registro e inicio de sesión** con validaciones (email válido, nombre de al menos 3 caracteres, contraseña de al menos 8, confirmación y email no repetido).
- **Menú de cuenta** en un modal: muestra el usuario conectado o los enlaces para iniciar sesión / registrarse.
- **Estado sincronizado entre pestañas**: si se cierra sesión o cambia el carrito en una pestaña, las demás se actualizan.
- **Barra de progreso** mientras se cargan los datos de una ruta.
- **Manejo de errores**: página 404 y página "Algo salió mal" si un remoto no está disponible, sin que se caiga toda la aplicación.
- **Blog** y **Nosotros**: enlaces en la navbar, páginas pendientes (por ahora muestran el 404).

## Estructura

```
├── federation.config.ts     Puertos, URLs de remotos y config común de Module Federation
├── pnpm-workspace.yaml
├── apps/
│   ├── host/                Contenedor: router, layout, navbar, errores
│   ├── shop/                Home, catálogo y producto
│   ├── auth/                Login, registro y SessionCard
│   └── cart/                Carrito
└── packages/
    └── shared/              @huerto/shared
        └── src/
            ├── models/      Product, User, categorías y formato de precio
            ├── services/    IndexedDB, carrito, sesión, storage, validadores
            ├── hooks/       useCart, useSession
            ├── ui/          InputLabel, Modal, PrimaryButton
            ├── assets/      Imágenes de productos
            └── styles/      Estilos globales y variables CSS
```

## Decisiones técnicas

- **Micro-frontends por dominio.** Tienda, autenticación y carrito son responsabilidades distintas; separarlas permite trabajar y desplegar cada una sin recompilar las demás.
- **Configuración centralizada** en `federation.config.ts`: puertos, URLs y opciones comunes (`shared`, `dts`, `remoteHmr`, `bundleAllCSS`) viven en un solo archivo y todas las apps lo importan, para que no se desincronicen.
- **React, React DOM y React Router como `singleton`.** Si cada remoto trajera su propia copia de React, los hooks y el contexto del router se romperían.
- **Rutas con `loader` en vez de `useEffect`.** Los remotos exponen `{ Component, loader }` y React Router carga los datos antes de mostrar la página, lo que evita parpadeos y estados de carga dentro de cada componente.
- **Paquete compartido en vez de duplicar código.** La lógica de negocio (IndexedDB, carrito, sesión, validaciones) y la UI base se escriben una vez en `@huerto/shared`.
- **Estado compartido sin librerías.** No hay Redux ni Context entre micro-frontends: el carrito y la sesión viven en `localStorage` y se leen con `useSyncExternalStore` a través de un "canal" (`createStorageChannel`) que emite un evento propio para la pestaña actual y escucha el evento `storage` para las demás.
- **Datos validados al leerlos**: lo que hay en `localStorage` puede estar corrupto o editado, así que se parsea con cuidado y se descarta lo que no tiene la forma esperada. La sesión guarda solo `id`, nombre y email, nunca la contraseña.
- **Errores aislados.** `RemoteBoundary` y los `ErrorBoundary` de React Router evitan que la caída de un remoto (por ejemplo, `auth` apagado) tumbe toda la aplicación.
- **Tipos entre remotos.** El plugin genera los tipos de los módulos expuestos en `node_modules/@mf-types`, así el host tiene autocompletado al importar `shop/home` o `auth/SessionCard`.
- **Validación con esquemas de Zod.** Login y registro definen sus reglas en un esquema y React Hook Form lo aplica con `zodResolver`. Las comprobaciones que necesitan la base de datos, como un email ya registrado o una contraseña incorrecta, se muestran en el campo correspondiente con `setError`.
- **React Compiler** activado para no tener que escribir `useMemo`/`useCallback` a mano.
- **CSS Modules** para que los estilos de un remoto no choquen con los de otro.

## Limitaciones conocidas

Sigue siendo un proyecto **solo frontend**:

- Las contraseñas se guardan en texto plano en IndexedDB. En producción esto lo debe manejar un backend con contraseñas *hasheadas* y tokens.
- La compra no descuenta stock ni registra pedidos, solo vacía el carrito.
- Los datos existen solo en el navegador donde se crearon.

## Versión anterior

La primera evaluación (`fullstack-2-ev-1`) implementa la misma tienda sin frameworks, con Web Components nativos, un router propio y TypeScript.
