<script setup>
// Importamos los componentes necesarios de Shadcn UI para las tarjetas
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ref } from 'vue';
// Opcional: Importar si se usan Toasts de Shadcn para notificaciones
// import { useToast } from '@/components/ui/toast/use-toast'

// const { toast } = useToast() // Opcional

// Referencia para el input de IMPORTACIÓN DE JUGADORES
const importPlayersFileInputRef = ref(null);
// --- Añadir referencias para plantilla de jugadores ---
const templatePlayersFileInputRef = ref(null);

// --- Añadir lógica para SUBIR PLANTILLA JUGADORES ---
const triggerTemplatePlayersUpload = () => {
  templatePlayersFileInputRef.value?.click();
};

const handleTemplatePlayersFileChange = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para la plantilla de jugadores.');
    if (templatePlayersFileInputRef.value) templatePlayersFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file);
  try {
    // Endpoint futuro: /api/import/upload-player-template
    const response = await fetch('/api/import/upload-player-template', { method: 'POST', body: formData });
    if (!response.ok) {
      let errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
      try { errorData = await response.json(); } catch (e) { /* usa error HTTP */ }
      throw new Error(errorData.detail || errorData.message);
    }
    const result = await response.json();
    alert('¡Plantilla de jugadores subida con éxito! (Endpoint pendiente en backend)');
  } catch (error) {
    console.error('Error al subir la plantilla de jugadores:', error);
    alert(`Error al subir la plantilla de jugadores: ${error.message}`);
  } finally {
    if (templatePlayersFileInputRef.value) templatePlayersFileInputRef.value.value = '';
  }
};

// --- Añadir lógica para DESCARGAR PLANTILLA JUGADORES ---
const downloadPlayersTemplate = () => {
  // Endpoint futuro: /api/import/download-player-template
  const downloadUrl = '/api/import/download-player-template';
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', 'player_template.xlsx'); // Sugerir nombre
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Nota: Esto funcionará si el endpoint existe y devuelve el archivo.
  // Si el endpoint no existe, no pasará nada visiblemente.
  alert('Iniciando descarga de plantilla de jugadores... (Asegúrate de que el endpoint /api/import/download-player-template esté implementado en el backend)');
};


// --- Lógica para IMPORTAR JUGADORES (ya existente, sin cambios) ---
const triggerPlayerImport = () => {
  importPlayersFileInputRef.value?.click();
};

const handleImportPlayersFileChange = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  const file = files[0];
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (!allowedTypes.includes(file.type)) {
    alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls) para importar jugadores.');
    if (importPlayersFileInputRef.value) importPlayersFileInputRef.value.value = '';
    return;
  }
  const formData = new FormData();
  formData.append('file', file); // 'file' coincide con el endpoint import_players_from_excel

  try {
    // Llamar al nuevo endpoint del backend para jugadores
    const response = await fetch('/api/import/players', { method: 'POST', body: formData });
    const result = await response.json(); // Intentamos leer JSON siempre

    if (!response.ok) {
        // Si hay errores de validación (400), el backend devuelve JSON con detalles
        if (response.status === 400 && result.detail && result.detail.errores_detalle) {
            let errorMsg = `${result.detail.mensaje || 'Errores de validación en el archivo:'}\n\n`;
            result.detail.errores_detalle.forEach(err => {
                errorMsg += `Fila ${err.fila}:\n`;
                if (err.errores && Array.isArray(err.errores)) {
                  err.errores.forEach(e => errorMsg += `  - ${e}\n`);
                } else {
                  // Si no es un array, mostrarlo directamente (puede ser un string)
                  errorMsg += `  - ${err.errores || 'Error desconocido en esta fila'}\n`;
                }
            });
            alert(errorMsg);
        } else {
            // Otros errores (500, 404 si la ruta falla, etc.)
            throw new Error(result.detail || `Error del servidor: ${response.status} ${response.statusText}`);
        }
    } else {
        // Éxito (200 OK)
        // Ajustar para usar las claves devueltas por el endpoint de jugadores
        let successMsg = `${result.mensaje}\nCreados: ${result.jugadores_creados}\nActualizados: ${result.jugadores_actualizados}`;
        if (result.detalles_proceso && result.detalles_proceso.length > 0) {
            successMsg += "\n\nDetalles del proceso:\n" + result.detalles_proceso.join("\n");
        }
        alert(successMsg);
        // Opcional: toast({ title: "Importación Exitosa", description: `Creados: ${result.jugadores_creados}, Actualizados: ${result.jugadores_actualizados}` })
    }

  } catch (error) {
    console.error('Error al importar jugadores:', error);
    alert(`Error al importar jugadores: ${error.message}`);
    // Opcional: toast({ variant: "destructive", title: "Error de Importación", description: error.message })
  } finally {
    // Limpiar el input de importación
    if (importPlayersFileInputRef.value) importPlayersFileInputRef.value.value = '';
  }
};

</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Cambiar título -->
    <h2 class="text-2xl font-bold mb-6">Importar Jugadores</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Tarjeta 1: Importar Jugadores (Color Azul como en Clubs) -->
      <Card
        class="bg-blue-100 border-blue-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="triggerPlayerImport"
      >
        <CardHeader>
          <CardTitle class="text-blue-800">Importar Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-blue-700">Importa los jugadores desde un archivo Excel.</p>
        </CardContent>
      </Card>

      <!-- Tarjeta 2: Descargar Plantilla Jugadores (Color Verde) -->
      <Card
        class="bg-green-100 border-green-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="downloadPlayersTemplate"
      >
        <CardHeader>
          <CardTitle class="text-green-800">Descargar Plantilla Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-green-700">Descarga la plantilla Excel para jugadores.</p>
        </CardContent>
      </Card>

      <!-- Tarjeta 3: Subir Plantilla Jugadores (Color Amarillo) -->
      <Card
        class="bg-yellow-100 border-yellow-300 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        @click="triggerTemplatePlayersUpload"
      >
        <CardHeader>
          <CardTitle class="text-yellow-800">Subir Plantilla Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-yellow-700">Sube tu plantilla Excel para jugadores.</p>
        </CardContent>
      </Card>
    </div>

    <!-- Input oculto para IMPORTAR JUGADORES (ya existente) -->
    <input
      type="file"
      ref="importPlayersFileInputRef"
      @change="handleImportPlayersFileChange"
      accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      style="display: none;"
    />
    
    <!-- Input oculto para SUBIR PLANTILLA JUGADORES -->
    <input
      type="file"
      ref="templatePlayersFileInputRef"
      @change="handleTemplatePlayersFileChange"
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