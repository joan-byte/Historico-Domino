<script setup lang="ts">
// Vista con dashboard y sidebar compacto
import { ref } from 'vue';
import SidebarProvider from '@/components/ui/sidebar/SidebarProvider.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import SidebarInset from '@/components/ui/sidebar/SidebarInset.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Breadcrumb from '@/components/ui/breadcrumb/Breadcrumb.vue';
import BreadcrumbList from '@/components/ui/breadcrumb/BreadcrumbList.vue';
import BreadcrumbItem from '@/components/ui/breadcrumb/BreadcrumbItem.vue';
import BreadcrumbLink from '@/components/ui/breadcrumb/BreadcrumbLink.vue';
import BreadcrumbPage from '@/components/ui/breadcrumb/BreadcrumbPage.vue';
import BreadcrumbSeparator from '@/components/ui/breadcrumb/BreadcrumbSeparator.vue';
import SidebarTrigger from '../components/ui/sidebar/SidebarTrigger.vue';
</script>

<template>
  <div class="h-screen w-full overflow-hidden">
    <SidebarProvider>
      <div class="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div class="flex-1 flex flex-col bg-white">
          <!-- Header con breadcrumb más compacto -->
          <header class="flex h-8 shrink-0 items-center gap-1 border-b px-2">
            <div class="flex items-center gap-1">
              <SidebarTrigger class="-ml-1" />
              <Separator orientation="vertical" class="mx-1 h-3" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem class="hidden md:block">
                    <BreadcrumbLink href="#" class="text-[10px]">
                      Building Your Application
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator class="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage class="text-[10px]">Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <!-- Contenido principal más compacto -->
          <div class="flex flex-col gap-1 p-1 h-[calc(100vh-32px)] overflow-auto">
            <!-- Tarjetas en la parte superior -->
            <div class="grid grid-cols-3 gap-1">
              <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
              <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
              <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
            </div>
            
            <!-- Contenido principal -->
            <div class="rounded-md bg-gray-100 shadow-sm p-2 flex-1">
              <div class="max-w-4xl">
                <h2 class="text-xs font-semibold mb-1">Data Fetching</h2>
                <p class="text-[9px] text-gray-500 mb-1">Fetch data from an API or database in your application.</p>
                
                <div class="prose prose-sm max-w-none text-[9px]">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                  
                  <h3 class="text-[10px] font-medium mt-2 mb-1">Getting Started</h3>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                  
                  <pre class="bg-gray-800 text-gray-100 rounded-md p-1 my-1 overflow-x-auto text-[9px]"><code>// Example code
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));</code></pre>
                  
                  <h3 class="text-[10px] font-medium mt-2 mb-1">Best Practices</h3>
                  <ul class="list-disc pl-4 mb-1 text-[9px]">
                    <li>Use a data fetching library like SWR or React Query</li>
                    <li>Implement proper error handling</li>
                    <li>Add loading states for better UX</li>
                    <li>Consider caching strategies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  </div>
</template>

<style scoped>
/* Estilos para asegurar que el layout ocupe toda la pantalla pero sea compacto */
.h-screen {
  height: 100vh;
}

/* Hacer que los textos sean más pequeños */
.prose {
  font-size: 0.65rem;
  line-height: 1.1;
}

.prose p {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.prose h3 {
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  font-size: 0.7rem;
}

.prose ul {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.prose li {
  margin-top: 0.125rem;
  margin-bottom: 0.125rem;
}
</style> 