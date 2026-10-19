<template>
    <div class="">
      <div class="head">
        <div class="back-btn" v-on:click="back">Back</div> <div class="back-btn" v-on:click="goToGroupPage">Group APIs</div><div class="title">Found APIs</div>
      </div>
      <APILog v-bind="api" v-for="api in apiLogs.apiLogs.filter((d)=>d.domainId == domainId)" :key="api.id" />

    </div>
  </template>
  
  <script lang="ts">

  import {defineComponent} from 'vue';
  import { useApiLogsStore } from '../store/apiLogs';
  import { useRouterStore } from '../store/router';
  import APILog from '~/components/APILog.vue';
  export default defineComponent({
    props: {
      domainId: String
    },
    components: {
      APILog
    },
    data() {
      return {   
        apiLogs: useApiLogsStore(),
        router:useRouterStore()
      };
    },
    mounted(){
      
    },
    methods:{
      back(){
        this.router.renderPage("EditDomain",{domainId:this.domainId})
      },
      goToGroupPage(){
        this.router.renderPage("GroupUrls",{domainId:this.domainId})
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
  </style>