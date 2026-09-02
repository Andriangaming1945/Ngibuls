<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUsers } from '@/composables/Useusers'
import { useAuth } from '@/composables/Useauth'

import UsersHeader from './profilemanage/UsersHeader.vue'
import UsersToolbar from './profilemanage/UsersToolbar.vue'
import UsersTable from './profilemanage/UsersTable.vue'
import UsersCardList from './profilemanage/UsersCardList.vue'
import UsersPagination from './profilemanage/UsersPagination.vue'
import UserFormModal from './profilemanage/UserFormModal.vue'
import DeleteUserModal from './profilemanage/DeleteUserModal.vue'

const { users, loading, fetchUsers, createUser, updateUser, deleteUser, updateUserStatus } = useUsers()
const { user: currentUser } = useAuth()

onMounted(() => {
  fetchUsers?.()
})

const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 8

const roleOptions = [
  { value: 'all', label: 'Semua Role' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'user', label: 'User' },
]

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
]

watch([searchQuery, roleFilter, statusFilter], () => {
  currentPage.value = 1
})

const filteredUsers = computed(() => {
  const list = users?.value || []
  const q = searchQuery.value.trim().toLowerCase()

  return list.filter((u) => {
    const matchesQuery =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value
    const matchesStatus = statusFilter.value === 'all' || u.status === statusFilter.value
    return matchesQuery && matchesRole && matchesStatus
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / pageSize)))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

function roleLabel(role) {
  return roleOptions.find((r) => r.value === role)?.label || role || '-'
}

function roleColor(role) {
  if (role === 'admin') return '#16A34A'
  if (role === 'editor') return '#3B82F6'
  return '#94A3B8'
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  } catch {
    return value
  }
}

/* Data yang sudah "siap tampil" buat dikirim ke Table/CardList — termasuk flag isSelf */
const displayUsers = computed(() =>
  paginatedUsers.value.map((u) => ({
    ...u,
    roleLabelText: roleLabel(u.role),
    roleColorHex: roleColor(u.role),
    lastLoginText: formatDate(u.last_login),
    isSelf: !!currentUser.value?.id && u.id === currentUser.value.id,
  }))
)

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

/* ------------------------------ user modal ------------------------------ */

const showUserModal = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const savingUser = ref(false)
const formError = ref('')

const userForm = reactive({
  id: null,
  name: '',
  email: '',
  role: 'user',
  status: 'active',
  password: '',
})

function resetUserForm() {
  userForm.id = null
  userForm.name = ''
  userForm.email = ''
  userForm.role = 'user'
  userForm.status = 'active'
  userForm.password = ''
  formError.value = ''
}

function openCreateModal() {
  resetUserForm()
  modalMode.value = 'create'
  showUserModal.value = true
}

function openEditModal(user) {
  resetUserForm()
  modalMode.value = 'edit'
  userForm.id = user.id
  userForm.name = user.name || ''
  userForm.email = user.email || ''
  userForm.role = user.role || 'user'
  userForm.status = user.status || 'active'
  showUserModal.value = true
}

function closeUserModal() {
  showUserModal.value = false
}

async function submitUserForm() {
  formError.value = ''

  if (!userForm.name.trim()) {
    formError.value = 'Nama wajib diisi.'
    return
  }
  if (!userForm.email.trim()) {
    formError.value = 'Email wajib diisi.'
    return
  }
  if (modalMode.value === 'create' && userForm.password.length < 8) {
    formError.value = 'Password minimal 8 karakter.'
    return
  }

  savingUser.value = true
  try {
    if (modalMode.value === 'create') {
      await createUser?.({
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status,
        password: userForm.password,
      })
    } else {
      await updateUser?.(userForm.id, {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        status: userForm.status,
      })
    }
    await fetchUsers?.()
    showUserModal.value = false
  } catch (err) {
    formError.value = err?.message || 'Gagal menyimpan data pengguna.'
  } finally {
    savingUser.value = false
  }
}

/* ------------------------------ status toggle ---------------------------- */

const statusUpdatingId = ref(null)

async function toggleStatus(user) {
  const nextStatus = user.status === 'active' ? 'inactive' : 'active'
  statusUpdatingId.value = user.id
  try {
    await updateUserStatus?.(user.id, nextStatus)
    await fetchUsers?.()
  } finally {
    statusUpdatingId.value = null
  }
}

/* -------------------------------- delete --------------------------------- */

const showDeleteModal = ref(false)
const userToDelete = ref(null)
const deletingUser = ref(false)
const deleteError = ref('')

function confirmDelete(user) {
  if (user.id === currentUser.value?.id) return // jaga-jaga, tombolnya udah disabled di UI
  userToDelete.value = user
  deleteError.value = ''
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function deleteUserConfirmed() {
  if (!userToDelete.value) return
  if (userToDelete.value.id === currentUser.value?.id) {
    deleteError.value = 'Tidak bisa menghapus akun sendiri.'
    return
  }
  deletingUser.value = true
  deleteError.value = ''
  try {
    await deleteUser?.(userToDelete.value.id)
    await fetchUsers?.()
    showDeleteModal.value = false
    userToDelete.value = null
  } catch (err) {
    deleteError.value = err?.message || 'Gagal menghapus pengguna.'
  } finally {
    deletingUser.value = false
  }
}
</script>

<template>
  <div class="w-full bg-[#F8FAFC]">
    <UsersHeader @create="openCreateModal" />

    <div class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <UsersToolbar
        v-model:search="searchQuery"
        v-model:role="roleFilter"
        v-model:status="statusFilter"
        :role-options="roleOptions"
        :status-options="statusOptions"
      />

      <UsersTable
        :users="displayUsers"
        :loading="loading"
        :status-updating-id="statusUpdatingId"
        @edit="openEditModal"
        @delete="confirmDelete"
        @toggle-status="toggleStatus"
      />

      <UsersCardList
        :users="displayUsers"
        :loading="loading"
        :status-updating-id="statusUpdatingId"
        @edit="openEditModal"
        @delete="confirmDelete"
        @toggle-status="toggleStatus"
      />

      <UsersPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :page-size="pageSize"
        :total-count="filteredUsers.length"
        @go-to-page="goToPage"
      />
    </div>

    <UserFormModal
      :show="showUserModal"
      :mode="modalMode"
      :form="userForm"
      :error="formError"
      :saving="savingUser"
      @close="closeUserModal"
      @submit="submitUserForm"
    />

    <DeleteUserModal
      :show="showDeleteModal"
      :user="userToDelete"
      :error="deleteError"
      :deleting="deletingUser"
      @close="closeDeleteModal"
      @confirm="deleteUserConfirmed"
    />
  </div>
</template>