import { Category, type Product } from "../../models/product";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "FR001",
    name: "Manzanas Fuji",
    category: Category.FrutaFresca,
    price: 1200,
    discount: 20,
    unidadVenta: "por kilo",
    img: "manzanas-fuji.webp",
    stock: 150,
    description:
      "Manzanas Fuji crujientes y dulces, cultivadas en el Valle del Maule. Perfectas para meriendas saludables o como ingrediente en postres. Estas manzanas son conocidas por su textura firme y su sabor equilibrado entre dulce y ácido.",
  },
  {
    id: "FR002",
    name: "Naranjas Valencia",
    category: Category.FrutaFresca,
    price: 1000,
    unidadVenta: "por kilo",
    img: "naranjas-valencia.webp",
    stock: 200,
    description:
      "Jugosas y ricas en vitamina C, estas naranjas Valencia son ideales para zumos frescos y refrescantes. Cultivadas en condiciones climáticas óptimas que aseguran su dulzura y jugosidad.",
  },
  {
    id: "FR003",
    name: "Plátanos Cavendish",
    category: Category.FrutaFresca,
    price: 800,
    unidadVenta: "por kilo",
    img: "platanos-cavendish.webp",
    stock: 250,
    description:
      "Plátanos maduros y dulces, perfectos para el desayuno o como snack energético. Estos plátanos son ricos en potasio y vitaminas, ideales para mantener una dieta equilibrada.",
  },
  {
    id: "VR001",
    name: "Zanahorias Orgánicas",
    category: Category.VerduraOrganica,
    price: 900,
    discount: 35,
    unidadVenta: "por kilo",
    img: "zanahorias-organicas.webp",
    stock: 100,
    description:
      "Zanahorias crujientes cultivadas sin pesticidas en la Región de O'Higgins. Excelente fuente de vitamina A y fibra, ideales para ensaladas, jugos o como snack saludable.",
  },
  {
    id: "VR002",
    name: "Espinacas Frescas",
    category: Category.VerduraOrganica,
    price: 700,
    unidadVenta: "por bolsa de 500g",
    img: "espinacas-frescas.webp",
    stock: 80,
    description:
      "Espinacas frescas y nutritivas, perfectas para ensaladas y batidos verdes. Estas espinacas son cultivadas bajo prácticas orgánicas que garantizan su calidad y valor nutricional.",
  },
  {
    id: "VR003",
    name: "Pimientos Tricolores",
    category: Category.VerduraOrganica,
    price: 1500,
    unidadVenta: "por kilo",
    img: "pimientos-tricolores.webp",
    stock: 120,
    description:
      "Pimientos rojos, amarillos y verdes, ideales para salteados y platos coloridos. Ricos en antioxidantes y vitaminas, estos pimientos añaden un toque vibrante y saludable a cualquier receta.",
  },
  {
    id: "PO001",
    name: "Miel Orgánica",
    category: Category.ProductoOrganico,
    price: 5000,
    discount: 10,
    unidadVenta: "por frasco de 500g",
    img: "miel-organica.webp",
    stock: 50,
    description:
      "Miel pura y orgánica producida por apicultores locales. Rica en antioxidantes y con un sabor inigualable, perfecta para endulzar de manera natural tus comidas y bebidas.",
  },
];

