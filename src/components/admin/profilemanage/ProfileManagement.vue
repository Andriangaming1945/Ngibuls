<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '@/composables/Useusers'
import { useAuth } from '@/composables/useAuth'
import UsersHeader from '@/components/admin/profilemanage/UsersHeader.vue'
import UsersToolbar from '@/components/admin/profilemanage/UsersToolbar.vue'
import UsersTable from '@/components/admin/profilemanage/UsersTable.vue'
import UsersCardList from '@/components/admin/profilemanage/UsersCardList.vue'
import UsersPagination from '@/components/admin/profilemanage/UsersPagination.vue'
import UserFormModal from '@/components/admin/profilemanage/UserFormModal.vue'
import DeleteUserModal from '@/components/admin/profilemanage/DeleteUserModal.vue'

const { users, loading, fetchUsers, createUser, updateUser, updateUserStatus, deleteUser } = useUsers()
const { profile: currentProfile } = useAuth()

const PAGE_SIZE = 10

const search = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)

const roleOptions = [
  { value: 'all', label: 'Semua Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'User' },
]
const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
]

function formatLastLogin(value) {
  if (!value) return 'Belum pernah login'
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

// Data mentah dari composable dilengkapi field turunan yang dipakai UI
// (isSelf, label & warna role, teks login terakhir), tanpa mengubah data asli.
const decoratedUsers = computed(() =>
  users.value.map((u) => ({
    ...u,
    isSelf: u.id === currentProfile.value?.id,
    roleLabelText: u.role === 'admin' ? 'Admin' : 'User',
    roleColorHex: u.role === 'admin' ? '#F59E0B' : '#64748B',
    lastLoginText: formatLastLogin(u.last_login),
  }))
)

const filteredUsers = computed(() => {
  let rows = decoratedUsers.value

  if (search.value.trim()) {
    const term = search.value.trim().toLowerCase()
    rows = rows.filter(
      (u) => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
    )
  }
  if (roleFilter.value !== 'all') rows = rows.filter((u) => u.role === roleFilter.value)
  if (statusFilter.value !== 'all') rows = rows.filter((u) => u.status === statusFilter.value)

  return rows
})

const totalCount = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / PAGE_SIZE)))

const pagedUsers = computed(() => {
  const from = (currentPage.value - 1) * PAGE_SIZE
  return filteredUsers.value.slice(from, from + PAGE_SIZE)
})

// Reset ke halaman 1 setiap kali filter berubah, biar nggak nyangkut
// di halaman kosong pas hasil filter jadi lebih sedikit.
function resetPage() {
  currentPage.value = 1
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

onMounted(fetchUsers)

/* ---------------- Create / Edit ---------------- */

const showFormModal = ref(false)
const formMode = ref('create')
const formSaving = ref(false)
const formError = ref('')

function emptyForm() {
  return { id: null, name: '', email: '', role: 'user', status: 'active', password: '' }
}
const form = ref(emptyForm())

function openCreate() {
  formMode.value = 'create'
  form.value = emptyForm()
  formError.value = ''
  showFormModal.value = true
}

function openEdit(user) {
  formMode.value = 'edit'
  form.value = { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, password: '' }
  formError.value = ''
  showFormModal.value = true
}

async function submitForm() {
  formError.value = ''
  if (!form.value.name.trim() || !form.value.email.trim()) {
    formError.value = 'Nama dan email wajib diisi.'
    return
  }

  formSaving.value = true
  try {
    if (formMode.value === 'create') {
      if (!form.value.password || form.value.password.length < 8) {
        formError.value = 'Password minimal 8 karakter.'
        return
      }
      await createUser({
        name: form.value.name.trim(),
        email: form.value.email.trim(),
        password: form.value.password,
        role: form.value.role,
        status: form.value.status,
      })
    } else {
      await updateUser(form.value.id, {
        name: form.value.name.trim(),
        role: form.value.role,
        status: form.value.status,
      })
    }
    showFormModal.value = false
  } catch (err) {
    formError.value = err.message || 'Gagal menyimpan data pengguna.'
  } finally {
    formSaving.value = false
  }
}

/* ---------------- Delete ---------------- */

const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteError = ref('')
const deleting = ref(false)

function openDelete(user) {
  deleteTarget.value = user
  deleteError.value = ''
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await deleteUser(deleteTarget.value.id)
    showDeleteModal.value = false
  } catch (err) {
    deleteError.value = err.message || 'Gagal menghapus pengguna.'
  } finally {
    deleting.value = false
  }
}

/* ---------------- Toggle status ---------------- */

const statusUpdatingId = ref(null)

async function toggleStatus(user) {
  if (user.isSelf) return
  const newStatus = user.status === 'active' ? 'inactive' : 'active'

  statusUpdatingId.value = user.id
  try {
    await updateUserStatus(user.id, newStatus)
  } finally {
    statusUpdatingId.value = null
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <UsersHeader @create="openCreate" />

    <div class="px-4 py-6 sm:px-6 lg:px-8">
      <UsersToolbar
        :search="search"
        :role="roleFilter"
        :status="statusFilter"
        :role-options="roleOptions"
        :status-options="statusOptions"
        @update:search="search = $event; resetPage()"
        @update:role="roleFilter = $event; resetPage()"
        @update:status="statusFilter = $event; resetPage()"
      />

      <UsersTable
        :users="pagedUsers"
        :loading="loading"
        :status-updating-id="statusUpdatingId"
        @edit="openEdit"
        @delete="openDelete"
        @toggle-status="toggleStatus"
      />
      <UsersCardList
        :users="pagedUsers"
        :loading="loading"
        :status-updating-id="statusUpdatingId"
        @edit="openEdit"
        @delete="openDelete"
        @toggle-status="toggleStatus"
      />

      <UsersPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="PAGE_SIZE"
        :total-count="totalCount"
        @go-to-page="goToPage"
      />
    </div>

    <UserFormModal
      :show="showFormModal"
      :mode="formMode"
      :form="form"
      :error="formError"
      :saving="formSaving"
      @close="showFormModal = false"
      @submit="submitForm"
    />

    <DeleteUserModal
      :show="showDeleteModal"
      :user="deleteTarget"
      :error="deleteError"
      :deleting="deleting"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>