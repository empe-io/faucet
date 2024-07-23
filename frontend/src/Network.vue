<script setup>

import {storeToRefs} from 'pinia'
import {usekeplrStore} from './stores/keplr'

const {account} = storeToRefs(useExplorerStore())

</script>

<template>
  <div>
    <button class="btn btn-primary btn-sm" v-on:click="selectNet('testnet')">Tesnet</button>
    |
    <button class="btn btn-primary btn-sm" v-on:click="selectNet('mainnet')">Mainnet</button>
  </div>
</template>

<script>

export default {
  name: 'network',
  setup() {

    const {chainId, rpcEndpoint} = storeToRefs(usekeplrStore())

    return {
      chainId, rpcEndpoint
    }
  },
  computed: {},
  mounted() {
    //this.selectNet('testnssset')
    this.chainId = "osmo-test-4";
  },
  methods: {
    selectNet: function (network) {
      if (network == "testnet") {
        // storage.setStorageSync("chainId", "osmo-test-1");
        this.isTestnet = true;
        this.chainId = "empe-testnet-2";
        this.rpcEndpoint = "https://rpc-testnet.empe.io/";

      } else if (network == "mainnet") {
        //  storage.setStorageSync("chainId", "osmosis-1");
        this.isTestnet = false;
        this.chainId = "empe-1";
        this.rpcEndpoint = "https://rpc.empe.io";
      }


    }

  }
}
</script>
