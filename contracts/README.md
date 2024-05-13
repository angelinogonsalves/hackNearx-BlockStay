## contracts

Smart Contract written in Solidity and executed on Foundry.

## Usage
```bash
# install dependencies OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

To run, locally, open 2 terminals:

On the first Terminal
```bash
anvil
```

Copy file .env.example to .env
Update variables at .env


On the Second Terminal
```shell
# deploy contract 
source .env
forge script script/BlockStayNFT.s.sol:BlockStayNFTScript --rpc-url "http://127.0.0.1:8545"
```