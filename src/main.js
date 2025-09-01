import 'bootstrap/dist/css/bootstrap.min.css'         
import 'bootstrap/dist/js/bootstrap.bundle.min.js'     

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'                     
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWC75wG7VybOcN0YA8yNJ8YCxBPdvx6tg",
  authDomain: "week7-xinlai.firebaseapp.com",
  projectId: "week7-xinlai",
  storageBucket: "week7-xinlai.appspot.com",
  messagingSenderId: "168030697537",
  appId: "1:168030697537:web:a32f7e80c2381a7e03eec0"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const app = createApp(App)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(router)
app.mount('#app')