// All test variable refer to testnet 
import './App.css';
import { useEffect, useState, useMemo } from 'react';
import Web3 from 'web3';
import {FACTORY_ADDRESS, ROUTER_ADDRESS, tokenAddress, FACTORY_ADDRESS_TEST, ROUTER_ADDRESS_TEST, tokenAddressTest, BASE18} from "./constants/constants.js"
import {getPairInfo, getReserves, getTokenAddress} from "./utils/index.js"
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import BigNumber from 'bignumber.js';
import { Typography, Box } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Connect from './components/Connect';
import MakeTransaction from './components/MakeTransaction';

const cakeFactoryAbi = require('./abi/pcs_factory.json')
const lpAbi = require('./abi/lp_abi.json')
const cakeRouterAbi = require('./abi/pcs_router.json')

function App() {

  const [pairAddress, setPairAddress] = useState("0xf6f5CE9a91Dd4FAe2d2eD92E25F2A4dc8564F174")
  const [pairAddressTest, setPairAddressTest] = useState("0xaF9399F70d896dA0D56A4B2CbF95F4E90a6B99e8")
  const [reserveFirstToken, setReserveFirstToken] = useState("")
  const [reserveSecondToken, setReserveSecondToken] = useState("")
  const [firstToken, setFirstToken] = useState("USDT")
  const [secondToken, setSecondToken] = useState("DAI")
  const [swap, setSwap] = useState(false)
  const [loading, setLoading] = useState(false)


  const {web3, web3Test, cakeFactoryContract, cakeRouterContract, cakeFactoryContractTest, cakeRouterContractTest} = useMemo(() => {
    console.log(0)
    const web3Test = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545');
    const web3 = new Web3('https://bsc-dataseed1.binance.org/');
    const cakeFactoryContract = new web3.eth.Contract(
      cakeFactoryAbi,
      FACTORY_ADDRESS
    )
    const cakeFactoryContractTest = new web3Test.eth.Contract(
      cakeFactoryAbi, 
      FACTORY_ADDRESS_TEST
    )
    const cakeRouterContract = new web3.eth.Contract(
      cakeRouterAbi,
      ROUTER_ADDRESS
    )
    const cakeRouterContractTest = new web3.eth.Contract(
      cakeFactoryAbi,
      ROUTER_ADDRESS_TEST
    )
    return {web3, web3Test, cakeFactoryContract, cakeRouterContract, cakeFactoryContractTest, cakeRouterContractTest}
  }, [])

  useEffect(() => {
    console.log(1)
    getPairInfo(
      cakeFactoryContract,
      tokenAddress[firstToken],
      tokenAddress[secondToken]
    ).then((res) => {
      console.log("PairInfo: " + res)
      setPairAddress(res)
    }).catch(err => {
      console.log(err)
    })

    getPairInfo(
      cakeFactoryContractTest,
      tokenAddressTest[firstToken],
      tokenAddressTest[secondToken]
    ).then((res) => {
      console.log("PairInfoTest: " + res)
      setPairAddressTest(res)
    }).catch(err => {
      console.log(err)
    })

  }, [firstToken, secondToken])
  
  const {lpContract, lpContractTest} = useMemo(() => {
    const lpContract = new web3.eth.Contract(
      lpAbi,
      pairAddress
    )
    const lpContractTest = new web3.eth.Contract(
      lpAbi,
      pairAddressTest
    )
    return {lpContract, lpContractTest}
  }, [pairAddress])

  const changePrice = () => {
    setLoading(true)

    getTokenAddress(lpContract)
    .then((resAddress) => {
      let token0Address = resAddress
      getReserves(lpContract)
        .then((res) => {
          if(token0Address.toLowerCase() === tokenAddress[firstToken].toLowerCase()){
            console.log("Similar")
            setReserveFirstToken(BigNumber(res[0]))
            setReserveSecondToken(BigNumber(res[1]))
          }
          else{
            console.log("Different")
            setReserveSecondToken(BigNumber(res[0]))
            setReserveFirstToken(BigNumber(res[1]))
          }
        })
    })
    setLoading(false)
  }

  useEffect(() => {
    const iid = window.setInterval(async () => {
      changePrice();
      console.log("Refresh!")
    }, [60000]);

    return () => window.clearInterval(iid);
  }, []);

  useEffect(() => {
    console.log("Change price!")
    setLoading(true)

    getTokenAddress(lpContract)
    .then((resAddress) => {
      let token0Address = resAddress
      getReserves(lpContract)
        .then((res) => {
          if(token0Address.toLowerCase() === tokenAddress[firstToken].toLowerCase()){
            console.log("Similar")
            setReserveFirstToken(BigNumber(res[0]))
            setReserveSecondToken(BigNumber(res[1]))
          }
          else{
            console.log("Different")
            setReserveSecondToken(BigNumber(res[0]))
            setReserveFirstToken(BigNumber(res[1]))
          }
        })
    })
    setLoading(false)
  }, [lpContract, swap])

  const handleChangeFirstToken = (e) => {
    if(e.target.value !== secondToken) {
      setFirstToken(e.target.value)
    }
    else {
      setSecondToken(firstToken)
      setFirstToken(e.target.value)
      setSwap(!swap)
    }
  }

  const handleChangeSecondToken = (e) => {
    if(e.target.value !== firstToken) {
      setSecondToken(e.target.value)
    }
    else {
      setFirstToken(secondToken)
      setSecondToken(e.target.value)
      setSwap(!swap)
    }
  }

  const swapToken = (e) => {
    let tempToken = firstToken
    setFirstToken(secondToken)
    setSecondToken(tempToken)
    setSwap(!swap)
  }

  console.log(firstToken + " " + secondToken)

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
          <MenuItem value="CAKE">CAKE</MenuItem>
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
          <MenuItem value="CAKE">CAKE</MenuItem>
        </Select>
      </FormControl>
      </Box>
      <div className='flex-box'>
        <Box>
          <img className="tokenIcon" alt={firstToken} height="auto"
          src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + firstToken + '.png'}
          />
          <Typography variant="body2" sx={{marginTop: "10px"}}>{BigNumber(reserveFirstToken).dividedBy(BASE18).toFixed(4)}</Typography>
        </Box>  
        {loading ? <SwapHorizIcon sx={{fontSize: 50, margin: "auto 0"}} onClick={swapToken}/> : 
        <Typography variant="body1" sx={{margin: "auto 0", fontWeight: 600, textAlign: "center" }}>{BigNumber(reserveSecondToken).dividedBy(reserveFirstToken).toFixed(4)}</Typography>}
        <Box>
          <img className="tokenIcon" alt={secondToken} height="auto"
          src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + secondToken + '.png'}
          />
          <Typography variant="body2" sx={{marginTop: "10px"}}>{BigNumber(reserveSecondToken).dividedBy(BASE18).toFixed(4)}</Typography>
        </Box>
      </div>
      <Connect firstToken={firstToken} secondToken={secondToken} web3={web3Test} cakeRouterContract={cakeRouterContractTest} lpContract={lpContractTest}/>
      {/* <MakeTransaction firstToken={firstToken} secondToken={secondToken} web3={web3}/> */}
    </Box>
  );
}

export default App;
