<script setup>
import { Instagram, Github, Mail, Zap } from 'lucide-vue-next'

const productLinks = [
  { label: 'Dashboard', href: '#' },
  { label: 'Analisis', href: '#' },
  { label: 'Simulasi', href: '#' },
  { label: 'Rekomendasi', href: '#' },
]

const aboutLinks = [
  { label: 'Tentang Ngibuls', href: '#' },
  { label: 'Cara Kerja', href: '#' },
  { label: 'SDG 7 & Keberlanjutan', href: '#' },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Mail, label: 'Email', href: '#' },
]

const year = new Date().getFullYear()
</script>

<template>
  <footer class="relative bg-[#0F172A]">
    <div class="mx-auto max-w-[1280px] px-4 py-16 sm:py-20">
      <div class="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <!-- Brand -->
        <div class="max-w-xs">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#16A34A]/15">
              <Zap class="h-4 w-4 text-[#16A34A]" />
            </span>
            <span class="text-lg font-bold text-white">
              Ngi<span class="text-[#16A34A]">buls</span>
            </span>
          </div>
          <p class="mt-4 text-sm leading-relaxed text-slate-400">
            Bantu kamu tahu ke mana biaya kostmu pergi — dan apa yang paling
            masuk akal untuk diubah.
          </p>

          <div class="mt-6 flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <component :is="social.icon" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <!-- Product links -->
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Produk
          </span>
          <ul class="mt-4 flex flex-col gap-3">
            <li v-for="link in productLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-slate-400 transition-colors hover:text-white">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- About links -->
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Tentang
          </span>
          <ul class="mt-4 flex flex-col gap-3">
            <li v-for="link in aboutLinks" :key="link.label">
              <a :href="link.href" class="text-sm text-slate-400 transition-colors hover:text-white">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- SDG badge -->
        <div>
          <span class="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
            Berkontribusi Pada
          </span>
          <div class="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <span class="h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
            <span class="text-sm text-slate-300">SDG 7 — Affordable & Clean Energy</span>
          </div>
        </div>
      </div>

      <div class="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          &copy; {{ year }} Ngibuls. All rights reserved.
        </p>
        <p class="text-sm text-slate-500">
          Dibuat untuk penghuni kost yang ingin tahu, bukan cuma bayar.
        </p>
      </div>
    </div>
  </footer>
</template>