<script setup>
// Importamos los componentes necesarios de Shadcn UI para las tarjetas
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Añadir Button para reintentar o limpiar
import { Button } from "@/components/ui/button";
import { ref } from 'vue';
// Opcional: Importar si se usan Toasts de Shadcn para notificaciones
// import { useToast } from '@/components/ui/toast/use-toast'

// const { toast } = useToast() // Opcional

// Referencia para el input de SUBIDA DE PLANTILLA de Resultados
const templateFileInputRef = ref(null);
// Referencia para el input de IMPORTACIÓN DE RESULTADOS
const importFileInputRef = ref(null);

// Estado para mostrar carga y resultados/errores de importación
const isLoading = ref(false);
const importResult = ref(null); // Almacenará el objeto de éxito { mensaje, resultados_creados, ... }
const importError = ref(null); // Almacenará el objeto de error { mensaje, errores_detalle: [...] } o string

// --- Lógica para SUBIR PLANTILLA de Resultados ---
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
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para la plantilla de resultados.');
    if (templateFileInputRef.value) templateFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file); // 'file' debe coincidir con el endpoint

  // Mostrar algún feedback visual para la subida de plantilla también podría ser útil
  try {
    const response = await fetch('/api/import/resultados/upload-template', { method: 'POST', body: formData });
    if (!response.ok) {
      let errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
      try { errorData = await response.json(); } catch (e) { /* usa error HTTP */ }
      throw new Error(errorData.detail || errorData.message);
    }
    const result = await response.json();
    alert('¡Plantilla de resultados subida con éxito!'); // Mantener alert simple para plantilla
  } catch (error) {
    console.error('Error al subir la plantilla de resultados:', error);
    alert(`Error al subir la plantilla de resultados: ${error.message}`);
  } finally {
    if (templateFileInputRef.value) templateFileInputRef.value.value = '';
  }
};

// --- Lógica para DESCARGAR PLANTILLA de Resultados ---
const downloadTemplate = () => {
  const downloadUrl = '/api/import/resultados/download-template';
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'plantilla_resultados.xlsx'); // Sugerir nombre de archivo
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Lógica para IMPORTAR RESULTADOS ---
const triggerImport = () => {
  // Limpiar resultados/errores anteriores antes de empezar
  importResult.value = null;
  importError.value = null;
  importFileInputRef.value?.click();
};

const handleImportFileChange = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];

  // Limpiar resultados/errores anteriores y empezar carga
  importResult.value = null;
  importError.value = null;
  isLoading.value = true;

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    importError.value = 'Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para importar resultados.';
    isLoading.value = false;
    if (importFileInputRef.value) importFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/import/resultados', { method: 'POST', body: formData });
    const result = await response.json(); // Intentamos leer JSON siempre

    if (!response.ok) {
      // Error de validación (400) u otro error del servidor
      if (response.status === 400 && result.detail) {
         // Asignar directamente el objeto de error detallado
         importError.value = result.detail;
      } else {
        // Otros errores (500, 404, etc.)
        importError.value = { mensaje: result.detail || `Error del servidor: ${response.status} ${response.statusText}` };
      }
    } else {
      // Éxito (200 OK) - Asignar el objeto de resultado completo
      importResult.value = result;
    }

  } catch (error) {
    console.error('Error al importar resultados:', error);
    // Error de red o al parsear JSON
    importError.value = { mensaje: `Error de conexión o respuesta inválida: ${error.message}` };
  } finally {
    // Limpiar el input de importación y detener carga
    if (importFileInputRef.value) importFileInputRef.value.value = '';
    isLoading.value = false;
  }
};

// Función para limpiar el estado de resultados/errores
const clearStatus = () => {
  importResult.value = null;
  importError.value = null;
};

</script>

