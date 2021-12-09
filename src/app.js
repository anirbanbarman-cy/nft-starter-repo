import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'node';
const TWITTER_LINK = `https://twitter.com/nodejs`;
const MY_TWITTER = 'https://twitter.com/Herobrine00100';


const App = () => {

  const CONTRACT_ADDRESS = "0x86C5f66fAf3e970E59b0982ce7Ed8Bb5CD9988d5";

    /*
    * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
    */
    const [currentAccount, setCurrentAccount] = useState("");

    const [currentTokenCount, setCurrentTokenCount] = useState(0);

    const [maxTokenCount, setMaxTokenCount] = useState(0);

    
    

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener(); 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });

        console.log("Setup event listener!")


        const mtk = await connectedContract.GetMaxTokenCount()
        setMaxTokenCount(parseInt(mtk._hex, 16))


        SetUpdatedTokenCounts(connectedContract);
  

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

const SetUpdatedTokenCounts = async (connectedContract) => {

  const tk = await connectedContract.GetTokenCount()
  console.log(tk);
  //parseInt(tk._hex, 16);
  setCurrentTokenCount(parseInt(tk._hex, 16)+1);
  
}

const askContractToMintNft = async () => {
  
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        SetUpdatedTokenCounts(connectedContract);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}


  useEffect(() => {

      /*
      * Gotta make sure this is async.
      */
      const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        /*
        * Check if we're authorized to access the user's wallet
        */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        /*
        * User can have multiple authorized accounts, we grab the first one if its there!
        */
        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account:", account);
            setCurrentAccount(account)

            setupEventListener();

        } else {
            console.log("No authorized account found")
        }
    }

    checkIfWalletIsConnected();
    // eslint-disable-next-line 
  }, [])

  /*
  * Added a conditional render! We don't want to show Connect to Wallet if we're already conencted :).
  */
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            <button onClick={connectWallet} className="cta-button connect-wallet-button">
              Connect to Wallet
            </button>
          ) : <button onClick={askContractToMintNft}                className="cta-button connect-wallet-button">
            Mint NFT
            </button>}
        </div>
        <div className="mint-count">Minted {currentTokenCount} / {maxTokenCount} already...</div>
         
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={MY_TWITTER}
            target="_blank"
            rel="noopener noreferrer"
          >{`by ANIRBAN`}</a>

        </div>
      </div>
    </div>
  );
};

export default App;
