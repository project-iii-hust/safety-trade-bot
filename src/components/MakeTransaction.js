import React, {useState, useMemo, useEffect} from 'react';
import { privateKeyToAccount, sendSignedTxAndGetResult, addPair } from '../utils';
import {tokenAddress} from "../constants/constants.js"
import { Button, Box} from '@mui/material';
import {decrypt} from '../utils'
import NumberInput from './NumberInput';
import BigNumber from 'bignumber.js';
import CustomAlert from './CustomAlert';

const bep20TokenAbi = require('../abi/bep20_token.json')

const MakeTransaction = ({firstToken, secondToken, web3, password, cakeRouterContract, lpContract}) => {
  const [tokenAmount, setTokenAmount] = useState("0")
  const [condition, setCondition] = useState("0")

  const tokenContract = useMemo(() => {
    const tokenContract = new web3.eth.Contract(
      bep20TokenAbi,
      tokenAddress[firstToken]
    )
    return tokenContract
  }, [firstToken])

  const [account, setAccount] = useState(null)

  useEffect(() => {
    const pk = decrypt(localStorage.getItem('sbt_privatekey'), password)
    console.log("Private key: " + pk)
    privateKeyToAccount(web3, pk)
      .then(res => {
        setAccount(res)
      })
  }, [])

  const handleClick = async () => {
    addPair(firstToken, secondToken, tokenAmount, condition, web3, bep20TokenAbi, cakeRouterContract, account)
    // const approveFunction = tokenContract.methods.approve(cakeRouterContract._address, BigNumber(tokenAmount).multipliedBy("1000000000000000000"))
    // await sendSignedTxAndGetResult(account, tokenContract, 0, approveFunction, 10.0, web3)
    // .then(res => {
    //   console.log(res)
    // })

    // const spendToken = tokenAddress[firstToken]
    // const receiveToken = tokenAddress[secondToken]
    // const deadline = web3.utils.toHex(99999999999999999) 
    // // console.log(, 0, [spendToken, receiveToken], account['address'], deadline)
    // const swapFunction = cakeRouterContract.methods.swapExactTokensForTokens(BigNumber(tokenAmount).multipliedBy("1000000000000000000"), 0, [spendToken, receiveToken], account['address'], deadline)

    // // Function: swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)
    // // const getPair = lpContract.methods.getPair("0xae13d989dac2f0debff460ac112a837c89baa7cd", "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684")
    // await sendSignedTxAndGetResult(account, cakeRouterContract, 0, swapFunction, 10.0, web3)
    // .then(res => {
    //   console.log(res)
    // })
  }

  const handleShowAllowance = () => {
    tokenContract.methods.allowance(account.address, cakeRouterContract._address).call()
      .then((res) => {
        console.log("Allowance: " + BigNumber(res).dividedBy("1000000000000000000").toFixed(4))
      })
  }

  return (
    <Box>
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
      <NumberInput
        size="small"
        variant="outlined"
        label="Enter condition"
        type="number"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        className={""}
        fullWidth
      />
      <Button sx={{marginTop: "20px"}} variant="contained" onClick={handleClick}>Add {firstToken} ~ {secondToken}</Button> 
      {/* <Button onClick={handleShowAllowance}>Check</Button>  */}
      {/* <CustomAlert message="Hi" status="success"/> */}
      {/* <div>{account}</div> */}
    </Box> 
  )
}

export default MakeTransaction