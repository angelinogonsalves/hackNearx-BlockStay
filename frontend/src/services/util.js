import axios from 'axios';

const PINATA_URL_PINNED = "https://lavender-imaginative-capybara-994.mypinata.cloud/ipfs/";

export async function getJson(tokenURI){
    try {
        const response = await fetch(tokenURI); 
        return response.json();
    } catch (error) {
        console.error("Erro ao obter JSON da Pinata:", error);
        return null;
    }
}
export async function createJson(roomId, price, description, dateCheckin, dateCheckout, hiddenRoomDescription, hiddenRoomPhoto){
    let json =  {
        name: "Quarto #"+roomId+" - Tipo "+hiddenRoomDescription,
        description: description,
        image: hiddenRoomPhoto,
        attributes: [
            {trait_type: "Preço", value: price },
            {trait_type: "Data CheckIn", value: dateCheckin },
            {trait_type: "Data CheckOut", value: dateCheckout }
        ] };
      
    const jsonConvert = JSON.stringify(json);
    return(JSON.parse(jsonConvert));   
}

export async function uploadJson(jsonData, roomId){
   
    const formData = new FormData();
    formData.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }), roomId+'.json');

    try {
        const ipfsHash = await pinataConexion(formData); 
        return PINATA_URL_PINNED + ipfsHash;

       } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return "Erro ao fazer Upload: " +error; 
    }
}

export async function upload(image){
console.log(image);
    const formData = new FormData();
    formData.append("file", image);
    try {
        const ipfsHash = await pinataConexion(formData); 
        return PINATA_URL_PINNED + ipfsHash;

    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        return "Erro ao fazer Upload: " +error; 
    }
}

async function pinataConexion(formData){
    const response = await axios({
        method: "POST",
        url:  "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            "pinata_api_key": `${process.env.API_KEY}`,
            "pinata_secret_api_key": `${process.env.API_SECRET}`,
            "Content-Type": "multipart/form-data"
        }            
    });
    return `${response.data.IpfsHash}`;
}

