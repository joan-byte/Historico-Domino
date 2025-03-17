/// <reference types="vite/client" />

// Declaración para archivos .vue
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Declaración para nuestro módulo api
declare module "../lib/api" {
  export * from "./src/lib/api";
}

declare module "@/lib/api" {
  export * from "./src/lib/api";
} 