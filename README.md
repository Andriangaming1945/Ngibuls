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
```
hematlistrik
├─ .env
├─ README.md
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ public
│  ├─ con.png
│  ├─ favicon.ico
│  └─ icon.png
├─ src
│  ├─ App.vue
│  ├─ assets
│  │  ├─ img
│  │  │  └─ background.jpeg
│  │  └─ main.css
│  ├─ components
│  │  ├─ Footer.vue
│  │  ├─ ForgotPassword.vue
│  │  ├─ Login.vue
│  │  ├─ Navbar.vue
│  │  ├─ Registrasi.vue
│  │  ├─ ResetPassword.vue
│  │  ├─ SaveHistoryBanner.vue
│  │  ├─ admin
│  │  │  ├─ Dashboard
│  │  │  │  ├─ Activityprioritylist.vue
│  │  │  │  ├─ Categorybreakdown.vue
│  │  │  │  ├─ Dashboardstatcard.vue
│  │  │  │  ├─ Recentactivitylist.vue
│  │  │  │  └─ dashboardmin.vue
│  │  │  ├─ Managementdata
│  │  │  │  ├─ CategoryBadge.vue
│  │  │  │  ├─ DataManagement.vue
│  │  │  │  ├─ DeleteConfirmModal.vue
│  │  │  │  ├─ DeviceAvatar.vue
│  │  │  │  ├─ DeviceCatalogFormModal.vue
│  │  │  │  ├─ DeviceCatalogTable.vue
│  │  │  │  ├─ DeviceCatalogToolbar.vue
│  │  │  │  ├─ DeviceDetailModal.vue
│  │  │  │  ├─ PerangkatListrikTab.vue
│  │  │  │  └─ StatusBadge.vue
│  │  │  ├─ Sidebarmin.vue
│  │  │  ├─ laporandata
│  │  │  │  ├─ DeleteConfirmModal.vue
│  │  │  │  ├─ Laporan.vue
│  │  │  │  ├─ Laporandetailmodal.vue
│  │  │  │  ├─ Laporanhistorytable.vue
│  │  │  │  └─ Laporantoolbar.vue
│  │  │  ├─ pengaturan
│  │  │  │  ├─ KategoriDetailModal.vue
│  │  │  │  ├─ KategoriFormModal.vue
│  │  │  │  ├─ Recommendationhistory.vue
│  │  │  │  ├─ RekomendasiDetailModal.vue
│  │  │  │  ├─ RekomendasiFormModal.vue
│  │  │  │  └─ pengaturan.vue
│  │  │  └─ profilemanage
│  │  │     ├─ DeleteUserModal.vue
│  │  │     ├─ ProfileManagement.vue
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
│  │  ├─ Useautorecommendations.js
│  │  ├─ Usedevicecategories.js
│  │  ├─ Useexportlog.js
│  │  ├─ Usengibulsdata.js
│  │  ├─ Usesavedrecommendations.js
│  │  ├─ Useusers.js
│  │  ├─ useAdminRecommendations.js
│  │  ├─ useDeviceCatalog.js
│  │  ├─ useRecommendationRules.js
│  │  └─ useScrollReveal.js
│  ├─ lib
│  │  └─ supabase.js
│  ├─ main.js
│  ├─ router
│  │  └─ index.js
│  ├─ utils
│  │  ├─ Buildexportexcel.js
│  │  ├─ Buildexportpdf.js
│  │  ├─ Pdfexporthelpers.js
│  │  └─ deviceCategoryMap.js
│  └─ view
│     ├─ Authcallbackview.vue
│     ├─ ContextSection.vue
│     ├─ HomeView.vue
│     ├─ Mengubah.vue
│     ├─ PotentialSavingSection.vue
│     ├─ Problemssection.vue
│     └─ admin
│        └─ adminlayout.vue
├─ supabase
│  ├─ .temp
│  │  ├─ .supabase-output-admin-create-user-Jv3cS9
│  │  ├─ cli-latest
│  │  ├─ gotrue-version
│  │  ├─ linked-project.json
│  │  ├─ pooler-url
│  │  ├─ postgres-version
│  │  ├─ project-ref
│  │  ├─ rest-version
│  │  ├─ storage-migration
│  │  └─ storage-version
│  ├─ config.toml
│  └─ functions
│     ├─ admin-create-user
│     │  └─ index.ts
│     ├─ admin-delete-user
│     │  └─ index.ts
│     └─ create-user
│        ├─ .npmrc
│        ├─ deno.json
│        └─ index.ts
└─ vite.config.js

```