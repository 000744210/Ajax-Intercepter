<template>
    <div class="">
      <div class="head">
        <div class="back-btn" v-on:click="back">Back</div><div class="title">Group APIs</div>
      </div>
      <div class="container">
        <label for="domain">Group Urls</label>
        <span class="hint" >Use * as a wildcard</span>
        <input id="domain" name="domain" v-model="apiUrl" placeholder="google.com">	
        <br>
        <br>
        <button class="continue-btn" v-on:click="groupApis">Continue</button>
        <p style="padding:10px">The extension will find many APIs. We try our best to shrink this list by grouping urls together to prevent the list from getting too big. We convert <b>https://example.com/id/523</b> to <b>https://example.com/id/*</b> but not every url can be easily merged and it requires you to write a wildcard url to convert urls like <b>https://example.com/search/hello+world</b> to <b>https://example.com/search/*</b></p>
		</div>
  </div>
  </template>
  
  <script lang="ts">
  //@ts-nocheck
  import { useApiLogsStore } from '../store/apiLogs';
  import { useRouterStore } from '../store/router'
  import { defineComponent } from 'vue';

  export default defineComponent({
    props: {
      domainId:String
    },
    components: {
      
    },
    data() {
      return {   
        apiLogs: useApiLogsStore(),
        router: useRouterStore(),
        apiUrl:"",

      };
    },
    mounted(){

    },
    methods:{
      groupApis(){

        this.apiLogs.groupBy(this.domainId,this.apiUrl)

        this.router.renderPage("LogViewer",{domainId:this.domainId})
      },
      back(){
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
  p{
    padding:10px;
  }

  b{
    background-color: #e0e0e0;
    padding: 1px;
    border-radius: 5px;
    padding-left: 5px;
    padding-right: 5px;
  }

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
    .centered{
			text-align:center;
		}
    label{
      font-size: 13px;
      clear: right;
      float: left;
    }
		.container {
		  clear: both;
		}

		input {
		  width: 100%;
		  clear: both;
		}	

    .hint{
      float: right;
    color: #929292;
    padding-right: 3px;
    font-size: 13px;

    }

		.continue-btn{
			  background-color: rgb(0, 145, 234);
			  border: none;
			  color: white;
			  padding: 5px;
			  text-align: center;
			  text-decoration: none;
			  display: block;
			  font-size: 16px;
			  margin: 4px 2px;
			  width:130px;
			  cursor: pointer;
			  border-radius:4px;
			  margin-left:auto;
			  margin-right:auto;
		}
  </style>