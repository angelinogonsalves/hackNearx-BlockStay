## frontend

Web Integration written using the framework nextjs.

#
```bash
#install dependencies
# Should has node.js installed
npm i next@13 react@latest react-dom@latest
npm i ethers
npm install axios dotenv
npm i @pinata/sdk
npm install @mui/material @emotion/react @emotion/styled
```

### How execute
This web Integration is read to use the contract deployed on Sepolia:
https://sepolia.etherscan.io/address/0x1c679a3Abb9a09450a141b5e434d11146DaF7D55

If you want run locally, you need:
- deploy the contract using [README contract](../contracts/README.md)
- copy the abi, found on : [ABI](../contracts/out/BlockStayNFT.sol/BlockStayNFT.json)
- change the variables on : [Web3ServicesEthers.js](src/services/Web3ServicesEthers.js)
    - const CONTRACT_ADDRESS = "0x........."; //anvil contract
    - const NETWORK_ID_ALLOWED =  31337n; // anvil network

```bash
#start localhost 
npm run dev
```
