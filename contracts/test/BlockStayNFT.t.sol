// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {BlockStayNFT} from "../../src/BlockStayNFT.sol";


contract BlockStayNFTTest is Test {
    BlockStayNFT public hotel;

    address owner = makeAddr("owner");
    address user = makeAddr("user");

    function setUp() public {

        vm.startBroadcast(owner);

        hotel = new BlockStayNFT();

        vm.stopBroadcast();
        console.log("NFT Hotel BlockStay:", address(hotel));
    }

    function test_MakeRoomAsNotOwner() public {
       vm.startPrank(user);
       vm.expectRevert("Apenas o proprietario da carteira do hotel pode chamar esta funcao");
       hotel.makeRoom(1,"Basico","metadata");
       vm.stopPrank();
    }

    function test_MakeBookingAsNotOwner() public {

       vm.startPrank(user);
       vm.expectRevert("Apenas o proprietario da carteira do hotel pode chamar esta funcao");
       hotel.makeBooking(1,200,"Pacote Natal", "25/12/2024", "28/12/2024", "metadata%2F1.json");
       vm.stopPrank();
    }

}
