# hematlistrik

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

```
hematlistrik
├─ .env
├─ README.md
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon.ico
├─ src
│  ├─ App.vue
│  ├─ assets
│  │  ├─ img
│  │  │  └─ background.jpeg
│  │  └─ main.css
│  ├─ components
│  │  ├─ Footer.vue
│  │  ├─ Login.vue
│  │  ├─ Navbar.vue
│  │  ├─ Registrasi.vue
│  │  ├─ SaveHistoryBanner.vue
│  │  ├─ admin
│  │  │  ├─ DataManagement.vue
│  │  │  ├─ ProfileManagement.vue
│  │  │  ├─ Rekomendasi.vue
│  │  │  ├─ Sidebarmin.vue
│  │  │  └─ profilemanage
│  │  │     ├─ DeleteUserModal.vue
│  │  │     ├─ UserFormModal.vue
│  │  │     ├─ UsersCardList.vue
│  │  │     ├─ UsersHeader.vue
│  │  │     ├─ UsersPagination.vue
│  │  │     ├─ UsersTable.vue
│  │  │     └─ UsersToolbar.vue
│  │  ├─ profile
│  │  │  ├─ Basicinfoform.vue
│  │  │  ├─ Profileavatarcard.vue
│  │  │  ├─ Recommendationhistory.vue
│  │  │  └─ profile.vue
│  │  ├─ sidebar.vue
│  │  └─ user
│  │     ├─ Analysisresultcard.vue
│  │     ├─ Deviceinputcard.vue
│  │     ├─ Habitinputcard.vue
│  │     ├─ Recommendationcard.vue
│  │     ├─ Simulationcard.vue
│  │     └─ Solutionsection.vue
│  ├─ composables
│  │  ├─ Energycalculations.js
│  │  ├─ Useauth.js
│  │  ├─ Usengibulsdata.js
│  │  ├─ Useusers.js
│  │  └─ useScrollReveal.js
│  ├─ lib
│  │  └─ supabase.js
│  ├─ main.js
│  ├─ router
│  │  └─ index.js
│  └─ view
│     ├─ Authcallbackview.vue
│     ├─ ContextSection.vue
│     ├─ HomeView.vue
│     ├─ Mengubah.vue
│     ├─ PotentialSavingSection.vue
│     ├─ Problemssection.vue
│     └─ admin
│        ├─ Managementuser.vue
│        ├─ adminlayout.vue
│        └─ dashboardmin.vue
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  └─ linked-project.json
│  ├─ config.toml
│  └─ functions
│     └─ create-user
│        ├─ .npmrc
│        ├─ deno.json
│        └─ index.ts
└─ vite.config.js

```
```
hematlistrik
├─ .env
├─ README.md
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ public
│  └─ favicon.ico
├─ src
│  ├─ App.vue
│  ├─ assets
│  │  ├─ img
│  │  │  └─ background.jpeg
│  │  └─ main.css
│  ├─ components
│  │  ├─ Footer.vue
│  │  ├─ Login.vue
│  │  ├─ Navbar.vue
│  │  ├─ Registrasi.vue
│  │  ├─ SaveHistoryBanner.vue
│  │  ├─ admin
│  │  │  ├─ DataManagement.vue
│  │  │  ├─ ProfileManagement.vue
│  │  │  ├─ Rekomendasi.vue
│  │  │  ├─ Sidebarmin.vue
│  │  │  └─ profilemanage
│  │  │     ├─ DeleteUserModal.vue
│  │  │     ├─ UserFormModal.vue
│  │  │     ├─ UsersCardList.vue
│  │  │     ├─ UsersHeader.vue
│  │  │     ├─ UsersPagination.vue
│  │  │     ├─ UsersTable.vue
│  │  │     └─ UsersToolbar.vue
│  │  ├─ profile
│  │  │  ├─ Basicinfoform.vue
│  │  │  ├─ Profileavatarcard.vue
│  │  │  ├─ Recommendationhistory.vue
│  │  │  └─ profile.vue
│  │  ├─ sidebar.vue
│  │  └─ user
│  │     ├─ Analysisresultcard.vue
│  │     ├─ Deviceinputcard.vue
│  │     ├─ Habitinputcard.vue
│  │     ├─ Recommendationcard.vue
│  │     ├─ Simulationcard.vue
│  │     └─ Solutionsection.vue
│  ├─ composables
│  │  ├─ Energycalculations.js
│  │  ├─ Useauth.js
│  │  ├─ Usengibulsdata.js
│  │  ├─ Useusers.js
│  │  └─ useScrollReveal.js
│  ├─ lib
│  │  └─ supabase.js
│  ├─ main.js
│  ├─ router
│  │  └─ index.js
│  └─ view
│     ├─ Authcallbackview.vue
│     ├─ ContextSection.vue
│     ├─ HomeView.vue
│     ├─ Mengubah.vue
│     ├─ PotentialSavingSection.vue
│     ├─ Problemssection.vue
│     └─ admin
│        ├─ Managementuser.vue
│        ├─ adminlayout.vue
│        └─ dashboardmin.vue
├─ supabase
│  ├─ .temp
│  │  ├─ cli-latest
│  │  └─ linked-project.json
│  ├─ config.toml
│  └─ functions
│     └─ create-user
│        ├─ .npmrc
│        ├─ deno.json
│        └─ index.ts
└─ vite.config.js

```