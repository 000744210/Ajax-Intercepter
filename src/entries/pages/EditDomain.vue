<template>
    <div class="">
      <div class="head">
        <div class="back-btn" v-on:click="back">Back</div><div class="back-btn" v-on:click="goToFoundAPI">Found APIs</div><div class="title">API Urls</div>
      </div>
      <div class="add-domain-button" v-on:click="addDomainUrl">+</div>
      
      <DomainUrl v-bind="url" v-for="url in domainUrls.domainUrls.filter((d)=>d.domainId == domainId)" :key="url.id" />

    </div>
  </template>
  
  <script lang="ts">

  import { useRouterStore } from '../store/router'
  import { useDomainUrlsStore } from '../store/domainUrls'
  import DomainUrl from '../../components/DomainUrl.vue'
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      domainId: String
    },
    components: {
      DomainUrl
    },
    data() {
      return {   
        domainUrls: useDomainUrlsStore(),
        router:useRouterStore()
      };
    },
    mounted(){
      
    },
    methods:{
      addDomainUrl(){
        this.router.renderPage("CreateDomainUrl",{domainId:this.domainId})
      },
      back(){
        this.router.renderPage("Home",{})
      },
      goToFoundAPI(){
        this.router.renderPage("LogViewer",{domainId:this.domainId})
      }
    },
    computed: {
  
      },
    watch:{
    }
  })
  </script>
  
  <style scoped>
    .head{
      width:100%;
      height:30px;
      background-color: #0091ea;
    }

    .back-btn{
      float: left;
      border: 1px solid #0067a5;
      margin: 2px;
      border-radius: 3px;
      background-color: #0076bf;
      color: #edf8ff;
      padding: 1px;
      padding-left: 3px;
      padding-right: 3px;
      cursor:pointer;      
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