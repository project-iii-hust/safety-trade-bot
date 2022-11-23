import React, {useState} from 'react';
import Web3 from 'web3';
import { privateKeyToAccount, sendSignedTxAndGetResult } from '../utils';
import {FACTORY_ADDRESS, ROUTER_ADDRESS} from "../constants/constants.js"
import { Button } from '@mui/material';

const cakeFactoryAbi = require('../abi/pcs_factory.json')

const MakeTransaction = () => {
  const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  const [account, setAccount] = useState(null)
  privateKeyToAccount(web3, "74d981d517ab08e93c59016a7c8c8403a7f5269976407aeca5def0fe5988181c")
  .then(res =>{
    setAccount(res)
  })

  const lpContract = new web3.eth.Contract(
    cakeFactoryAbi,
    FACTORY_ADDRESS
  )

  const handleClick = () => {
    const getPair = lpContract.methods.getPair("0xae13d989dac2f0debff460ac112a837c89baa7cd", "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684")
    sendSignedTxAndGetResult(account, lpContract, 0, getPair, 10.0, web3)
    .then(res => {
      console.log(res)
    })
  }
  
  return (
    <Button onClick={handleClick}>Click</Button>
  )
}

export default MakeTransaction