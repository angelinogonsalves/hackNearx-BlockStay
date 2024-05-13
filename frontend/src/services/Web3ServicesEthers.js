import {ethers} from "ethers";
import ABI from "./ABI.json";
import { createJson, uploadJson, getJson } from "./util.js";

const CONTRACT_ADDRESS = "0x1c679a3Abb9a09450a141b5e434d11146DaF7D55"; //sepolia
//const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //anvil 

const NETWORK_ID_ALLOWED =  11155111n; // rede sepolia
//const NETWORK_ID_ALLOWED =  31337n; // rede  anvil


export async function doLogin(){

    if (!window.ethereum) throw new Error("No Metamask found");

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts",[])
    .then(accounts => {
        localStorage.setItem("wallet", accounts [0]);
    })
    .catch(error => {
    throw new Error("Wallet not found/ not allowed");  
    })
            
    //if (!accounts || !accounts.length) throw new Error("Wallet not found/ not allowed");

    const currentNetwork = (await provider.getNetwork()).chainId;

    localStorage.setItem("contractAddressHotel", CONTRACT_ADDRESS);
    localStorage.setItem("currentNetworkId", currentNetwork);

    return provider;
}

export const getContract = async () => {
    const provider = await doLogin();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    return contract;
};

export const getContractSigner = async () => {
    const provider = await doLogin();
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
   
    const contractSigner = contract.connect(signer);
    return contractSigner;
};

export async function makeRoom(roomId, description, roomTokenURI) {
    const contractSigner = await getContractSigner();  
    const networkId = localStorage.getItem("currentNetworkId");

     try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const makeRoom = await contractSigner.makeRoom(roomId, description, roomTokenURI);

        return makeRoom;
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
}

 export async function makeBooking(roomId, price, description, dateCheckin, dateCheckout, hiddenRoomDescription,hiddenRoomPhoto) {
    const contractSigner = await getContractSigner();  
    const networkId = localStorage.getItem("currentNetworkId");

    try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
   
        const jsonCreated = await createJson(roomId, price, description, dateCheckin, dateCheckout, hiddenRoomDescription, hiddenRoomPhoto);

        //TODO verificar como criar o numero sequencial para definir o nome do json criado
        const metadataJson = await uploadJson(jsonCreated, roomId);
      
        const makeBooking = await contractSigner.makeBooking(roomId, price, description, dateCheckin, dateCheckout, metadataJson);
        return (makeBooking);
        //TODO capturar o TOKENURI criado 
 
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
 }

export async function assignedBooking(tokenIdBooking) {
    const contractSigner = await getContractSigner();  
    const networkId = localStorage.getItem("currentNetworkId");
 
    const wallet = localStorage.getItem("wallet");
 
     try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const bookingIdAssigned = await contractSigner.assignedBooking(tokenIdBooking);
        return bookingIdAssigned;
         /*const retorno = await contractSigner.on("ReservasCriadas", (novoID, cliente) => {
            console.log("Novo ID da reserva criada---------------------:", novoID);
            localStorage.setItem("retornoTokenId", novoID);          
            return (localStorage.getItem("retornoTokenId"));
        });*/    
 
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
}


export async function getRoom(roomIdResult) {
    const contract = await getContract();  
    const networkId = localStorage.getItem("currentNetworkId");
 
     try {      
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        }    
        const rooms = await contract.rooms(roomIdResult);  

        return rooms;
      } catch (error) {
        throw new Error(error.reason ?? error);
     }
}

export async function getBooking(tokenId) {
    const contract = await getContract();  
    const networkId = localStorage.getItem("currentNetworkId");
  
     try {         
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const booking = await contract.bookings(tokenId);
        return booking;
      } catch (error) {
        console.log("Error getBooking: "+error);
       throw new Error(error.reason ?? error);
     }
}

export async function readJson(metadata) { 
     try {                
       return await getJson(metadata);
      
      } catch (error) {
        console.log("Error readJson: "+error);
       throw new Error(error.reason ?? error);
     }
}

export async function cancelBooking(tokenIdBooking) {
    const contractSigner = await getContractSigner();  
    const networkId = localStorage.getItem("currentNetworkId");
 
    const wallet = localStorage.getItem("wallet");
 
     try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const cancelledBooking = await contractSigner.cancelBooking(tokenIdBooking);
        return cancelledBooking;
 
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
}

export async function onlyConfirmBooking(tokenIdBooking) {
    const contractSigner = await getContractSigner();  
    const networkId = localStorage.getItem("currentNetworkId");
 
    const wallet = localStorage.getItem("wallet");
 
     try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const confirmedBooking = await contractSigner.onlyConfirmBooking(tokenIdBooking);
        return confirmedBooking;
 
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
}

export async function getTokens() {
    const contract = await getContract();  
    const networkId = localStorage.getItem("currentNetworkId");
 
    const wallet = localStorage.getItem("wallet");
 
     try {
        if ( networkId != NETWORK_ID_ALLOWED) {
            throw new Error("Network is not allowed for this contract");
        } 
        const result = await contract.getAllTokens.call();

        //console.log("Tokens criados===================>>> :", result);
        const tokensCreated = [];

        for (let indx = 0; indx <= result.length - 1; indx++) {
            if (result[indx][0] != 0) {

                const metadata = await readJson(result[indx][6]);

                let item = {
                    tokenId: parseInt(result[indx][0]),
                    available: result[indx][7],
                    description: metadata.description,
                    name: metadata.name,
                    image: metadata.image,
                    attributes: metadata.attributes
                };
                tokensCreated.push(item);
            }
        }

        return tokensCreated;
     } catch (error) {
        throw new Error(error.reason ?? error);
     }
}



