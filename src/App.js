// import contractAddresses from "./address"
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { useState } from "react";
import Dropdown from './components/Dropdown.js';


function App() {
  const [account, setAccount] = useState(null)

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

      <div className="m-auto flex flex-col bg-indigo-200 text-black h-[180px] w-[300px] rounded-lg p-2 md:h-[300px] md:w-[650px] md:rounded-xl md:p-8">
        <div>
          <Dropdown />
        </div>

        <div className='m-auto'>
          <span className='font-semibold'>Amount BTT:</span>
          <input className='h-[30px] md:h-[40px] rounded-lg ml-2 p-3 bg-indigo-100'>
          </input>
        </div>

        <div className='mx-auto ml-auto'>
          <span className='font-semibold'>BTT Balance: 100</span>

        </div>
      </div>
    </div>
  );
}

export default App;
