<template>
  <div class="main-container">
    <header v-if="showHeader">
      <BHeader />
    </header>
    <main class="main-box">
      <router-view />
    </main>
  </div>
</template>

<script>
import BHeader from "./components/BHeader.vue";

export default {
  name: "App",
  components: { BHeader },
  computed: {
    showHeader() {
      const hiddenRoutes = ["CountBookAPI"];
      return !hiddenRoutes.includes(this.$route.name);
    },
  },
};
</script>


<style>

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}


.app-container {
  max-width: 80vw;
  margin: 0 auto;
}

.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}


input.form-control:focus,
textarea.form-control:focus,
select.form-select:focus {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,.1);
  outline: 0;
}
</style>