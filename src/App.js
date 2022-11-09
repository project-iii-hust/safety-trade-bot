import './App.css';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import {FACTORY_ADDRESS, ROUTER_ADDRESS} from "./constants/constants.js"
import {getPairInfo, getReserves, getTokenAddress} from "./utils/index.js"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import BigNumber from 'bignumber.js';
import { Typography, Box } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Connect from './components/Connect';

const cakeFactoryAbi = require('./abi/pcs_factory.json')
const lpAbi = require('./abi/lp_abi.json')

const tokenAddress = {
  "WBNB": "0xae13d989dac2f0debff460ac112a837c89baa7cd",
  "USDT": "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684",
  "ETH": "0x8babbb98678facc7342735486c851abd7a0d17ca",
  "BUSD": "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7",
  "DAI": "0x8a9424745056Eb399FD19a0EC26A14316684e274",
  "SAFEMOON": "0xDAcbdeCc2992a63390d108e8507B98c7E2B5584a"
}

function App() {
  const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
  const cakeFactoryContract = new web3.eth.Contract(
    cakeFactoryAbi,
    FACTORY_ADDRESS
  )

  const [pairAddress, setPairAddress] = useState("")
  const [reserveFirstToken, setReserveFirstToken] = useState("")
  const [reserveSecondToken, setReserveSecondToken] = useState("")
  const [firstToken, setFirstToken] = useState("WBNB")
  const [secondToken, setSecondToken] = useState("DAI")
  const [token0Address, setToken0Address] = useState("")

  getPairInfo(
    cakeFactoryContract,
    tokenAddress[firstToken],
    tokenAddress[secondToken]
  ).then((res) => {
    console.log("PairInfo: " + res)
    setPairAddress(res)
  })

  const lpContract = new web3.eth.Contract(
    lpAbi,
    pairAddress
  )

  getTokenAddress(lpContract)
    .then((res) => {
      setToken0Address(res)
    })

  getReserves(lpContract)
    .then((res) => {
      if(token0Address.toLowerCase() === tokenAddress[firstToken].toLowerCase()){
        setReserveFirstToken(BigNumber(res[0]))
        setReserveSecondToken(BigNumber(res[1]))
      }
      else{
        setReserveSecondToken(BigNumber(res[0]))
        setReserveFirstToken(BigNumber(res[1]))
      }
    })

  const handleChangeFirstToken = (e) => {
    if(e.target.value !== secondToken) {
      setFirstToken(e.target.value)
    }
    else {
      setSecondToken(firstToken)
      setFirstToken(e.target.value)
    }
  }

  const handleChangeSecondToken = (e) => {
    if(e.target.value !== firstToken) {
      setSecondToken(e.target.value)
    }
    else {
      setFirstToken(secondToken)
      setSecondToken(e.target.value)
    }
  }

  const swapToken = (e) => {
    let tempToken = firstToken
    setFirstToken(secondToken)
    setSecondToken(firstToken)
  }

  return (
    <Box sx={{paddingTop: "40px"}} className="App">
      {/* <h6>Token address: {token0Address}</h6>
      <h6>First address: {tokenAddress[firstToken]} {reserveFirstToken.toString()}</h6>
      <h6>Second address: {tokenAddress[secondToken]} {reserveSecondToken.toString()}</h6>
      <h6>{token0Address == tokenAddress[firstToken] ? 'true' : 'false'}</h6> */}
      <Box className='flex-box'>
      <FormControl standard sx={{marginTop: "20px", marginBottom: "20px", width: 100}}>
        <InputLabel id="demo-simple-select-label">First Token</InputLabel>
        <Select
          value={firstToken}
          label="First Token"
          onChange={handleChangeFirstToken}
        >
          <MenuItem value="USDT">USDT</MenuItem>
          <MenuItem value="ETH">ETH</MenuItem>
          <MenuItem value="BUSD">BUSD</MenuItem>
          <MenuItem value="DAI">DAI</MenuItem>
          <MenuItem value="SAFEMOON">SAFEMOON</MenuItem>
          <MenuItem value="WBNB">WBNB</MenuItem>
        </Select>
      </FormControl>
      <SwapHorizIcon sx={{fontSize: 50, margin: "auto 0"}} onClick={swapToken}/>
      <FormControl standard sx={{marginTop: "20px", width: 100}}>
        <InputLabel id="demo-simple-select-label">Second Token</InputLabel>
        <Select
          value={secondToken}
          label="First Token"
          onChange={handleChangeSecondToken}
        >
          <MenuItem value="USDT">USDT</MenuItem>
          <MenuItem value="ETH">ETH</MenuItem>
          <MenuItem value="BUSD">BUSD</MenuItem>
          <MenuItem value="DAI">DAI</MenuItem>
          <MenuItem value="SAFEMOON">SAFEMOON</MenuItem>
          <MenuItem value="WBNB">WBNB</MenuItem>
        </Select>
      </FormControl>
      </Box>
      <div className='flex-box'>
        <img className="tokenIcon" alt="BNB" height="auto"
          src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + firstToken + '.png'}
          />
        <Typography variant="body1" sx={{margin: "auto 0", fontWeight: 600, textAlign: "center" }}>{BigNumber(reserveSecondToken).dividedBy(reserveFirstToken).toFixed(4)}</Typography>
        <img className="tokenIcon" alt="USDT" height="auto"
          src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + secondToken + '.png'}
          />
      </div>
      <Connect/>
    </Box>
  );
}

export default App;
