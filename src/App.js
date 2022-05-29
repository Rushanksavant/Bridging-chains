// import contractAddresses from "./address"
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { IoIosArrowDown } from 'react-icons/io'
import { FaEthereum } from 'react-icons/fa'
import { SiBinance } from 'react-icons/si'
// import Dropdown from './components/Dropdown.js';

import contractAddresses from './address'
import Bridge_on_Eth from './artifacts/contracts/Bridges/Bridge_on_Eth.sol/Bridge_on_Eth.json'
import Bridge_on_Bnb from './artifacts/contracts/Bridges/Bridge_on_Bnb.sol/Bridge_on_Bnb.json'



function App() {
  const [account, setAccount] = useState(null)

  const [networkFrom, setNetworkFrom] = useState("Ropsten")
  const [networkTo, setNetworkTo] = useState("BSC Testnet")

  const [signature, setSignature] = useState('')
  const [amount, setAmount] = useState(0)
  const [nonce, setNonce] = useState(0)
  const [event, setEvent] = useState([])

  async function GetNonce() {  // needed
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, provider)

    let i = 0;
    while (await BridgeETH.connect(account).getNonce(i)) {
      i++
    }
    // console.log(await BridgeETH.connect(account).getNonce(1))
    setNonce(i)
    // console.log(nonce)
  }

  async function SignMessage(amount) {  // needed
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

  async function burn_on_ETH(amount) { // # 1
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, signer)

    // console.log(account, signature, nonce)

    const transaction = await BridgeETH.connect(signer).burn(amount, nonce, signature)
    await transaction.wait()

  }

  async function queryETHevents() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, provider)
    const eventFilter = BridgeETH.filters.Transfer(account, null, null, nonce, null, null)
    const events = await BridgeETH.connect(account).queryFilter(eventFilter)
    setEvent(events)
    // console.log(events)
    // console.log(event[0]["args"][0])
    // console.log(ethers.utils.formatUnits(event[0]["args"][1].toString(), 'ether'))
    // console.log(event[0]["args"][3].toString())
    // console.log(event[0]["args"][4])
    // const to = event[0]["args"][0]
    setAmount(ethers.utils.formatUnits(event[0]["args"][1].toString(), 'wei'))
    setNonce(parseInt(event[0]["args"][3].toString()))
    setSignature(event[0]["args"][4])
  }

  async function mint_on_BSC() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, signer)
    console.log(amount, nonce, signature)
    const transaction = await BridgeBSC.connect(signer).mint(amount, nonce, signature)
  }


  async function connect() {
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
  return (
    <div className="flex flex-col h-screen bg-slate-900">

      {account ?
        <div className='text-white ml-auto mr-[100px] mt-[50px] md:mt-[50px] md:ml-auto md:mr-[100px]'>
          🟢{account}
        </div> :
        <button className='bg-orange-500 text-white font-bold mt-[50px] text-md p-2 w-[100px] ml-auto mr-[100px] rounded-lg md:mt-[50px] md:text-2xl md:p-3 md:w-[170px] md:ml-auto md:mr-[100px] md:rounded-xl'
          onClick={connect}>
          Connect
        </button>
      }

      {/* Dropdown */}
      <div className="m-auto flex flex-col bg-indigo-200 text-black h-[180px] w-[300px] rounded-lg p-2 md:h-[300px] md:w-[650px] md:rounded-xl md:p-8">

        {/* From ETH to BSC */}
        <div className='mx-auto flex mb-3'>
          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await GetNonce() // txn nonce
              await SignMessage(amount) // txn signature

              await burn_on_ETH(amount)
              await queryETHevents()
            }}>
            <FaEthereum className='text-xl' /><span className='ml-1'>Send</span>
          </button>
          <input className='h-[30px] md:h-[40px] rounded-lg ml-2 p-3 bg-indigo-100'
            onChange={(event) => setAmount(event.target.value)} placeholder="Amount BTT (10^18)">
          </input>
          {/* <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white'
            onClick={() => { SignMessage(amount) }}>
            1. Sign
          </button> */}

          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await mint_on_BSC()
            }}>
            <SiBinance className='text-xl' /><span className='ml-1'>Recieve</span>
          </button>
        </div>

        {/* From BSC to ETH */}
        <div className='mx-auto flex mt-2'>
          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await GetNonce() // txn nonce
              await SignMessage(amount) // txn signature

              await burn_on_ETH(amount)
              await queryETHevents()
            }}>
            <SiBinance className='text-xl' /><span className='ml-1'>Send</span>
          </button>
          <input className='h-[30px] md:h-[40px] rounded-lg ml-2 p-3 bg-indigo-100'
            onChange={(event) => setAmount(event.target.value)} placeholder="Amount BTT (10^18)">
          </input>
          {/* <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white'
            onClick={() => { SignMessage(amount) }}>
            1. Sign
          </button> */}

          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white flex'
            onClick={async () => {
              await mint_on_BSC()
            }}>
            <FaEthereum className='text-xl' /><span className='ml-1'>Recieve</span>
          </button>
        </div>

        <div className='mx-auto ml-auto'>
          {/* <span className='font-semibold'>BTT Balance: 100</span> */}

        </div>
      </div>
    </div>
  );
}

export default App;
