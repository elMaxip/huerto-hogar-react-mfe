import { useId, useState, type ChangeEvent } from "react";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CATEGORIES, Category, getProductImage } from "@huerto/shared";
import { InputLabel, PrimaryButton } from "@huerto/shared/ui";
import type { ProductFormActionData, ProductFormData } from "./loader";
import {
  MAX_DISCOUNT,
  productFormSchema,
  type ProductFormValues,
} from "./schema";
import styles from "./ProductForm.module.css";

/** Las imágenes se guardan como data URL en IndexedDB */
const MAX_IMAGE_SIZE = 1024 * 1024;

export default function ProductForm() {
  const { product } = useLoaderData<ProductFormData>();
  const actionData = useActionData<ProductFormActionData>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const isEditing = product !== undefined;

  const categoryId = useId();
  const descriptionId = useId();

  const [img, setImg] = useState(product?.img ?? "");
  const [imgError, setImgError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? { ...product, discount: product.discount ?? 0 }
      : {
          name: "",
          category: Category.FrutaFresca,
          discount: 0,
          unidadVenta: "por kilo",
          description: "",
        },
  });

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImgError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImgError("El archivo debe ser una imagen");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImgError("La imagen puede pesar como máximo 1 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImg(reader.result as string);
    reader.onerror = () => setImgError("No se pudo leer la imagen");
    reader.readAsDataURL(file);
  }

  function onSubmit(values: ProductFormValues) {
    submit({ ...values, img }, { method: "post", encType: "application/json" });
  }

  const title = isEditing ? `Editar ${product.name}` : "Nuevo producto";

  return (
    <div className={styles.card}>
      <title>{title}</title>

      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {isEditing && <span className={styles.code}>{product.id}</span>}
      </header>

      {actionData?.error && (
        <p className={styles.formError} role="alert">
          {actionData.error}
        </p>
      )}

      <form className={styles.form} noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.fields}>
          <InputLabel
            label="Nombre"
            maxLength={80}
            {...register("name")}
            error={errors.name?.message}
          />

          <div>
            <label className={styles.label} htmlFor={categoryId}>
              Categoría
            </label>
            <select
              id={categoryId}
              className={styles.control}
              aria-invalid={errors.category ? true : undefined}
              {...register("category")}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <span role="alert" className={styles.error}>
                {errors.category.message}
              </span>
            )}
            {!isEditing && (
              <span className={styles.hint}>
                El código se genera según la categoría.
              </span>
            )}
          </div>

          <div className={styles.row}>
            <InputLabel
              label="Precio (CLP)"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              {...register("price", { valueAsNumber: true })}
              error={errors.price?.message}
            />
            <InputLabel
              label="Descuento (%)"
              type="number"
              min={0}
              max={MAX_DISCOUNT}
              step={1}
              inputMode="numeric"
              {...register("discount", { valueAsNumber: true })}
              error={errors.discount?.message}
            />
          </div>

          <div className={styles.row}>
            <InputLabel
              label="Stock"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              {...register("stock", { valueAsNumber: true })}
              error={errors.stock?.message}
            />
            <InputLabel
              label="Unidad de venta"
              placeholder="por kilo, por bolsa de 500g…"
              {...register("unidadVenta")}
              error={errors.unidadVenta?.message}
            />
          </div>

          <div>
            <label className={styles.label} htmlFor={descriptionId}>
              Descripción
            </label>
            <textarea
              id={descriptionId}
              rows={5}
              maxLength={600}
              className={[styles.control, errors.description && styles.invalid]
                .filter(Boolean)
                .join(" ")}
              aria-invalid={errors.description ? true : undefined}
              {...register("description")}
            />
            {errors.description && (
              <span role="alert" className={styles.error}>
                {errors.description.message}
              </span>
            )}
          </div>

          <div className={styles.imageField}>
            <img
              className={styles.preview}
              src={getProductImage({ img })}
              alt="Vista previa de la imagen del producto"
            />
            <InputLabel
              label="Imagen"
              type="file"
              accept="image/*"
              onChange={handleImage}
              error={imgError ?? undefined}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/admin" className={styles.cancel}>
            Cancelar
          </Link>
          <PrimaryButton type="submit" disabled={isSaving}>
            {isSaving
              ? "Guardando…"
              : isEditing
                ? "Guardar cambios"
                : "Crear producto"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
