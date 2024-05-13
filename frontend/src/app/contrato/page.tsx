"use client"

import { useState, useEffect } from "react";
import styles from "../page.module.css";
import {makeRoom, makeBooking, assignedBooking, getBooking,  
  getRoom, readJson, cancelBooking, onlyConfirmBooking, getTokens} from "../../services/Web3ServicesEthers.js";
import { useRouter } from "next/navigation";
//import Image from "next/image";
import {getJson, upload} from "../../services/util.js";
import { Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';

export default function Home() {

  const [copied, setCopied] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  const EXPLORER_SEPOLIA = "https://sepolia.etherscan.io/address/";
  const EXPLORER_AMOY = "https://www.oklink.com/amoy/address/";
  const EXPLORER_OPTIMISM = "https://sepolia-optimism.etherscan.io/address/";
  
  const [message, setMessage] = useState("");

  const [wallet, setWallet] = useState("");
  const [contractAddressHotel, setContractAddressHotel] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("admin"); 

  const [image, setImage] = useState("");
  const [fileUploaded, setFileUploaded] = useState("");

  //fields make Room
  const [roomId, setRoomId] = useState("");  
  const [roomDescription, setRoomDescription] = useState("");
  const [roomPhotoUrl, setRoomPhotoUrl] = useState("");
  const [roomCreated, setRoomCreated] = useState("");

  //field get Room
  const[roomIdResult, setRoomIdResult] = useState('');
  const[roomResult, setRoomResult] = useState('');

  //fields make Booking
  const[bookingRoomId, setBookingRoomId] = useState('');
  const[bookingPrice, setBookingPrice] = useState('');
  const[bookingDescription, setBookingDescription] = useState('');
  const[bookingDateCheckin, setBookingDateCheckin] = useState('');
  const[bookingDateCheckout, setBookingDateCheckout] = useState('');
  const[bookingRoomDescription, setBookingRoomDescription] = useState('');
  const[bookingRoomPhoto, setBookingRoomPhoto] = useState('');
  const[bookingCreated, setBookingCreated] = useState('');

  //field assigned Booking
  const[tokenIdBooking, setTokenIdBooking] = useState('');
  const[assignedBookingCreated, setAssignedBookingCreated] = useState('');

  //field cancel Booking
  const[tokenIdCancelBooking, setTokenIdCancelBooking] = useState('');
  const[cancelledBooking, setCancelledBooking] = useState('');

  //field cancel Booking
  const[tokenIdConfirmBooking, setTokenIdConfirmBooking] = useState('');
  const[confirmedBooking, setConfirmedBooking] = useState('');
  
  //field get Booking
  const[tokenId, setTokenId] = useState('');
  const[bookingResult, setBookingResult] = useState('');
  const[jsonResult, setJsonResult] = useState('');

  const[tokensCreated, setTokensCreated] = useState<{ tokenId: any; available: any; description: any; name: any; image: any; attributes: any; }[]>([]);
  const { push } = useRouter();

  async function btnGetTokens() {
    setMessage("Conectando na carteira...aguarde...");
   
    await getTokens()
    .then(tokensCreated => {
      setMessage("Loading.....");
      setTokensCreated(tokensCreated);
      // ver como capturar corretamente o tokenId e demais campos com erro... 
      //mostrar apenas os que possuem available true
      setMessage("");

    })
    .catch(error => {
      setMessage(error.message);
  
    })
  }
  

  useEffect(() => {
    const loadUserAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWallet(accounts[0]); 
          }
        } catch (error) {
          console.error('Erro ao conectar com a MetaMask:', error);
          setMessage(error.message ?? error);
        }
      } else {
        console.error('MetaMask não detectada no navegador');
      }
    };

    if (!localStorage.getItem("wallet")) return push("/");
    setWallet(localStorage.getItem("wallet"));
    setContractAddressHotel(localStorage.getItem("contractAddressHotel")); 
    loadUserAccount();
    btnGetTokens();
  }, []);

  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]); 
      } else {
        setWallet(""); 
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

function linkExplorer() {
  const url = EXPLORER_SEPOLIA + localStorage.getItem("contractAddressHotel");
  window.open(url, "_blank");
}

function onFileChange (evt) {
  if (evt.target.files){
    setImage(evt.target.files[0]);
  }
}

function btnUploadClick(){
  setMessage("");
  setFileUploaded(">> Aguarde retorno da URL");
  upload(image) 
  .then(url => {
    setFileUploaded("URL da Foto: "+url ?? "");
    setRoomPhotoUrl(url ?? "");
  })
  .catch(err => setMessage(err.msessage));
}

async function btnMakeRoom() {
  setMessage("Conectando na carteira...aguarde...");
    
  setRoomCreated(">> Aguarde retorno da Criação do Quarto!");

  await makeRoom(roomId, roomDescription, roomPhotoUrl)
  .then(roomCreated  => {
    setMessage("");
    setRoomCreated("hash da Transação de Criação do Quarto: "+roomCreated.hash);
  })
  .catch(error => {
    setMessage(error.message);
  })
}

async function btnMakeBooking() {
  setMessage("Conectando na carteira...aguarde...");
  setBookingCreated(">> Aguarde retorno da Criação do Pacote!");

  const hiddenRoomId = roomResult[0];
  const hiddenRoomDescription = roomResult[1];
  const hiddenRoomPhoto = roomResult[2];

  await makeBooking(hiddenRoomId, bookingPrice, bookingDescription, bookingDateCheckin, bookingDateCheckout, hiddenRoomDescription, hiddenRoomPhoto)
  .then(bookingCreated  => {
    setMessage("");
    setRoomIdResult("");
    setRoomResult("");
    setBookingPrice(""); 
    setBookingDescription(""); 
    setBookingDateCheckin(""); 
    setBookingDateCheckout("");    

    setBookingCreated("hash da Transação de Criação do Pacote: "+bookingCreated.hash);
  })
  .catch(error  => {
      setMessage(error.message);
  })
}

async function handleReserveClick(token) {
  setMessage("Conectando na carteira...aguarde...");
  await assignedBooking(token)
  .then(assignedBookingCreated => {
    setMessage("");
    setAssignedBookingCreated(assignedBookingCreated.hash);
  })
  .catch(error => {
    setMessage(error.message);

  })
}

async function handleCancelClick(token) {
  setMessage("Conectando na carteira...aguarde...");
  //-<!-- validar o tokenId - se alterar no campo  que esta com onchange vai mandar errado para cancelar -->

  await cancelBooking(token)
  .then(cancelledBooking => {
    setMessage("");
    setCancelledBooking(cancelledBooking.hash);
  })
  .catch(error => {
    setMessage(error.message);

  })
}

async function btnOnlyConfirmBooking() {
  setMessage("Conectando na carteira...aguarde...");
 
  await onlyConfirmBooking(tokenIdConfirmBooking)
  .then(confirmedBooking => {
    setMessage("");
    setConfirmedBooking(confirmedBooking.hash);
  })
  .catch(error => {
    setMessage(error.message);

  })
}

async function btnGetRoom() {
  setMessage("Conectando na carteira...aguarde...");

  setFileUploaded("");
  setRoomId("");
  setRoomDescription("");
  setRoomPhotoUrl("");
  setRoomCreated("");

  await getRoom(roomIdResult)
  .then(roomResult => {
    setMessage("");

    setRoomResult(roomResult);  
  })
  .catch(error => {
    setMessage(error.message);
  })
}

async function btnGetBooking() {
  setMessage("Conectando na carteira...aguarde...");
  setBookingResult(""); 

  await getBooking(tokenId)
  .then(async bookingResult => {

    setMessage("");
    setBookingResult(bookingResult); 
    await readJson(bookingResult[10])
    .then(metadata => {
      setJsonResult(metadata);
    })
    .catch(error => {
      setMessage(error.message);
    })
  }).catch(error => {
    setMessage(error.message);
  })    
}

function MyComponent({ jsonData }) {
  if (!jsonData) {
    return <div>Dados não disponíveis.</div>;
  }
  return (
<div>
      <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} >
            <Card>    
              <CardMedia component="img" width="180" height="140" image={jsonData.image} alt="Room"/>      
              <CardContent>
                
                <Typography gutterBottom variant="h5" component="div">
                   {typeof jsonData.description === 'string' ? jsonData.description : ''}                     
                </Typography>
                <Typography variant="body2" color="text.secondary">
                {typeof jsonData.name === 'string' ? jsonData.name : ''}  
                </Typography>    
                {jsonData.attributes.map((attribute, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    {typeof attribute.trait_type === 'string' ? attribute.trait_type : ''}: {typeof attribute.value === 'string' ? attribute.value : ''}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
      </Grid>
      </div>
  );
}

const handleCopyClick = () => {
  navigator.clipboard.writeText(wallet);
  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 2000);
};

const handleCopyClickContract = () => {
  navigator.clipboard.writeText(contractAddressHotel);
  setCopiedContract(true);

  setTimeout(() => {
    setCopiedContract(false);
  }, 2000);
};
   
return (
    <main className={styles.container}>

      <div className={styles.header}>
            <img src="/LogoBlockStay.png" width="200" className={styles.logo} />  

            <div className={styles.wallet}>
                <img src="/metamask-fox.svg" width="30" className={styles.icon} />
                {wallet ? (
                  <span>{wallet.substring(0, 14)}...{wallet.substring(38)}</span>
                 ) : (
                   <span>Wallet Não conectada</span>
                  )}

                  <img src="/copy.png" onClick={handleCopyClick} width="30" alt="Copiar" />
                  {copied ? 'Copiado!' : ''}
    
               <br/><br></br>
               <div className={styles.divider} /> 
              <label><b>SmartContract : {contractAddressHotel} </b>
              <img src="/copy.png" onClick={handleCopyClickContract} width="30" alt="Copiar" />
                  {copiedContract ? 'Copiado!' : ''}</label><br/>
              <button className={styles.explorerButton} onClick={linkExplorer}>Ver transação no Explorer da Rede
              </button>
            </div>          
      </div>

      <div className={styles.menu}>
        <a
          href="#admin"
          className={`${styles.menuLink} ${selectedMenu === "admin" && styles.activeMenu}`}
          onClick={() => setSelectedMenu("admin")}>Admin </a>
        <a
          href="#pacotes"
          className={`${styles.menuLink} ${selectedMenu === "pacotes" && styles.activeMenu}`}
          onClick={() => setSelectedMenu("pacotes")}> Pacotes </a>
        <a
          href="#reserva"
          className={`${styles.menuLink} ${selectedMenu === "reserva" && styles.activeMenu}`}
          onClick={() => setSelectedMenu("reserva")}> Reserva </a>
      </div>

      <div className={styles.message}>{message}</div>
  
      {selectedMenu === "admin" && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}> Admim</h2>
               <div className={styles.formGroup}>
                <div className={styles.formGroupTitle}>Criar Quarto</div>             
                <label className={styles.label}> Antes de criar o quarto, 
                faça Upload da Foto - 
                 <label htmlFor="image" className="custom-file-upload">
                  Escolha um arquivo >>
                  <input type="file" id="image" accept=".jpg, .jpeg, .png" onChange={onFileChange} />
                </label>
                <button className={styles.actionButton}  onClick={btnUploadClick} >Enviar</button>
                <br />
                <span className={styles.smallText}> {fileUploaded}</span>
                 
               </label>
               <div className={styles.divider} /> 

                <label className={styles.label}>
                  Id do Quarto:
                  <input type="number" value={roomId} onChange={(evt) => setRoomId(evt.target.value)} className={styles.inputSmall}/>
                  Descrição:
                  <input type="text" value={roomDescription} onChange={(evt) => setRoomDescription(evt.target.value)} className={styles.inputMedium}/> 
                  <br/>URL da Foto:
                  <input type="text" value={roomPhotoUrl} onChange={(evt) => setRoomPhotoUrl(evt.target.value)} className={styles.input}/> 
                  <button className={styles.actionButton} onClick={btnMakeRoom}>Enviar</button>
                </label>
                {roomCreated != null && roomCreated.length > 0 ? (
                  <label className={styles.transactionResult}> {roomCreated}</label>
                ) : null}  
              <div className={styles.divider} /> 

            <div className={styles.formGroup}>
            <div className={styles.formGroupTitle}>Criar Pacote</div>
              <label className={styles.label}>
                  Id do Quarto:
                  <input type="number" value={roomIdResult} onChange={(evt) => setRoomIdResult(evt.target.value)}
                  onBlur={(evt) => {                    
                    if (roomIdResult != null && roomIdResult.length >=1 ) {
                        btnGetRoom();
                    }
                }}
                 className={styles.inputSmall}/>
                
                {roomResult != null && roomResult.length > 0 ? (
                  <label className={styles.transactionResult}>  
                    Quarto Id: {parseInt(roomResult[0])} - 
                    Descrição:{roomResult[1]} -
                    Foto do quarto: <img src={roomResult[2]} width="140" className="me-3"/> 
                    <input type="hidden" value={parseInt(roomResult[0])} onChange={(evt) => { setBookingRoomId(evt.target.value); setRoomIdResult(roomResult[0]); }} />
                    <input type="hidden" value={roomResult[1]} onChange={(evt) => { setBookingRoomDescription(evt.target.value); setRoomDescription(roomResult[1]);  }} />
                    <input type="hidden" value={roomResult[2]} onChange={(evt) => { setBookingRoomPhoto(evt.target.value); setRoomPhotoUrl(roomResult[2]); }} />
                  </label>                  
                ) : null }
                  <br/>Preço:
                  <input type="number" value={bookingPrice} onChange={(evt) => setBookingPrice(evt.target.value)} className={styles.inputSmall}/>
                  Descrição do Pacote:
                  <input type="text" value={bookingDescription} onChange={(evt) => setBookingDescription(evt.target.value)} className={styles.inputMedium}/>
                  <br/>Data CheckIn:
                  <input type="text" value={bookingDateCheckin} onChange={(evt) => setBookingDateCheckin(evt.target.value)} className={styles.inputMedium}/>
                  Data CheckOut:
                  <input type="text" value={bookingDateCheckout} onChange={(evt) => setBookingDateCheckout(evt.target.value)} className={styles.inputMedium}/>
                  <button className={styles.actionButton} onClick={btnMakeBooking}>Enviar </button>
                </label>
                {bookingCreated != null && bookingCreated.length > 0 ? (
                  <label className={styles.transactionResult}>
                   {bookingCreated}             
                  </label>
                ) : null}                    
              </div>
              <div className={styles.divider} /> 
           </div>
           <div className={styles.formGroup}>
        <div className={styles.formGroupTitle}>Confirmar Reserva / Pagamento Feito de outra forma</div>
          <label className={styles.label}>Token Id da Reserva:
            <input type="text" value={tokenIdConfirmBooking} onChange={(evt) => setTokenIdConfirmBooking(evt.target.value)} className={styles.inputSmall}/>
            <button className={styles.actionButton} onClick={btnOnlyConfirmBooking}>Enviar </button>
          </label>
          {confirmedBooking != null && confirmedBooking.length > 0 ? (
            <label className={styles.transactionResult}>
              hash da Transação - Confirmação da Reserva: {confirmedBooking}           
            </label>
          ) : null}    
        <div className={styles.divider} />   
        </div>

        </div>
      )}

  {selectedMenu === "pacotes" && (
      <div className={styles.section}>
       <h2 className={styles.sectionTitle}>Tokens/Pacotes Disponíveis</h2>
        <div className={styles.formGroup}>
        <div className={styles.formGroupTitle}></div>
            <div>
            {tokensCreated != null && tokensCreated.length > 0 ? (
              <Grid container spacing={2}>
              {tokensCreated.map((token, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>    
                      <CardMedia component="img" width="180" height="140" image={token.image} alt="Room"/>      
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                         {typeof token.description === 'string' ? token.description : ''}                     
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Token Id: #{typeof parseInt(token.tokenId) === 'number' ? token.tokenId : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Disponivel: {token.available ? "Sim" : "Não"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {typeof token.name === 'string' ? token.name : ''}  
                        </Typography>    
                        {token.attributes.map((attribute, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">
                            {typeof attribute.trait_type === 'string' ? attribute.trait_type : ''}: {typeof attribute.value === 'string' ? attribute.value : ''}
                          </Typography>
                        ))}
                       <Button variant="contained" color="primary" onClick={() => 
                        handleReserveClick(token.tokenId)
                        }>Reservar</Button>
                      </CardContent>
                    </Card>
                  </Grid>
                    ))}
              </Grid>
              ) : "Nao ha pacotes disponiveis"}

            {assignedBookingCreated != null && assignedBookingCreated.length > 0 ? (
              <label className={styles.transactionResult}>
                hash da Reserva: {assignedBookingCreated}           
              </label>
            ) : null}    
            
           </div>
        </div>
      </div>
      )}
  
      {selectedMenu === "reserva" && (
        <div className={styles.section}>
       <h2 className={styles.sectionTitle}>Reserva</h2>
         <div className={styles.formGroup}>
          <div className={styles.formGroupTitle}>Visualizar Pacote / Reserva</div>
            <label className={styles.label}>
              Token Id do Pacote/Reserva:
              <input type="text" value={tokenId} onChange={(evt) => setTokenId(evt.target.value)} className={styles.inputSmall}/>           
              <button className={styles.actionButton} onClick={btnGetBooking}>Enviar </button>
            </label>
            {bookingResult != null && bookingResult.length > 0 ? (
            <>
            <label className={styles.transactionResult}>
              <label>Informações do Pacote/Reserva:<br />
                <label> Token Id: </label>#{parseInt(tokenId)} 
                <label> Pacote Disponível:</label>{bookingResult[5] ? "Sim" : "Não"} -
                <label> CheckIn:</label>{bookingResult[6] ? "Sim" : "Não"} -
                <label> CheckOut:</label>{bookingResult[7] ? "Sim" : "Não"} -
                <label> Reserva Confirmada:</label>{bookingResult[8] ? "Sim" : "Não"} -
                <label> Reserva Cancelada:</label>{bookingResult[9] ? "Sim" : "Não"} <br />
              </label>
           </label>
           <MyComponent jsonData={jsonResult} />
              { !bookingResult[5] ? (
              <Button variant="contained" color="primary" onClick={() => 
                handleCancelClick(tokenId)}>Cancelar</Button>
              ): null}
            {cancelledBooking != null && cancelledBooking.length > 0 ? (
                <label className={styles.transactionResult}>
                  hash do Cancelamento da Reserva: {cancelledBooking}           
                </label>
              ) : null}   
           </>

            ) : null}  
            
          </div>
          <div className={styles.divider} /> 


      </div>
      )}
    </main>
  );
}
