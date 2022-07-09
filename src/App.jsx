import React, { useEffect, useState } from "react";
import { ethers} from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  
  //stores all waves
  const [allWaves, setAllWaves] = useState([]);
  //stores contract address
  const contractAddress = "0x0039A488FCE4D4c8383C96B5DA4b00307d550B43";
  
  //retrieving waves method
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleand = waves.map(wave =>{
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum Object does not exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  
  //refrencing the ABI
  const contractABI = abi.abi;

  //Store users wallet
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure MetaMask is installed");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      //Check for authorized wallets by users
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account", account);
      } else {
        console.log("No authorized account found")
      }
    } catch(error) {
      console.log(error);
    }
  }

  //Implementing connectWallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Install MetaMask");
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  //Retriving the getTotalWaves function
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        //Execute the actual wave from your smart contract
        const waveTxn = await wavePortalContract.wave("this is a message");
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  //runs the function
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    getAllWaves();
  }, [])
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ])
    };
    
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
    
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);
            
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am the Wave Portal Smart Contract
        </div>

        {/*If there is no currrentAccount, this button will be rendered*/}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
             Connect Wallet 👛
          </button>
        )}

        <button className="waveButton" onClick={wave}>
          Send a Wave 👋
        </button>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Addres: {wave.address}</div>
              <div>Time: {wave.timestamp.toString}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>    
  );  
}

export default App