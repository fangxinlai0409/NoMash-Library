Based on your requirement to demonstrate that books are added and then capitalized by the Cloud Function, here's the best approach:
Recommended Solution: Real-time Updates with Visual Feedback
Show the transformation happening in real-time so users can see:

Book initially added with original casing
Function automatically capitalizing it moments later

vue<template>
    <div>
        <h1>Add Book</h1>
        <form @submit.prevent="addBook">
            <div>
                <label for="isbn">ISBN:</label>
                <input type="text" v-model="isbn" id="isbn" required />
            </div>
            <div>
                <label for="name">Name:</label>
                <input type="text" v-model="name" id="name" required />
            </div>
            <button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Adding...' : 'Add Book' }}
            </button>
        </form>
        
        <div v-if="lastAddedId" class="status-message">
            ✓ Book added! Watch it capitalize automatically below...
        </div>
    </div>
    
    <BookList :highlightId="lastAddedId" />
</template>

<script>
import { ref } from 'vue'
import db from '@/firebase/init.js'
import { collection, addDoc } from 'firebase/firestore';
import BookList from '@/components/BookList.vue'

export default {
    setup() {
        const isbn = ref('');
        const name = ref('');
        const isSubmitting = ref(false);
        const lastAddedId = ref(null);
        
        const addBook = async() => {
            try {
                isSubmitting.value = true;
                const isbnNumber = Number(isbn.value);
                
                if (isNaN(isbnNumber)) {
                    alert('ISBN must be a valid number');
                    return;
                }
                
                const docRef = await addDoc(collection(db, 'books'), {
                    isbn: isbnNumber,
                    name: name.value  // Keep original casing
                });
                
                // Highlight the newly added book
                lastAddedId.value = docRef.id;
                
                // Clear highlight after 5 seconds
                setTimeout(() => {
                    lastAddedId.value = null;
                }, 5000);
                
                isbn.value = '';
                name.value = '';
                
            } catch(error) {
                console.error('Error adding book:', error);
                alert('Error adding book. Please try again.');
            } finally {
                isSubmitting.value = false;
            }
        };
        
        return {
            isbn,
            name,
            addBook,
            isSubmitting,
            lastAddedId
        };
    },
    components: {
        BookList
    }
};
</script>