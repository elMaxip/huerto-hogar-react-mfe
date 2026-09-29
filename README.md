# Proyecto HuertoHogar (React + micro-frontends)

## Arquitectura

```
apps/
  host   :5173  Shell: router, layout, navbar, modal de cuenta, Blog, Nosotros, 404
  shop   :5174  Remoto: Inicio, Catálogo, Detalle de producto
  auth   :5175  Remoto: Iniciar sesión, Registro, tarjeta de sesión (SessionCard)
  cart   :5176  Remoto: Carrito de compras
packages/
  shared        @huerto/shared: modelos, IndexedDB, carrito, sesión, hooks y UI común
federation.config.ts   Puertos, URLs de los remotos y dependencias compartidas
```

## Cómo correr el proyecto

```bash
pnpm install
pnpm dev        # levanta host y los 3 remotos en paralelo → http://localhost:5173
pnpm build      # build de todas las apps
pnpm preview    # sirve las builds (correr después de build)
pnpm lint
```
