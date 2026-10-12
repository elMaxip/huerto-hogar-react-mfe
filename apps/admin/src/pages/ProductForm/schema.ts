import * as z from "zod";
import { Category } from "@huerto/shared";

export const MAX_DISCOUNT = 90;

export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre puede tener como máximo 80 caracteres"),
  category: z.enum(Category, "Selecciona una categoría"),
  price: z
    .number("Ingresa un precio")
    .int("El precio debe ser un número entero")
    .min(1, "El precio debe ser mayor a 0"),
  discount: z
    .number("Ingresa un descuento (0 si no tiene)")
    .int("El descuento debe ser un número entero")
    .min(0, "El descuento no puede ser negativo")
    .max(MAX_DISCOUNT, `El descuento puede ser como máximo ${MAX_DISCOUNT}%`),
  stock: z
    .number("Ingresa el stock")
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  unidadVenta: z.string().trim().min(1, "Ingresa la unidad de venta"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(600, "La descripción puede tener como máximo 600 caracteres"),
});

/** Lo que recibe la action: el formulario más la imagen elegida */
export const productPayloadSchema = productFormSchema.extend({
  img: z.string(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductPayload = z.infer<typeof productPayloadSchema>;
