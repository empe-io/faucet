
<template>
  <div v-if="isTestnet" >

    <div class="card light-card mb-3"  id="faucet">
      <div >
        <h4 class="p-2" >{{form.formName}}</h4>
      </div>

      <div class="text-center mt-3">
        <img src="https://empe.io/wp-content/uploads/2024/06/github-empe.png" alt="Empe Logo" class="img-fluid">
      </div>

      <div class="card-body">
        <div class="row">

          <div class="col">
            You are currently connecting to <b> {{rpcEndpoint}}</b> on chain id <b> {{chainId}}</b>.
          </div>
        </div>

        <form>
          <div class="mb-4">
            <b-input-group class="mt-3 animate__animated " prepend="Address" v-bind:class = "(form.payload.animate)?'animate__pulse':''">

              <b-form-input  v-model="form.payload.address" ></b-form-input>
              <b-input-group-append>
                <b-button variant="info" @click="copy(form.payload.address)">Copy</b-button>
              </b-input-group-append>
            </b-input-group>
          </div>
          <div class="d-grid">
            <input class="form-control btn btn-info" type="submit" @click.prevent="submit" value="Get Tokens"/>
          </div>
        </form>
      </div>
    </div>

    <b-alert v-model="alert.faucet.show"  dismissible >
      {{alert.faucet.message}}
    </b-alert>

  </div>


  <div class="card light-card mb-3" v-else>
    <div>
      <div >
        Faucet is only available on testnet. You are currently connected to {{chainId}} mainnet.
      </div>
    </div>
  </div>


</template>

<script>
  import axios from "axios";

  import { Secp256k1HdWallet } from "@cosmjs/amino";
  import { assertIsBroadcastTxSuccess, SigningStargateClient, StargateClient } from "@cosmjs/stargate";
  import { stringToPath } from "@cosmjs/crypto";
  import { usekeplrStore } from '../stores/keplr'
  import { useFaucetStore } from '../stores/faucet'
  import { storeToRefs } from 'pinia'
  import base64 from "base-64";

  export default {

    name: 'Faucet',
    setup(){
      const {form, wallet, queue, alert, txs } = storeToRefs(useFaucetStore())
      const {isNetworkAdded, chainId, rpcEndpoint, address,resultTx, isTestnet } = storeToRefs(usekeplrStore())

      return {
        form, wallet, queue, alert, txs,
        isNetworkAdded, chainId, rpcEndpoint, address,resultTx, isTestnet
      }
    },
    async mounted() {
      this.getQueue()
      const getTxCount = await this.getTxCount();
      const latest = await  this.latestTxs(1);
    },
    methods: {
        submit() {
            axios.post(this.form.endpoint+"/request", {
              address: this.form.payload.address,
            })
                    .then(response => {
                      console.log(response);
                      this.alert.faucet.status = response.data.status;
                      this.alert.faucet.message = response.data.message;
                      this.alert.faucet.show = true;
                      this.form.payload.animate = false;
                      this.getQueue()
                    })
                    .catch(error => {
                      console.log(error);
                      this.alert.faucet.status = "error"
                      this.alert.faucet.message = error;
                      this.alert.faucet.show = true;
                    });



      },
      async getQueue() {
        this.queue.loading = true;
        axios.get(this.form.endpoint+"/queue")
                .then(response => {
                  console.log(response);
                  this.queue.list = response.data;
                  this.queue.loading = false;
                })
                .catch(error => {
                  console.log(error);
                });



      },
      async copy(s) {
        await navigator.clipboard.writeText(s);
      },
      decode: function(text){
        return base64.decode(text);
      },
      shortString: function (string) {

        let begin = string.substring(0, 8);
        let end = string.substring(string.length - 8);

        return ""+begin+"..."+end+"";
      },
      getTxCount: async function () {

        console.log("keplrStore...")
        await axios.post(this.rpcEndpoint,
                {
                  "jsonrpc": "2.0",
                  "id": 998254319713,
                  "method": "tx_search",
                  "params": {
                    "query": "tx.height>=0 AND tx.height<=9007199254740991",
                    "page": "1",
                    "order_by": "desc"
                  }
                })
                .then(response => {
                  console.log("Count");

                  this.txs.total_count = parseInt(response.data.result.total_count);
                  let pageCount = response.data.result.total_count/30;
                  this.txs.pages = Math.trunc(pageCount)+1;
                  return true;

                })
                .catch(error => {
                  console.log(error);
                  return false;
                });

        return true

      },
      latestTxs: async function (page) {

        console.log("latestTxs... page:"+page)
        let that = this;
        let pageNumber = page;

        let payload = {
          "jsonrpc": "2.0",
          "id": 998254319713,
          "method": "tx_search",
          "params": {
            "page": ""+pageNumber+"",
            // "order_by": "desc",
            // "query": "message.module='bank' AND tx.height>=0 AND tx.height<=9007199254740991",
            //"query": "message.module='bank' AND transfer.recipient='"+this.$route.params['address']+"' AND tx.height>=0 AND tx.height<=9007199254740991",
            "query": "tx.height>=0 AND tx.height<=9007199254740991",

          }
        };
        axios.post(this.rpcEndpoint,payload)
                .then(response => {
                  console.log(response)
                  this.txs.list = response.data.result.txs.reverse();
                })
                .catch(error => {
                  console.log(error);
                });



      },

    }
  }
</script>

<style>

  #faucettabs .nav-tabs {
    border-bottom: 0px solid #dee2e6;
  }
</style>
