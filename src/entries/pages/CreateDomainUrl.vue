<template>
  <div class="">
    <div class="head">
        <div class="back-btn" v-on:click="back">Back</div><div class="title">Create Domain Url</div>
    </div>    
    <div class="container">

        <label for="domain">Ajax URL</label>
        <span class="hint" >API address to match. Use * for wild card.</span>
        <input id="url" name="url" v-model="url" placeholder="https://api.google.com/getinfo">
        <br>

       
        <codemirror
          v-model="code"
          placeholder="Code goes here..."
          :style="{ 'font-size': '10px!important','height':'350px','font-family':'none!important'}"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
          
          :extensions="extensions"
        />

        <button v-if="domainUrlId" class="continue-btn" v-on:click="updateDomainUrl">Update</button>
        <button v-else class="continue-btn" v-on:click="createDomainUrl">Continue</button>
		</div>
  </div>
  </template>
  
  <script lang="ts">
  
  import { useDomainUrlsStore } from '../store/domainUrls'
  import { useRouterStore } from '../store/router'
  import { Codemirror } from 'vue-codemirror'
  import { javascript } from '@codemirror/lang-javascript'
  import { defineComponent } from 'vue'

  export default defineComponent({
    props: {
      domainId:{
        type:String,
        required:true
      },
      domainUrlId:String,
      defaultUrl:String
    },
    components: {
      Codemirror
    },
    data() {
      return {   
        domainUrls: useDomainUrlsStore(),
        router: useRouterStore(),
        url:"",
        code:`// intercept the data sent to the server.
async function onRequestDataSend(request)
{
  console.log("Intercepted Data Send", request);
  // Modify the request object here.
  return request;
}

// Intercept the data being returned to the website.
async function onRequestDataReturn(event)
{
  console.log("Intercepted Data Return", event);
  // modify the received event object here.
  return event;
}

// Called once right before the first ajax call.
async function init()
{
  
}

// Called once right before the page loads.
async function beforePageLoad()
{
  
}

// View more information here: 
// https://github.com/000744210/Ajax-Intercepter`,
        extensions: undefined
      };
    },
    mounted(){
      //@ts-ignore
      this.extensions =  [javascript()]
      // domainUrlId is provided if they clicked the edit button on an existing domainUrl
      if(this.domainUrlId){
        let domainUrlInfo = this.domainUrls.getById(this.domainUrlId)
        if(domainUrlInfo){
          this.code = domainUrlInfo.code
          this.url = domainUrlInfo.url;
        }
      }else if(this.defaultUrl){
        this.url = this.defaultUrl
      }
    },
    methods:{
      createDomainUrl(){
        this.domainUrls.addDomainUrl(this.url,this.code,this.domainId)
        this.router.renderPage("EditDomain",{domainId:this.domainId})
      },
      updateDomainUrl(){
        if(this.domainUrlId){
          this.domainUrls.updateDomainUrl(this.domainUrlId,this.url,this.code)
          this.router.renderPage("EditDomain",{domainId:this.domainId})
        }
      },
      back(){
        this.router.renderPage("EditDomain",{domainId:this.domainId})
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


    .v-codemirror * {
      font-size: 14px!important;
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