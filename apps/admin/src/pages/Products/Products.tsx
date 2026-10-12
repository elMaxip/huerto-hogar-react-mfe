import { useState } from "react";
import { Link, useFetcher, useLoaderData } from "react-router";
import type { Product } from "@huerto/shared";
import { Modal, PrimaryButton } from "@huerto/shared/ui";
import ProductRow from "../../components/ProductRow/ProductRow";
import type { ProductsData } from "./loader";
import styles from "./Products.module.css";

export default function Products() {
  const { products } = useLoaderData<ProductsData>();
  const fetcher = useFetcher();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const query = search.trim().toLowerCase();
  const deletingId =
    fetcher.state !== "idle" ? fetcher.formData?.get("productId") : null;

  const visible = products
    .filter((product) => product.id !== deletingId)
    .filter(
      ({ id, name, category }) =>
        !query ||
        [id, name, category].some((value) =>
          value.toLowerCase().includes(query),
        ),
    )
    .sort((a, b) => a.id.localeCompare(b.id));

  function confirmDelete() {
    if (!toDelete) return;

    fetcher.submit(
      { intent: "delete", productId: toDelete.id },
      { method: "post" },
    );
    setToDelete(null);
  }

  return (
    <>
      <title>Administrar productos</title>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar por código, nombre o categoría"
          aria-label="Buscar productos"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className={styles.count}>
          {visible.length} de {products.length} productos
        </span>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          {products.length === 0 ? (
            <>
              No hay productos.{" "}
              <Link to="/admin/products/new">Crea el primero</Link>
            </>
          ) : (
            "Ningún producto coincide con la búsqueda."
          )}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Imagen</th>
                <th scope="col">Código</th>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col">Descuento</th>
                <th scope="col">Stock</th>
                <th scope="col">
                  <span className={styles.srOnly}>Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={() => setToDelete(product)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        label="Eliminar producto"
        className={styles.dialog}
      >
        <h2 className={styles.dialogTitle}>¿Eliminar producto?</h2>
        <p>
          Se eliminará <strong>{toDelete?.name}</strong> ({toDelete?.id}) del
          catálogo. Esta acción no se puede deshacer.
        </p>
        <div className={styles.dialogActions}>
          <PrimaryButton onClick={() => setToDelete(null)}>
            Cancelar
          </PrimaryButton>
          <button
            type="button"
            className={styles.danger}
            onClick={confirmDelete}
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </>
  );
}
