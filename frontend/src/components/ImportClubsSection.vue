<script setup>
// Importamos los componentes necesarios de Shadcn UI para las tarjetas
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ref } from 'vue';
// Opcional: Importar si se usan Toasts de Shadcn para notificaciones
// import { useToast } from '@/components/ui/toast/use-toast'

// const { toast } = useToast() // Opcional

// Referencia para el input de SUBIDA DE PLANTILLA
const templateFileInputRef = ref(null);
// Referencia para el input de IMPORTACIÓN DE CLUBS
const importFileInputRef = ref(null);

// --- Lógica para SUBIR PLANTILLA ---
const triggerTemplateUpload = () => {
  templateFileInputRef.value?.click();
};

const handleTemplateFileChange = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para la plantilla.');
    if (templateFileInputRef.value) templateFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file); // 'file' coincide con el endpoint upload_club_template
  try {
    const response = await fetch('/api/import/upload-template', { method: 'POST', body: formData });
    if (!response.ok) {
      let errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
      try { errorData = await response.json(); } catch (e) { /* usa error HTTP */ }
      throw new Error(errorData.detail || errorData.message);
    }
    const result = await response.json();
    alert('¡Plantilla subida con éxito!');
    // Opcional: toast({ title: "Éxito", description: "Plantilla subida correctamente." })
  } catch (error) {
    console.error('Error al subir la plantilla:', error);
    alert(`Error al subir la plantilla: ${error.message}`);
    // Opcional: toast({ variant: "destructive", title: "Error", description: `No se pudo subir la plantilla: ${error.message}` })
  } finally {
    if (templateFileInputRef.value) templateFileInputRef.value.value = '';
  }
};

// --- Lógica para DESCARGAR PLANTILLA ---
const downloadTemplate = () => {
  const downloadUrl = '/api/import/download-template';
  const link = document.createElement('a');
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Lógica para IMPORTAR CLUBS ---
const triggerImport = () => {
  importFileInputRef.value?.click();
};

const handleImportFileChange = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para importar.');
    if (importFileInputRef.value) importFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file); // 'file' coincide con el endpoint import_clubs_from_excel
  try {
    const response = await fetch('/api/import/clubs', { method: 'POST', body: formData });
    const result = await response.json(); // Intentamos leer JSON siempre

    if (!response.ok) {
        // Si hay errores de validación (400), el backend devuelve JSON con detalles
        if (response.status === 400 && result.detail && result.detail.errores) {
            let errorMsg = "Errores de validación en el archivo:\n\n";
            result.detail.errores.forEach(err => {
                errorMsg += `Fila ${err.fila}:\n`;
                err.errores.forEach(e => errorMsg += `  - ${e}\n`);
            });
            alert(errorMsg);
        } else {
            // Otros errores (500, 404 si la ruta falla, etc.)
            throw new Error(result.detail || `Error del servidor: ${response.status} ${response.statusText}`);
        }
    } else {
        // Éxito (200 OK)
        let successMsg = `${result.message}\nCreados: ${result.creados}\nActualizados: ${result.actualizados}`;
        if (result.detalles_actualizacion && result.detalles_actualizacion.length > 0) {
            successMsg += "\n\nDetalles de actualización:\n" + result.detalles_actualizacion.join("\n");
        }
        alert(successMsg);
        // Opcional: toast({ title: "Importación Exitosa", description: `Creados: ${result.creados}, Actualizados: ${result.actualizados}` })
    }

  } catch (error) {
    console.error('Error al importar clubs:', error);
    alert(`Error al importar clubs: ${error.message}`);
    // Opcional: toast({ variant: "destructive", title: "Error de Importación", description: error.message })
  } finally {
    // Limpiar el input de importación
    if (importFileInputRef.value) importFileInputRef.value.value = '';
  }
};

// No se necesita lógica de script adicional por ahora
</script>

<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Importar Clubs</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tarjeta 1: Importar Clubs -->
      <Card
        class="bg-blue-100 border-blue-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="triggerImport"
      >
        <CardHeader>
          <CardTitle class="text-blue-800">Importar Clubs</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-blue-700">Importa los clubs desde un archivo Excel.</p>
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
        @click="triggerTemplateUpload"
      >
        <CardHeader>
          <CardTitle class="text-yellow-800">Subir Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-yellow-700">Sube tu plantilla excel como platilla.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Input oculto para SUBIR PLANTILLA -->
    <input
      type="file"
      ref="templateFileInputRef"
      @change="handleTemplateFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />

    <!-- Input oculto para IMPORTAR CLUBS -->
    <input
      type="file"
      ref="importFileInputRef"
      @change="handleImportFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />

    <!-- Opcional: Si usas Toasts de Shadcn -->
    <!-- <Toaster /> -->
  </div>
</template>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style> 