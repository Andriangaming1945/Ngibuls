<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNgibulsData } from '@/composables/Usengibulsdata'
import { supabase } from '@/lib/supabase'
import { Loader2, Camera, Zap, Droplet } from 'lucide-vue-next'

const { profile } = useAuth()
const { updateProfile } = useNgibulsData()

const avatarInput = ref(null)
const avatarUploading = ref(false)
const avatarError = ref('')

const initial = () => (profile.value?.name || profile.value?.email || '?').trim().charAt(0).toUpperCase()

function pickAvatar() {
  avatarError.value = ''
  avatarInput.value?.click()
}

async function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    avatarError.value = 'Format foto harus JPG, PNG, atau WEBP.'
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    avatarError.value = 'Ukuran foto maksimal 3 MB.'
    return
  }
  if (!profile.value?.id) {
    avatarError.value = 'Kamu harus login dulu buat ganti foto profil.'
    return
  }

  avatarError.value = ''
  avatarUploading.value = true

  try {
    const ext = file.name.split('.').pop()
    const path = `${profile.value.id}/avatar-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (uploadError) throw uploadError

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const avatarUrl = publicUrlData.publicUrl

    const updated = await updateProfile({ avatar_url: avatarUrl })
    profile.value = { ...profile.value, ...updated }
  } catch (err) {
    avatarError.value = 'Gagal mengunggah foto. Coba lagi ya.'
  } finally {
    avatarUploading.value = false
    if (avatarInput.value) avatarInput.value.value = ''
  }
}
</script>

<template>
  <div class="reveal rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" style="--delay: 80ms">
    <div class="flex items-center gap-4">
      <div class="glow-ring relative shrink-0">
        <input
          ref="avatarInput"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="hidden"
          @change="handleAvatarChange"
        />
        <button
          type="button"
          @click="pickAvatar"
          :disabled="avatarUploading"
          class="group relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#4CAF50]/10 text-xl font-semibold text-[#4CAF50] ring-1 ring-slate-200 transition-opacity duration-200 disabled:cursor-not-allowed"
          aria-label="Ganti foto profil"
        >
          <img v-if="profile.avatar_url" :src="profile.avatar_url" alt="Foto profil" class="h-full w-full object-cover" />
          <template v-else>{{ initial() }}</template>

          <span
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            :class="avatarUploading && 'opacity-100'"
          >
            <Loader2 v-if="avatarUploading" class="h-5 w-5 animate-spin text-white" />
            <Camera v-else class="h-5 w-5 text-white" />
          </span>
        </button>
      </div>
      <div class="min-w-0 flex-1">
        <h2 class="truncate text-lg font-bold text-[#0F172A] sm:text-xl">{{ profile.name }}</h2>
        <p class="truncate text-sm text-slate-500">{{ profile.email }}</p>
        <p v-if="avatarError" class="mt-1 text-xs text-red-600">{{ avatarError }}</p>
      </div>
      <div class="hidden shrink-0 items-center gap-2 sm:flex">
        <span class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          <Zap class="h-3.5 w-3.5 text-[#4CAF50]" /> Listrik
        </span>
        <span class="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          <Droplet class="h-3.5 w-3.5 text-[#4CAF50]" /> Air
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  animation: fadeSlideUp 0.5s ease-out both;
  animation-delay: var(--delay, 0ms);
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.glow-ring::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(76, 175, 80, 0.18), transparent 70%);
  animation: pulseGlow 2.6s ease-in-out infinite;
  z-index: -1;
}
@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.55;
    transform: scale(0.94);
  }
  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none;
  }
  .glow-ring::before {
    animation: none;
  }
}
</style>