<template>
    
    <div class="domain" :data-running="isRunning" >
        <div class="domain-character">{{ (displayName === "" ? url : displayName)?.charAt(0).toUpperCase() }}</div>
        <div class="domain-display">{{ displayName === "" ? url : displayName }}</div>
        <div class="icon" v-on:click="editDomain">
            <font-awesome-icon icon="fa-solid fa-pencil" />   
        </div>
        <div class="icon" v-on:click="toggleRunning">
            <font-awesome-icon v-if="!isRunning" icon="fa-solid fa-play" />   
            <font-awesome-icon v-else icon="fa-solid fa-pause" />   
        </div>
        <div class="icon" v-on:click="deleteDomain">
            <font-awesome-icon icon="fa-solid fa-times" />   
        </div>
    </div>
    
</template>
  
<script lang="ts">
import { useDomainsStore } from '../entries/store/domains'
import { useRouterStore } from '../entries/store/router'
import { defineComponent } from 'vue';
export default defineComponent({
    props: {
        displayName:String,
        url:String,
        id:String,
        isRunning:Boolean
    },
    components: {

    },
    data() {
        return {   
            domains:useDomainsStore(),
            router:useRouterStore(),
        };
    },
    mounted(){
        
    },
    methods:{
        toggleRunning(){
            if(this.id) this.domains.setRunningState(this.id,!this.isRunning)
        },
        deleteDomain(){
            let result = confirm("Are you sure you want to delete this domain?")
            if(result && this.id){
                this.domains.deleteDomain(this.id)
            }
        },
        editDomain(){
            this.router.renderPage("EditDomain",{domainId:this.id})
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
        grid-template-columns: 20px auto 20px 20px 20px;
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