import { createApp } from "vue";

import { createPinia } from "pinia";

import App from "./Popup.vue";

import { library } from '@fortawesome/fontawesome-svg-core'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


import { faPencil,faTimes,faPlay,faPause } from '@fortawesome/free-solid-svg-icons'

library.add(faPencil,faTimes,faPlay,faPause)

const app = createApp(App).use(createPinia());
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
