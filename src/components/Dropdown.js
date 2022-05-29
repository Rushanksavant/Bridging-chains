import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { IoIosArrowDown } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa'
import { SiBinance } from 'react-icons/si'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Dropdown() {
    const [networkFrom, setNetworkFrom] = useState("Ropsten")
    const [networkTo, setNetworkTo] = useState("BSC Testnet")

    function networkChange() {
        networkFrom === "Ropsten" ? setNetworkTo("BSC Testnet") : setNetworkTo("Ropsten")
        console.log(networkFrom, networkTo)
    }

    return (
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
    )
}