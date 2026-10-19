<template>
    <div class="">
      <div class="head">
        <div class="back-btn" v-on:click="back">Back</div><div class="title">Create Domain</div>
      </div>
      <div class="container">
        <label for="domain">Domain URL</label>
        <span class="hint" >The targeted domain</span>
        <input id="domain" name="domain" v-model="domainUrl" placeholder="google.com">
        <br>
        <br>
        <label for="displayname">Display Name (optional)</label>
        <span class="hint" >The name it will display with</span>
        <input id="displayname" v-model="displayName" name="displayname" placeholder="Google">		
        <br>
        <br>
        <button class="continue-btn" v-on:click="createDomain">Continue</button>
		</div>
  </div>
  </template>
  
  <script lang="ts">
  //@ts-nocheck
  import { useDomainsStore } from '../store/domains'
  import { useRouterStore } from '../store/router'
  import { defineComponent } from 'vue';
  import browser from "webextension-polyfill";
  import {parse} from 'tldts';
  export default defineComponent({
    props: {
    },
    components: {
      
    },
    data() {
      return {   
        domains: useDomainsStore(),
        router: useRouterStore(),
        domainUrl:"",
        displayName:""
      };
    },
    mounted(){
      browser.tabs.query({ active: true, currentWindow: true }).then((tab:any)=>{
        this.domainUrl = parse(tab[0].url || "").hostname || "";
        
        let lowercaseDomain = parse(tab[0].url || "").domainWithoutSuffix || ""
        let uppercaseDomain = lowercaseDomain.charAt(0).toUpperCase() + lowercaseDomain.slice(1);
        
        this.displayName = uppercaseDomain
      })

    },
    methods:{
      createDomain(){
        this.domains.addDomain(this.domainUrl, this.displayName)
        this.router.renderPage("Home",{})
      },
      back(){
        this.router.renderPage("Home",{})
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