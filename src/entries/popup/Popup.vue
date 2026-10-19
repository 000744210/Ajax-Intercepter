<template>
  <div class="popupview">
    <component :is="router.pageTemplate" v-bind="router.templateBindings" ></component>
  </div>
</template>

<script lang="ts">
  import {defineComponent} from 'vue'
  import { useRouterStore } from '../store/router'

  export default defineComponent( {
    props: {

    },
    components: {

    },
    data() {
      return {   
        router: useRouterStore(),
      };
    },
    mounted(){
      this.router.renderPage("Home", {})
    },
    methods:{

    },
    computed: {

    },
    watch:{
    }
  })
</script>


<style scoped>
.popupview {
  background-color: white;
  font-size: 16px;
  color: black;
  gap: 5px;
  width:350px;
  height:500px;
  overflow-x:hidden;
}

</style>