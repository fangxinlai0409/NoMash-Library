<template>
  <div class="container my-4">
    <div class="d-flex align-items-center justify-content-between mb-2">
      <h2 class="h5 mb-0">All Books (Manage & Query)</h2>
      <span v-if="loading" class="text-muted small">
        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Loading...
      </span>
    </div>

    <div class="btn-toolbar gap-2 mb-3" role="toolbar">
      <div class="btn-group btn-group-sm" role="group">
        <button class="btn" :class="mode==='live' ? 'btn-primary' : 'btn-outline-primary'" @click="toLive()">
          Realtime (onSnapshot)
        </button>
      </div>

      <div class="btn-group btn-group-sm" role="group">
        <button class="btn btn-secondary" @click="runQ1" :disabled="loading">Q1: isbn ≥ 1000 · desc · limit 5</button>
        <button class="btn btn-outline-secondary" @click="nextQ1" :disabled="loading || !canPaginateQ1">Next page (Q1)</button>
      </div>

      <div class="btn-group btn-group-sm" role="group">
        <button class="btn btn-dark" @click="runQ2('A')" :disabled="loading">Q2: name startsWith "A"</button>
        <button class="btn btn-outline-dark" @click="runQ2('B')" :disabled="loading">Q2: name startsWith "B"</button>
      </div>

      <div class="btn-group btn-group-sm" role="group">
        <button class="btn btn-info" @click="runQ3" :disabled="loading">Q3: isbn in [1001, 11333, 2000]</button>
      </div>
    </div>

    <div class="small text-muted mb-2" v-if="info">
      <span class="badge bg-light text-dark me-2">Query</span>{{ info }}
    </div>

    <div v-if="errorMsg" class="alert alert-danger py-2">{{ errorMsg }}</div>

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

    <p class="small text-muted mt-2">
      Open DevTools Console to see detailed logs of each query (label, params, and results).
    </p>
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

  where,
  limit,
  getDocs,
  startAfter,
  startAt,
  endAt,
} from 'firebase/firestore'

export default {
  setup () {
    const books = ref([])
    const loading = ref(true)
    const errorMsg = ref('')
    const info = ref('')
    const editCache = ref({})
    const savingId = ref(null)
    const deletingId = ref(null)

    const mode = ref('live') 
    let unsub = null

    let q1LastDoc = null
    const canPaginateQ1 = ref(false)

    let lastQueryRunner = null

    const isEditing = id => !!editCache.value[id]
    const edit = (book) => {
      editCache.value[book.id] = { name: book.name, isbn: book.isbn }
    }
    const cancel = (id) => { delete editCache.value[id] }

    const save = async (id) => {
      try {
        const payload = editCache.value[id]
        if (!payload?.name || payload.name.trim() === '') {
          alert('Name is required'); return
        }
        if (Number.isNaN(Number(payload.isbn))) {
          alert('ISBN must be a number'); return
        }
        savingId.value = id
        await updateDoc(doc(db, 'books', id), {
          name: payload.name.trim(),
          isbn: Number(payload.isbn),
        })
        delete editCache.value[id]
        console.log('Updated:', id)

        if (mode.value === 'query' && lastQueryRunner) await lastQueryRunner()
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

        if (mode.value === 'query' && lastQueryRunner) await lastQueryRunner()
      } catch (e) {
        console.error(e)
        alert('Delete failed, see console.')
      } finally {
        deletingId.value = null
      }
    }

    const detach = () => { if (unsub) { unsub(); unsub = null } }

    const toLive = () => {
      detach()
      mode.value = 'live'
      info.value = ''
      errorMsg.value = ''
      q1LastDoc = null
      canPaginateQ1.value = false
      lastQueryRunner = null
      loading.value = true

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
    }

    const runQuery = async (q, label) => {
      detach()
      mode.value = 'query'
      loading.value = true
      errorMsg.value = ''
      info.value = label

      try {
        const snap = await getDocs(q)
        books.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        console.log('[Query]', label)
        console.log('Docs:', books.value)

        if (label.startsWith('Q1')) {
          q1LastDoc = snap.docs[snap.docs.length - 1] || null
          canPaginateQ1.value = !!q1LastDoc
          console.log('Q1 - lastDoc:', q1LastDoc?.id || null)
        } else {
          q1LastDoc = null
          canPaginateQ1.value = false
        }
      } catch (e) {
        console.error(e)
        errorMsg.value = e.message || 'Query failed'
      } finally {
        loading.value = false
      }
    }

    const runQ1 = async () => {
      lastQueryRunner = runQ1 
      const q = query(
        collection(db, 'books'),
        where('isbn', '>=', 1000),
        orderBy('isbn', 'desc'),
        limit(5)
      )
      await runQuery(q, 'Q1: where(isbn ≥ 1000) + orderBy(isbn desc) + limit(5)')
    }

    const nextQ1 = async () => {
      if (!q1LastDoc) return
      lastQueryRunner = nextQ1
      const q = query(
        collection(db, 'books'),
        where('isbn', '>=', 1000),
        orderBy('isbn', 'desc'),
        startAfter(q1LastDoc),
        limit(5)
      )
      await runQuery(q, 'Q1 (next): where(isbn ≥ 1000) + orderBy(isbn desc) + startAfter + limit(5)')
    }

    const runQ2 = async (prefix) => {
      lastQueryRunner = () => runQ2(prefix)
      const base = query(collection(db, 'books'), orderBy('name', 'asc'))
      const q = query(base, startAt(prefix), endAt(prefix + '\uf8ff'), limit(10))
      await runQuery(q, `Q2: orderBy(name) + startAt("${prefix}") + endAt("${prefix}\\uf8ff") + limit(10)`)
    }

    const runQ3 = async () => {
      lastQueryRunner = runQ3
      const q = query(
        collection(db, 'books'),
        where('isbn', 'in', [1001, 11333, 2000]), 
        orderBy('isbn', 'asc'),
        limit(10)
      )
      await runQuery(q, 'Q3: where(isbn in [1001, 11333, 2000]) + orderBy(isbn asc) + limit(10)')
    }

    onMounted(() => { toLive() })
    onBeforeUnmount(() => { detach() })

    return {
      // state
      books, loading, errorMsg, info,
      editCache, savingId, deletingId,
      mode, canPaginateQ1,
      isEditing, edit, cancel, save, remove,
      toLive, runQ1, nextQ1, runQ2, runQ3,
    }
  }
}
</script>