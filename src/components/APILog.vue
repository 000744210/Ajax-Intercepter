<template>
    
    <div class="domain" >
        <div class="domain-display">{{url}}</div>
        <div class="icon" v-on:click="useLogApi">
            <font-awesome-icon icon="fa-solid fa-pencil" />   
        </div>
        <div class="icon" v-on:click="deleteDomainUrl">
            <font-awesome-icon icon="fa-solid fa-times" />   
        </div>
    </div>
    
</template>
  
<script lang="ts">
import { useApiLogsStore } from '~/entries/store/apiLogs';
import { useRouterStore } from '../entries/store/router'
import { defineComponent } from 'vue';
export default defineComponent({
    props: {
        domainId:String,
        url:String,
        params:Array,
        id:String
    },
    components: {

    },
    data() {
        return {   
            apiLogs:useApiLogsStore(),
            router:useRouterStore(),
        };
    },
    mounted(){
        
    },
    methods:{
        useLogApi(){
            this.router.renderPage("CreateDomainUrl",{domainId:this.domainId,defaultUrl:this.url})
        },
        deleteDomainUrl(){
            let result = confirm("Are you sure you want to delete this url?")
            if(result && this.id){
                this.apiLogs.deleteLog(this.id)
            }
        }
    },
    computed: {

        },
    watch:{
    }
})
</script>

<style scoped>
    .domain{
        display:grid;
        grid-template-columns: auto 20px 20px;
        border:1px solid #eee;
        margin:5px;
        padding:3px;
        align-items: center;
        gap:3px;
    }

    .domain-character{
        line-height: 18px;
        text-align: center;
        border-radius: 20px;
           
    }

    .domain-display{
        line-break: anywhere;
    }

    .icon{
      color:#0091EA;
      text-align: center;
      cursor:pointer;
    }

    .icon:hover{
        color:blue;
    }

    [data-running="false"]{
        color:gray;
    }

    [data-running="false"] .domain-character{
        color:gray;
        border: 1px solid #dee4de;
        background-color: #cccccc;
        color: white;     
    }

    [data-running="true"]{
        background-color: #edffed;
    }

    [data-running="true"] .domain-character{
        border: 1px solid #00810c;
        background-color: #00b200;
        color: white;     

    }

</style>