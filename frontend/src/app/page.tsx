"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import {doLogin } from "../services/Web3ServicesEthers.js";

export default function Home() {
  const { push } = useRouter();
  
  const [message, setMessage] = useState("");
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  async function connectWallet (){
    await doLogin()
    .then(accounts => { 
      setIsMetaMaskConnected(true);
      push("/contrato");
    }).catch(error => {
      setMessage(error.message ?? error );
    })
  }
 
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <img src="/LogoBlockStay.png" alt="BlockStay Logo" className={styles.logoHome} />
        <div className={styles.headerContent}>
          <img src="/hotelhead.png" alt="Hotel Header" className={styles.headerImage} />
          <h1 className={styles.title}>Bem-vindo ao BlockStay</h1>
          <p className={styles.subtitle}>Sua nova experiência em reservas de hotel com blockchain.</p>
        </div>
        <div className={styles.metaMaskContainer}>
          {!isMetaMaskConnected ? (
            <button className={styles.connectButton} onClick={connectWallet}>
              Conectar com a MetaMask
              <img src="/metamask-fox.svg" alt="MetaMask Logo" className={styles.metaMaskIcon} />
            </button>
          ) : (
            <p className={styles.connectedMessage}>MetaMask conectada!</p>
          )}
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    </main>
  );
}