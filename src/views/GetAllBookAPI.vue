<template>
  <div class="container">
    <h1>All Books (JSON Format)</h1>
    <pre>{{ jsondata }}</pre>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      jsondata: null,
      error: null,
    };
  },
  async mounted() {
    await this.getAllBooks();
  },
  methods: {
    async getAllBooks() {
      try {
        const response = await axios.get(
          "https://australia-southeast1-week7-xinlai.cloudfunctions.net/getAllBooks"
        );
        // 格式化 JSON 方便阅读
        this.jsondata = JSON.stringify(response.data, null, 2);
        this.error = null;
      } catch (error) {
        console.error("Error fetching books:", error);
        this.error = error.message;
      }
    },
  },
};
</script>

<style scoped>
pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
