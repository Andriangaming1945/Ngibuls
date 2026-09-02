<script setup lang="ts">
import Sidebarmin from '@/components/admin/Sidebarmin.vue';

</script>

<template>
    <div class="flex min-h-screen ">
        <Sidebarmin/>
        <main class="min-w-0 flex-1 overflow-y-auto">
            <router-view/>
        </main>
    </div>
</template>