

<template>
  <div>
<!--    <router-link class="btn btn-primary mt-3" to="/" >Faucet</router-link> |-->
<!--    <router-link class="btn btn-primary mt-3" to="/keplr">Connect Keplr</router-link> |-->
<!--    <router-link class="btn btn-primary mt-3" to="/wallet">Create Wallet</router-link> |-->
<!--    <router-link class="btn btn-primary mt-3" to="/contracts">Contracts</router-link> |-->
<!--    <router-link class="btn btn-primary mt-3" to="/explorer">Search</router-link> |-->

    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-lg-10 col-md-12 col-sm-12">

              <router-view />

        </div>
      </div>
    </div>


    <div>
      <!-- <button  class="btn btn-primary btn-sm"  v-on:click="selectNet('testnet')" >Tesnet</button> | -->
      <!-- <button  class="btn btn-primary btn-sm"  v-on:click="selectNet('relaunch')" >Relaunch</button> | -->
      <!-- <button   class="btn btn-primary btn-sm"  v-on:click="selectNet('mainnet')" >Mainnet</button> -->
    </div>

  </div>



</template>

<script>
  import { storeToRefs } from 'pinia'
  import { usekeplrStore } from './stores/keplr'

  export default {
    name: 'App',

    setup(){

          const {chainId, rpcEndpoint,isTestnet} = storeToRefs(usekeplrStore())

          return {
            chainId, rpcEndpoint, isTestnet
          }
      },
      computed: {

      },
     mounted(){
      //this.selectNet('testnssset')

    },
    methods: {
        selectNet: async function (network) {

            if (network == "testnet"){
                this.isTestnet = true;
                this.chainId = "empe-testnet-2";
                this.rpcEndpoint = "https://rpc-testnet.empe.io/";

            }else if(network == "mainnet") {
              this.isTestnet = false;
              this.chainId = "empe-1";
                this.rpcEndpoint = "https://rpc.empe.io";
            }

        }

    }
  }
</script>

<style>
@import './assets/base.css';
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-attachment: fixed;
  color: #fff !important;
  font-family: 'Prompt', sans-serif !important;
  background-color: #191B26 !important;
}
.card {
  background-color: rgba(42, 56, 162, 0.5) !important;
}
.light-card {
  background-color: rgba(255, 255, 255, 0.3) !important;
  -webkit-backdrop-filter: blur(10px)!important;
  backdrop-filter: blur(10px)!important;
  border-radius: 5pt!important;
  border: 0px!important;
  padding: 10px!important;
  color: #fff!important;
}

.btn-info {
  background-color: rgb(50, 45, 194) !important;
  border-color: rgb(50, 45, 194) !important;

  cursor: pointer !important;
  color: white !important;
}
.btn-info:hover,.btn-info:hover,.btn-info:focus{
  background-color: rgb(40, 37, 132);
  color: white !important;

}

.nav-tabs .nav-link {
  color: white;
}
 .nav-item  {
   background: #ffffff6b;
   color: white;
 }
.list-group-item {
  color: white;
  border: none;
}
  p, p a, p a:hover {
    color: white;
  }


</style>
