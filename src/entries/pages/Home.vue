<template>
    <div>
      <div class="head">
        <div class="title">Ajax Intercepter</div>
      </div>
      <DomainGroup v-bind="domain" v-for="domain in domains.domains" :key="domain.id" />
      <div class="add-domain-button" v-on:click="addDomain">+</div>
      
    </div>
  </template>
  
  <script lang="ts">

  import { useRouterStore } from '../store/router'
  import { useDomainsStore } from '../store/domains'
  import DomainGroup from '../../components/DomainGroup.vue'
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: {
  
    },
    components: {
        DomainGroup
    },
    data() {
      return {  
        domains: useDomainsStore(),
        router: useRouterStore()
      };
    },
    mounted(){
      console.log("MOUNTED")
    },
    methods:{
      addDomain(){
        this.router.renderPage("CreateDomain",{})
      }
    },
    computed: {
  
    },
    watch:{
    }
  })
  </script>
  
  <style>

    .head{
      width:100%;
      height:30px;
      background-color: #0091ea;
    }

    .head .title{
      float: right;
      color: #fff;
      font-family: monospace;
      font-size: 20px;
      line-height: 30px;
    }

    .add-domain-button{
        width: 30px;
        border: 1px solid azure;
        height: 30px;
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 30px;
        line-height: 24px;
        text-align: center;
        border-radius: 30px;
        background-color: #0091ea;
        color: azure;
        cursor:pointer;
    }
  </style>