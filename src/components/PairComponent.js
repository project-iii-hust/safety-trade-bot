import React, {useState, useEffect, useRef} from 'react'
import { Box, Button, Typography, Modal } from '@mui/material'
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { removePair, updatePair, getPriceWithUSDT, sendSignedTxAndGetResult } from '../utils';
import NumberInput from './NumberInput';
import { tokenAddressTest } from '../constants/constants';
import BigNumber from 'bignumber.js';
// import notification from '../utils/notification';
import { sendTelegramMessage } from '../telegram_bot';
import LoopIcon from '@mui/icons-material/Loop';

const PairComponent = ({data, setReload, reload, web3, cakeFactoryContract, account, cakeRouterContractTest, web3Test}) => {

  const [change, setChange] = useState(false)
  const [tokenAmount, setTokenAmount] = useState("")
  const [condition, setCondition] = useState("")
  const [tokenPrice, setTokenPrice] = useState(0)
  const [finished, setFininished] = useState(false)
  const [loading, setLoading] = useState(false)
  const pairRef = useRef()

  useEffect(() => {
    pairRef.current = window.setInterval(async () => {
      checkPrice()
    }, [10000]);

    return () => window.clearInterval(pairRef.current);
  }, []);

  const checkPrice = () => {
    getPriceWithUSDT(web3, cakeFactoryContract, data[0])
      .then(resPrice => {
        setTokenPrice(resPrice)
        console.log("Status: " + data[4])
        console.log("Price of " + data[0] + ": " + resPrice)
        if(data[4] !== "Finished") {
          if(data[6] === "greater"){
            if(BigNumber(resPrice).isGreaterThanOrEqualTo(data[3])) {
              console.log("Here")
              let done = handleSwap()
              if(done) {
                window.clearInterval(pairRef.current)
              } 
            }
          }
          else {
            if(BigNumber(resPrice).isLessThanOrEqualTo(data[3])) {
              handleSwap()
              let done = handleSwap()
              if(done) {
                window.clearInterval(pairRef.current)
              }
            }
          }
        }
      })
  }

  const handleDelete = () => {
    removePair(data[0], data[1], data[5], data[6])
    setReload(!reload)
  }

  const handleClick = () => {
    const newAmount = tokenAmount !== "" ? tokenAmount : data[2]
    const newCondition = condition !== "" ? condition : data[3]
    updatePair(data[0], data[1], newAmount, newCondition, "", data[5], data[6])
    setChange(false)
    setReload(!reload)
  }

  const handleSwap = async () => {
    setLoading(true)
    const spendToken = tokenAddressTest[data[0]]
    const receiveToken = tokenAddressTest[data[1]] 
    console.log([spendToken, receiveToken])
    const deadline = web3.utils.toHex(99999999999999999) 
    // console.log(, 0, [spendToken, receiveToken], account['address'], deadline)
    const swapFunction = data[5] === "sell" ? cakeRouterContractTest.methods.swapExactTokensForTokens(BigNumber(data[2]).multipliedBy("1000000000000000000").toFixed(), 0, [spendToken, receiveToken], account['address'], deadline) : cakeRouterContractTest.methods.swapTokensForExactTokens(BigNumber(data[2]).multipliedBy("1000000000000000000").toFixed(), BigNumber(100000000).multipliedBy("1000000000000000000").toFixed(), [receiveToken, spendToken], account['address'], deadline)
    
    const done = res => {
      updatePair(data[0], data[1], 0, 0, "Finished", data[5], data[6])
      setReload(!reload)
      const telegramId = localStorage.getItem("sbt_telegram_id")
      if(data[5] === "sell") {
        sendTelegramMessage(telegramId, "Successful swap: " + data[0] + " -> " + data[1] + " with " + data[2] + " " + data[0] + "\nView transaction here: https://testnet.bscscan.com/tx/" + res[1])
      } else {
        sendTelegramMessage(telegramId, "Successful swap: " + data[1] + " -> " + data[0] + " for " + data[2] + " " + data[0] + "\nView transaction here: https://testnet.bscscan.com/tx/" + res[1])
      }
      setFininished(true)
      return true
    };

    // swapFunction.send(account).then(done);

    let status = await sendSignedTxAndGetResult(account, cakeRouterContractTest, 0, swapFunction, 10.0, web3Test).then(done)
      .catch(err => {
        const telegramId = localStorage.getItem("sbt_telegram_id")
        if(data[5] === "sell") {
          sendTelegramMessage(telegramId, "Transaction swap fail: " + data[0] + " -> " + data[1] + " with " + data[2] + " " + data[0])
        } else {
          sendTelegramMessage(telegramId, "Transaction swap fail: " + data[1] + " -> " + data[0] + " for " + data[2] + " " + data[0])
        }
        return false
      })
    setLoading(false)
    return status
  }
  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: "space-around", border: "1px solid #C0C0C0", width: "95%", padding: "5px 0", margin: "20px auto 0 auto", alignItems: "center"}}>
        <Box sx={{display: "flex", alignItems: "center"}}>
          <img className="tokenIcon2" alt="BNB" height="40px"
            src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + data[0] + '.png'}
          />
          <img className="tokenIcon2" alt="BNB" height="40px"
            src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + data[1] + '.png'}
          />
          <Box sx={{display: "flex", flexDirection: "column-reverse"}}>
            <Box sx={{display: "flex"}}>
              <Box sx={{padding: "5px", backgroundColor: data[5] === 'sell' ? "red" : 'green', fontSize: "15px", color: "white", borderRadius: "4px", margin: "0 auto"}}>{data[5] === "sell" ? "Sell" : "Buy"} </Box>
              {/* <Box sx={{marginLeft: "10px", padding: "5px", backgroundColor: "green", fontSize: "15px", color: "white", borderRadius: "4px"}}>{data[6]} </Box> */}
            </Box>
            <Typography variant='body2'>{tokenPrice}</Typography>
          </Box>
        </Box>
        <Box sx={{float: "left"}}>
          <Typography variant='body2' align="left"><strong>Amount: </strong> {data[2]}</Typography>
          <Typography variant='body2' align="left"><strong>Condition: {data[6] === "greater" ? ">=" : "<="} </strong> {data[3]}</Typography>
        </Box>
        {loading ? <Box sx={{display: "flex", justifyContent: "center"}}> ... <LoopIcon></LoopIcon> ... </Box> : ""}
        {data[4] == "Finished" ? <Box sx={{display: "flex", alignItems: "center"}}> <Box sx={{color: "red"}}>Finished</Box> <DeleteIcon onClick={handleDelete}/> </Box> : ""}
        {!loading && data[4] !== "Finished" ? <Box sx={{display: "flex"}}>
          <UpdateIcon onClick={() => setChange(!change)} sx={{marginRight: "10px"}}/>
          <DeleteIcon onClick={handleDelete}/>
        </Box> : ""}
        {/* <Button sx={{marginTop: "20px"}} variant="contained" onClick={handleTest}>Test</Button> */}
      </Box>
      {change ? <Box>
        <Box sx={{display: "flex", justifyContent: "space-around"}}>
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
        </Box>
        <Button sx={{marginTop: "20px"}} variant="contained" onClick={handleClick}>Change</Button>
        </Box> : ""}
    </Box>
  )
}

export default PairComponent