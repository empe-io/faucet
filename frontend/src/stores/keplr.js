import { defineStore } from 'pinia'

// main is the name of the store. It is unique across your application
// and will appear in devtools
export const usekeplrStore = defineStore('keplr', {
    // a function that returns a fresh state

    state: () => ({
        isNetworkAdded: false,
        chainId: 'empe-testnet-2',
        rpcEndpoint: 'https://rpc-testnet.empe.io',
        address: null,
        resultTx: '',
        isTestnet: true,

    }),

    // optional getters
    getters: {

    },
    // optional actions
    actions: {

    },
})
