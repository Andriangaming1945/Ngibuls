<script setup lang="ts">
import Sidebarmin from '@/components/admin/Sidebarmin.vue';

</script>

<template>
    <div class="flex min-h-screen ">
        <Sidebarmin/>
        <main class="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
            <router-view/>
        </main>
    </div>
</template>