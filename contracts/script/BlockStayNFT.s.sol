// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {BlockStayNFT} from "../src/BlockStayNFT.sol";

contract BlockStayNFTScript is Script {

    function setUp() public {}

    function run() external returns (BlockStayNFT hotel) {
        // load variables from envinronment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // deploying the contract
        vm.startBroadcast(deployerPrivateKey);

        hotel = new BlockStayNFT();

        vm.stopBroadcast();
    }
}
