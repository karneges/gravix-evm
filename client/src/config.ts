export const networks = [
    {
        chainId: 59140,
        name: 'Linea Testnet',
        rpc: 'https://rpc.goerli.linea.build',
        currency: 'ETH',
        explorer: 'https://goerli.lineascan.build',
        UsdtToken: '0x248c2193aAcDebCdD7a351968767c81FBF7B1ecB',
        StgUsdtToken: '0x60095a8Bd09b4B960EE17ed1Ad90bE2807da70B7',
        TokenFaucet: '0x9049aF67Bef5C3c2ABD71b47F1E7D56407AF6AD9',
        GravixVault: '0x10e5E8f37f77c9E886D388B313787A2DE6246180',
    },
    {
        chainId: 80001,
        name: 'Mumbai',
        rpc: 'https://rpc-mumbai.maticvigil.com',
        currency: 'MATIC',
        explorer: 'https://mumbai.polygonscan.com/',
        UsdtToken: '0x2667fC20cAD017162a6B2a29127A7F8aC88d1Ecc',
        StgUsdtToken: '0x2533Af89885Fcc0Ea112D1427d9d14b5120595e0',
        TokenFaucet: '0x095e8e8d007CFBE3932685be3a3165F005f641F5',
        GravixVault: '0x9049aF67Bef5C3c2ABD71b47F1E7D56407AF6AD9',
    },
]

export const defaultChainId = 59140
