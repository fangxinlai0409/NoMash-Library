<template>
  <div class="container my-4">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="h4 mb-0">All Books</h2>
      <span v-if="loading" class="text-muted small">
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Loading...
      </span>
    </div>

    <div v-if="errorMsg" class="alert alert-danger" role="alert">
      {{ errorMsg }}
    </div>

    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead class="table-light">
          <tr>
            <th style="min-width: 220px;">Name</th>
            <th style="min-width: 160px;">ISBN</th>
            <th class="text-end" style="width:240px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in books" :key="b.id">
            <td>
              <input
                v-if="isEditing(b.id)"
                v-model="editCache[b.id].name"
                type="text"
                class="form-control form-control-sm"
                placeholder="Book Name"
              />
              <span v-else class="fw-medium">{{ b.name }}</span>
            </td>
            <td>
              <input
                v-if="isEditing(b.id)"
                v-model.number="editCache[b.id].isbn"
                type="number"
                class="form-control form-control-sm"
                placeholder="ISBN"
              />
              <span v-else class="text-muted">{{ b.isbn }}</span>
            </td>
            <td class="text-end">
              <div v-if="isEditing(b.id)" class="btn-group btn-group-sm">
                <button class="btn btn-primary" :disabled="savingId === b.id" @click="save(b.id)">
                  <span v-if="savingId === b.id" class="spinner-border spinner-border-sm me-1"></span>
                  Save
                </button>
                <button class="btn btn-outline-secondary" :disabled="savingId === b.id" @click="cancel(b.id)">
                  Cancel
                </button>
              </div>
              <div v-else class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" @click="edit(b)">Edit</button>
                <button class="btn btn-outline-danger" :disabled="deletingId === b.id" @click="remove(b.id)">
                  <span v-if="deletingId === b.id" class="spinner-border spinner-border-sm me-1"></span>
                  Delete
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="!loading && books.length === 0">
            <td colspan="3" class="text-center text-muted py-4">No books found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import db from '@/firebase/init.js'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'

export default {
  setup () {
    const books = ref([])
    const loading = ref(true)
    const errorMsg = ref('')
    const editCache = ref({})
    const savingId = ref(null)
    const deletingId = ref(null)
    let unsub = null

    const isEditing = (id) => !!editCache.value[id]

    const edit = (book) => {
      editCache.value[book.id] = { name: book.name, isbn: book.isbn }
    }

    const cancel = (id) => {
      delete editCache.value[id]
    }

    const save = async (id) => {
      try {
        const payload = editCache.value[id]
        if (!payload?.name || payload.name.trim() === '') {
          alert('Name is required')
          return
        }
        if (Number.isNaN(Number(payload.isbn))) {
          alert('ISBN must be a number')
          return
        }
        savingId.value = id
        await updateDoc(doc(db, 'books', id), {
          name: payload.name.trim(),
          isbn: Number(payload.isbn),
        })
        delete editCache.value[id]
        console.log('Updated:', id)
      } catch (e) {
        console.error(e)
        alert('Update failed, see console.')
      } finally {
        savingId.value = null
      }
    }

    const remove = async (id) => {
      try {
        if (!confirm('Delete this book?')) return
        deletingId.value = id
        await deleteDoc(doc(db, 'books', id))
        console.log('Deleted:', id)
        // onSnapshot 会自动刷新列表
      } catch (e) {
        console.error(e)
        alert('Delete failed, see console.')
      } finally {
        deletingId.value = null
      }
    }

    onMounted(() => {
      try {
        const q = query(collection(db, 'books'), orderBy('isbn', 'asc'))
        unsub = onSnapshot(
          q,
          (snap) => {
            books.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            loading.value = false
          },
          (err) => {
            console.error(err)
            errorMsg.value = 'Failed to load books'
            loading.value = false
          }
        )
      } catch (e) {
        console.error(e)
        errorMsg.value = 'Failed to start listener.'
        loading.value = false
      }
    })

    onBeforeUnmount(() => { if (unsub) unsub() })

    return {
      books,
      loading,
      errorMsg,
      editCache,
      savingId,
      deletingId,
      isEditing,
      edit,
      cancel,
      save,
      remove,
    }
  }
}
</script>
