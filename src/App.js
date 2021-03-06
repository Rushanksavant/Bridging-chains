// Dependencies
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState } from 'react'

import { IoIosArrowDown } from 'react-icons/io'
import { FaEthereum } from 'react-icons/fa'
import { SiBinance } from 'react-icons/si'

// Contract artifacts and addresses 
import contractAddresses from './address'
import Bridge_on_Eth from './artifacts/contracts/Bridges/Bridge_on_Eth.sol/Bridge_on_Eth.json'
import Bridge_on_Bnb from './artifacts/contracts/Bridges/Bridge_on_Bnb.sol/Bridge_on_Bnb.json'



function App() {

  // react-states
  // ------------------------------------------------------------
  const [account, setAccount] = useState(null)

  const [networkFrom, setNetworkFrom] = useState("Ropsten")
  const [networkTo, setNetworkTo] = useState("BSC Testnet")

  const [signature, setSignature] = useState('')
  const [amount, setAmount] = useState(0)
  const [nonce, setNonce] = useState(0)
  const [event, setEvent] = useState([])
  // ------------------------------------------------------------


  // Following functions can be used on all chains
  // --------------------------------------------------------------------------------------------------------------------------
  async function connect() { // to connect metamask and get address 
    try {
      // connecting...
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const accounts = await provider.listAccounts()
      setAccount(accounts[0]) // saving account address
      console.log(account)
    } catch (err) {
      console.log('error:', err)
    }

  }

  async function SignMessage(amount) {  // to sign txn hash
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const message = ethers.utils.solidityKeccak256(['address', 'uint256', 'uint256'],
      [account, amount, nonce]).toString('hex')

    const sig = await signer.signMessage(ethers.utils.arrayify(message))
    setSignature(sig)
    console.log(signature, nonce, amount)
  }
  // --------------------------------------------------------------------------------------------------------------------------



  // From ETH to BSC
  // --------------------------------------------------------------------------------------------------------------------------
  async function GetNonce_ETH() {  // 1
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, provider)

    let i = 1;
    while (await BridgeETH.connect(account).getNonce(i)) {
      i++
    }
    setNonce(i)
  }

  async function burn_on_ETH(amount) { // 2
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, signer)

    // console.log(account, signature, nonce)

    const transaction = await BridgeETH.connect(signer).burn(amount, nonce, signature)
    await transaction.wait()

  }

  async function queryETHevents() { // 3
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, provider)
    const eventFilter = BridgeETH.filters.Transfer(account, null, null, nonce, null, null)
    const events = await BridgeETH.connect(account).queryFilter(eventFilter)
    setEvent(events)

    setAmount(ethers.utils.formatUnits(event[0]["args"][1].toString(), 'wei'))
    setNonce(parseInt(event[0]["args"][3].toString()))
    setSignature(event[0]["args"][4])
    console.log(amount, nonce, signature)
  }

  async function mint_on_BSC() { // 4
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, signer)
    console.log(amount, nonce, signature)
    const transaction = await BridgeBSC.connect(signer).mint(ethers.utils.parseEther(amount), nonce, signature)
  }
  // --------------------------------------------------------------------------------------------------------------------------




  // From BSC to ETH
  // --------------------------------------------------------------------------------------------------------------------------
  async function GetNonce_BSC() {  // 1
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, provider)

    let i = 1; // dummy txn occupied nonce = 0
    while (await BridgeBSC.connect(account).getNonce(i)) {
      i++
    }
    setNonce(i)
  }

  async function burn_on_BSC(amount) { // 2
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, signer)

    // console.log(account, signature, nonce)

    const transaction = await BridgeBSC.connect(signer).burn(amount, nonce, signature)
    await transaction.wait()

  }

  async function queryBSCevents() { // 3
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, provider)
    const eventFilter = BridgeBSC.filters.Transfer(account, null, null, nonce, null, null)
    const events = await BridgeBSC.connect(account).queryFilter(eventFilter)
    setEvent(events)

    setAmount(ethers.utils.formatUnits(event[0]["args"][1].toString(), 'wei'))
    setNonce(parseInt(event[0]["args"][3].toString()))
    setSignature(event[0]["args"][4])
  }

  async function mint_on_ETH() { // 4
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, signer)
    console.log(amount, nonce, signature)
    const transaction = await BridgeETH.connect(signer).mint(ethers.utils.parseEther(amount), nonce, signature)
  }
  // --------------------------------------------------------------------------------------------------------------------------




  return (
    <div className="flex flex-col h-screen bg-slate-900">

      {account ?
        <div className='text-white ml-auto mr-[100px] mt-[50px] md:mt-[50px] md:ml-auto md:mr-[100px]'>
          ????{account}
        </div> :
        <button className='bg-orange-500 text-white font-bold mt-[50px] text-md p-2 w-[100px] ml-auto mr-[100px] rounded-lg md:mt-[50px] md:text-2xl md:p-3 md:w-[170px] md:ml-auto md:mr-[100px] md:rounded-xl'
          onClick={connect}>
          Connect
        </button>
      }

      <div className="m-auto flex flex-col bg-indigo-200 text-black h-[180px] w-[300px] rounded-lg p-2 md:h-[300px] md:w-[650px] md:rounded-xl md:p-8">

        {/* From ETH to BSC */}
        {/* -------------------------------------------------------------------------------------------------------------------------- */}
        <div className='mx-auto justify-between flex mb-3 text-sm md:text-md lg:text-lg'>

          <button className='bg-red-300 p-1 md:p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              GetNonce_ETH() // txn nonce
              console.log(nonce)
              await SignMessage(ethers.utils.parseEther(amount.toString())) // txn signature

              await burn_on_ETH(ethers.utils.parseEther(amount.toString()))
              await queryETHevents()
            }}>
            <FaEthereum className='text-xl' /><span className='ml-1'>Send</span>
          </button>

          <input className='h-[30px] md:h-[40px] w-[100px] md:w-1/3 rounded-lg ml-2 p-3 bg-indigo-100'
            onChange={(event) => setAmount(event.target.value)} placeholder="Amount BTT">
          </input>

          <button className='bg-red-300 p-1 md:p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await mint_on_BSC()
            }}>
            <SiBinance className='text-xl' /><span className='ml-1'>Recieve</span>
          </button>

        </div>
        {/* -------------------------------------------------------------------------------------------------------------------------- */}




        {/* From BSC to ETH */}
        {/* -------------------------------------------------------------------------------------------------------------------------- */}
        <div className='mx-auto justify-between flex mt-2 text-sm md:text-md lg:text-lg'>

          <button className='bg-red-300 p-1 md:p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await GetNonce_BSC() // txn nonce
              console.log(nonce)
              await SignMessage(ethers.utils.parseEther(amount.toString())) // txn signature

              await burn_on_BSC(ethers.utils.parseEther(amount.toString()))
              queryBSCevents()
            }}>
            <SiBinance className='text-xl' /><span className='ml-1'>Send</span>
          </button>

          <input className='h-[30px] md:h-[40px] w-[100px] md:w-1/3 rounded-lg ml-2 p-3 bg-indigo-100'
            onChange={(event) => setAmount(event.target.value)} placeholder="Amount BTT">
          </input>

          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await mint_on_ETH()
            }}>
            <FaEthereum className='text-xl' /><span className='ml-1'>Recieve</span>
          </button>

        </div>
        {/* -------------------------------------------------------------------------------------------------------------------------- */}

        <div className='mx-auto text-red-600 mt-auto flex flex-row text-[10px] md:text-md lg:text-lg'>
          <div>
            <span className='font-bold text-[12px] md:text-[16px] lg:text-lg'>Note: </span> Please change your metamask connection to <span className='font-bold text-[12px] md:text-[16px] lg:text-lg'>Ropsten</span> and <span className='font-bold text-[12px] md:text-[16px] lg:text-lg'>BSC Testnet</span> while clicking respective buttons.
          </div>
        </div>
      </div>


      <div className='ml-auto mr-[100px] mt-[50px] md:mt-[50px] md:ml-auto md:mr-[100px] text-[12px] md:text-[15px] lg:text-[17px] text-white'>
        Mail me your ETH/BSC address to get some BTT<br></br>
        Email - rssavant34@gmail.com
      </div>
      <div className='mt-2'></div>
    </div>
  );
}

export default App;