<template>
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-6">Importar Resultados</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tarjeta 1: Importar Resultados -->
      <Card
        :class="[
          'hover:shadow-lg transition-shadow duration-300 cursor-pointer',
          isLoading ? 'bg-gray-200 border-gray-400 opacity-70 pointer-events-none' : 'bg-blue-100 border-blue-300'
        ]"
        @click="!isLoading && triggerImport()"
      >
        <CardHeader>
          <CardTitle class="text-blue-800">Importar Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-blue-700">
             {{ isLoading ? 'Importando...' : 'Importa los resultados desde un archivo Excel.' }}
           </p>
        </CardContent>
      </Card>

      <!-- Tarjeta 2: Descargar Plantilla Excel para Resultados -->
      <Card
        class="bg-green-100 border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="downloadTemplate"
      >
        <CardHeader>
          <CardTitle class="text-green-800">Descargar Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-green-700">Descarga la plantilla Excel para resultados.</p>
        </CardContent>
      </Card>

      <!-- Tarjeta 3: Subir Plantilla Excel para Resultados -->
      <Card
        class="bg-yellow-100 border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="triggerTemplateUpload"
      >
        <CardHeader>
          <CardTitle class="text-yellow-800">Subir Plantilla</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-yellow-700">Sube tu plantilla Excel como plantilla para resultados.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Sección para mostrar resultados o errores de la importación -->
    <div v-if="importResult || importError" class="mt-6">
      <Card :class="importResult ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'">
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle :class="importResult ? 'text-green-800' : 'text-red-800'">
            {{ importResult ? 'Resultado de la Importación' : 'Error de Importación' }}
          </CardTitle>
          <Button variant="ghost" size="sm" @click="clearStatus">Cerrar</Button>
        </CardHeader>
        <CardContent>
          <!-- Mensaje de Éxito -->
          <div v-if="importResult" class="text-green-700 space-y-2">
            <p>{{ importResult.mensaje }}</p>
            <p>Resultados creados: <strong>{{ importResult.resultados_creados ?? 0 }}</strong></p>
            <p>Resultados omitidos (duplicados): <strong>{{ importResult.resultados_omitidos_duplicados ?? 0 }}</strong></p>
            <div v-if="importResult.detalles_omitidos && importResult.detalles_omitidos.length > 0" class="mt-2 pt-2 border-t border-green-200">
              <p class="font-semibold">Detalles omitidos:</p>
              <ul class="list-disc list-inside text-sm max-h-40 overflow-y-auto">
                <li v-for="(omitido, index) in importResult.detalles_omitidos" :key="index">
                  Fila {{ omitido.fila }}: Jugador {{ omitido.idfed_jugador }} - Fecha {{ omitido.fecha }} - Partida {{ omitido.partida }} - Mesa {{ omitido.mesa }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Mensaje de Error -->
          <div v-if="importError" class="text-red-700 space-y-2">
             <p class="font-semibold">{{ importError.mensaje || 'Se encontraron errores durante la importación.' }}</p>
             <div v-if="importError.errores_detalle && importError.errores_detalle.length > 0" class="mt-2 pt-2 border-t border-red-200">
                <p class="font-semibold">Errores de validación:</p>
                <ul class="list-disc list-inside text-sm max-h-60 overflow-y-auto">
                    <li v-for="(errDetail, index) in importError.errores_detalle" :key="index">
                        Fila {{ errDetail.fila }}:
                        <ul v-if="Array.isArray(errDetail.errores)" class="list-circle list-inside ml-4">
                            <li v-for="(errMsg, eIndex) in errDetail.errores" :key="eIndex">{{ errMsg }}</li>
                        </ul>
                        <span v-else> {{ JSON.stringify(errDetail.errores) }}</span>
                    </li>
                </ul>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Input oculto para SUBIR PLANTILLA de Resultados -->
    <input
      type="file"
      ref="templateFileInputRef"
      @change="handleTemplateFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />

    <!-- Input oculto para IMPORTAR RESULTADOS -->
    <input
      type="file"
      ref="importFileInputRef"
      @change="handleImportFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />
  </div>
</template>

<style scoped>
/* Puedes añadir estilos específicos aquí si es necesario */
</style> 