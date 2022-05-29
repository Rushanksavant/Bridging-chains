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

  async function getNonce() {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, provider)

    let i;
    while (true) {
      if (await BridgeETH.connect(account).getNonce(i)) {
        i++
        continue
      } else {
        setNonce(i)
      }
    }
  }
  getNonce()
  console.log(nonce)

  async function SignMessage(amount) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let nonce = 2
    const message = ethers.utils.solidityKeccak256(['address', 'address', 'uint256', 'uint256'],
      [account, account, amount, nonce]).toString('hex')



    const sig = await signer.signMessage(ethers.utils.arrayify(message))
    console.log(sig)
    setSignature(sig)
  }

  async function burn_BTT(amount) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, signer)
    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, signer)

    console.log(account, signature)
    const transaction = await BridgeETH.burn(account, amount, 2, signature)

    await transaction.wait()
  }

  async function mint_BTT(amount) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const BridgeETH = new ethers.Contract(contractAddresses.Bridge_on_Eth, Bridge_on_Eth.abi, signer)
    const BridgeBSC = new ethers.Contract(contractAddresses.Bridge_on_Bsc, Bridge_on_Bnb.abi, signer)

    console.log(account, signature)
    const transaction = await BridgeBSC.mint(account, account, amount, 2, signature)

    await transaction.wait()
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
        <div>
          <div className='flex justify-between w-full'>
            <div className='flex flex-col'>
              <span className='mb-2 font-semibold'>From:</span>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
                    {networkFrom === "Ropsten" ?
                      <div className='flex'>
                        <FaEthereum className="-mx-auto h-5 w-5" />{networkFrom}
                      </div> :
                      <div className='flex'>
                        <SiBinance className="-mx-auto h-5 w-5" />{networkFrom}
                      </div>}
                    <IoIosArrowDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                    <div className="py-1">

                      <Menu.Item>
                        <button className='px-4 py-2 text-sm flex text-gray-700'
                          onClick={() => {
                            setNetworkFrom("Ropsten")
                            setNetworkTo("BSC Testnet")
                            console.log(networkFrom, networkTo)
                          }}>
                          <FaEthereum className="mx-auto h-5 w-5" /><span>Ropsten</span>
                        </button>
                      </Menu.Item>

                      <Menu.Item>
                        <button className='px-4 py-2 text-sm flex text-gray-700'
                          onClick={() => {
                            setNetworkFrom("BSC Testnet")
                            setNetworkTo("Ropsten")
                            console.log(networkFrom, networkTo)
                          }}>
                          <SiBinance className="mx-auto h-5 w-5" /><span>BSC Testnet</span>
                        </button>
                      </Menu.Item>
                    </div>


                  </Menu.Items>
                </Transition>
              </Menu>
            </div>




            <div className='flex flex-col'>
              <span className='mb-2 font-semibold'>To:</span>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">

                    {networkTo === "BSC Testnet" ?
                      <div className='flex'>
                        <SiBinance className="-mx-auto h-5 w-5" />{networkTo}
                      </div> :
                      <div className='flex'>
                        <FaEthereum className="-mx-auto h-5 w-5" />{networkTo}
                      </div>}
                  </Menu.Button>
                </div>

              </Menu>
            </div>
          </div>
          {/* <Dropdown account={account} /> */}
        </div>

        <div className='m-auto'>
          <span className='font-semibold'>Amount BTT:</span>
          <input className='h-[30px] md:h-[40px] rounded-lg ml-2 p-3 bg-indigo-100'
            onChange={(event) => setAmount(event.target.value)}>
          </input>
          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white'
            onClick={() => { SignMessage(amount) }}>
            1. Sign
          </button>
          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white'
            onClick={() => {
              burn_BTT(amount)
            }}>
            2. Burn
          </button>
          <button className='bg-red-300 p-2 ml-2 rounded-lg hover:bg-red-500 hover:text-white'
            onClick={() => {
              mint_BTT(amount)
            }}>
            3. Mint
          </button>
        </div>

        <div className='mx-auto ml-auto'>
          <span className='font-semibold'>BTT Balance: 100</span>

        </div>
      </div>
    </div>
  );
}

export default App;
