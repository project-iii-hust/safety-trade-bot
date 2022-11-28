import React, {useState, useMemo, useEffect} from 'react';
import { privateKeyToAccount, sendSignedTxAndGetResult } from '../utils';
import {tokenAddress} from "../constants/constants.js"
import { Button, Box, TextField } from '@mui/material';
import { encrypt, decrypt } from '../utils'
import { ROUTER_ADDRESS } from '../constants/constants.js';
import NumberInput from './NumberInput';
import BigNumber from 'bignumber.js';

const cakeFactoryAbi = require('../abi/pcs_factory.json')
const bep20TokenAbi = require('../abi/bep20_token.json')

const MakeTransaction = ({firstToken, secondToken, web3, password, cakeRouterContract, lpContract}) => {
  const [step, setStep] = useState(1)
  const [tokenAmount, setTokenAmount] = useState(0)

  const tokenContract = useMemo(() => {
    const tokenContract = new web3.eth.Contract(
      bep20TokenAbi,
      tokenAddress[firstToken]
    )
    return tokenContract
  }, [firstToken])

  // const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  const [account, setAccount] = useState(null)
  // privateKeyToAccount(web3, "74d981d517ab08e93c59016a7c8c8403a7f5269976407aeca5def0fe5988181c")
  // .then(res =>{
  //   setAccount(res)
  // })
  useEffect(() => {
    const pk = decrypt(localStorage.getItem('sbt_privatekey'), password)
    console.log("Private key: " + pk)
    privateKeyToAccount(web3, pk)
      .then(res => {
        setAccount(res)
      })
  }, [])

  // const lpContract = new web3.eth.Contract(
  //   cakeFactoryAbi,
  //   FACTORY_ADDRESS
  // )

  const handleClick = async () => {
    const approveFunction = tokenContract.methods.approve(cakeRouterContract._address, BigNumber(tokenAmount).multipliedBy("1000000000000000000"))
    await sendSignedTxAndGetResult(account, tokenContract, 0, approveFunction, 10.0, web3)
    .then(res => {
      console.log(res)
    })

    const spendToken = tokenAddress[firstToken]
    const receiveToken = tokenAddress[secondToken]
    const deadline = web3.utils.toHex(99999999999999999) 
    // console.log(, 0, [spendToken, receiveToken], account['address'], deadline)
    const swapFunction = cakeRouterContract.methods.swapExactTokensForTokens(BigNumber(tokenAmount).multipliedBy("1000000000000000000"), 0, [spendToken, receiveToken], account['address'], deadline)

    // Function: swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)
    // const getPair = lpContract.methods.getPair("0xae13d989dac2f0debff460ac112a837c89baa7cd", "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684")
    await sendSignedTxAndGetResult(account, cakeRouterContract, 0, swapFunction, 10.0, web3)
    .then(res => {
      console.log(res)
    })
  }

  const handleClickStepOne = () => {
    setStep(2)
  }

  const handleShowAllowance = () => {
    tokenContract.methods.allowance(account.address, cakeRouterContract._address).call()
      .then((res) => {
        console.log("Allowance: " + BigNumber(res).dividedBy("1000000000000000000").toFixed(4))
      })
  }

  return (
    <Box>
      <Button onClick={handleClick}>Swap {firstToken} ~ {secondToken}</Button> 
      <NumberInput
            size="small"
            variant="outlined"
            label="Enter amount"
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            className={""}
            fullWidth
          />
      <Button onClick={handleShowAllowance}>Check</Button>
      {/* <div>{account}</div> */}
    </Box> 
  )
}

export default MakeTransaction