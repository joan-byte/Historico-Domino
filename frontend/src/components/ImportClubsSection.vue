<script setup>
// Importamos los componentes necesarios de Shadcn UI para las tarjetas
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ref } from 'vue';
// Opcional: Importar si se usan Toasts de Shadcn para notificaciones
// import { useToast } from '@/components/ui/toast/use-toast'

// const { toast } = useToast() // Opcional

// Referencia para el input de archivo oculto
const fileInputRef = ref(null);

// Función para disparar el clic en el input oculto
const triggerFileUpload = () => {
  // Asegurarnos de que el input existe antes de hacer clic
  fileInputRef.value?.click();
};

// Función para manejar el cambio en el input de archivo
const handleFileChange = async (event) => {
  const files = event.target.files;
  // Si no hay archivos o se canceló la selección
  if (!files || files.length === 0) {
    console.log('No se seleccionó ningún archivo.');
    return;
  }

  const file = files[0];

  // Validar tipo de archivo (Excel)
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  if (!allowedTypes.includes(file.type)) {
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls).');
    // Limpiar el valor del input para permitir seleccionar el mismo archivo otra vez
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
    return;
  }

  // Crear FormData para enviar el archivo
  const formData = new FormData();
  // 'file' debe coincidir con el nombre del parámetro en el endpoint de FastAPI
  formData.append('file', file);

  try {
    // Enviar archivo al backend.
    // ¡¡¡IMPORTANTE!!! Ajusta la URL '/api/import/upload-template' a tu endpoint real.
    const response = await fetch('/api/import/upload-template', {
      method: 'POST',
      body: formData,
      // Nota: No es necesario 'Content-Type': 'multipart/form-data',
      // fetch lo establece automáticamente cuando el body es FormData.
    });

    // Comprobar si la respuesta del backend fue exitosa
    if (!response.ok) {
      let errorMessage = `Error del servidor: ${response.status} ${response.statusText}`;
      try {
        // Intentar obtener un mensaje de error más específico del JSON de respuesta
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no hay JSON o 'message', usar el error HTTP estándar
      }
      throw new Error(errorMessage);
    }

    // Asumimos que el backend devuelve un JSON si todo fue bien
    const result = await response.json();
    console.log('Respuesta del backend:', result);
    alert('¡Plantilla subida con éxito!');
    // Opcional: Usar Toast de Shadcn
    // toast({ title: "Éxito", description: "Plantilla subida correctamente." })

  } catch (error) {
    console.error('Error al subir el archivo:', error);
    alert(`Error al subir la plantilla: ${error.message}`);
    // Opcional: Usar Toast de Shadcn para errores
    // toast({ variant: "destructive", title: "Error", description: `No se pudo subir la plantilla: ${error.message}` })
  } finally {
    // Limpiar el valor del input en cualquier caso
    if (fileInputRef.value) {
      fileInputRef.value.value = '';
    }
  }
};

// Función para iniciar la descarga de la plantilla
const downloadTemplate = () => {
  // La URL completa del endpoint de descarga en el backend
  // Como usamos el proxy de Vite, podemos usar la ruta relativa /api/
  const downloadUrl = '/api/import/download-template';

  // Creamos un enlace temporal
  const link = document.createElement('a');
  link.href = downloadUrl;

  // Opcional: especificar el nombre del archivo para la descarga
  // Si no se especifica, el navegador usará el nombre dado por
  // la cabecera Content-Disposition del backend (que es TEMPLATE_FILENAME)
  // link.download = 'plantilla_clubs.xlsx';

  // Añadimos el enlace al DOM (necesario en algunos navegadores)
  document.body.appendChild(link);

  // Simulamos un clic en el enlace para iniciar la descarga
  link.click();

  // Eliminamos el enlace del DOM después de iniciar la descarga
  document.body.removeChild(link);
};

// No se necesita lógica de script adicional por ahora
</script>

<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Importar Clubs</h2>
    <!-- Contenedor principal para las tarjetas, usando grid layout -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tarjeta 1: Importar Clubs -->
      <Card class="bg-blue-100 border-blue-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader>
          <CardTitle class="text-blue-800">Importar Clubs</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-blue-700">Importa los clubs directamente desde el archivo subido.</p>
          <!-- TODO: Añadir lógica/botón para iniciar la importación -->
        </CardContent>
      </Card>

      <!-- Tarjeta 2: Descargar Plantilla Excel -->
      <Card
        class="bg-green-100 border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="downloadTemplate"
      >
        <CardHeader>
          <CardTitle class="text-green-800">Descargar Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-green-700">Descarga la plantilla Excel con el formato correcto.</p>
        </CardContent>
      </Card>

      <!-- Tarjeta 3: Subir Plantilla Excel -->
      <Card
        class="bg-yellow-100 border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="triggerFileUpload"
      >
        <CardHeader>
          <CardTitle class="text-yellow-800">Subir Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-yellow-700">Sube tu plantilla excel como platilla.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Input de archivo oculto -->
    <!-- Se activa mediante programación -->
    <input
      type="file"
      ref="fileInputRef"
      @change="handleFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />

    <!-- Opcional: Si usas Toasts de Shadcn, necesitas el componente Toaster en tu layout principal -->
    <!-- <Toaster /> -->
  </div>
</template>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style> 