<template>
  <div class="container">
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
