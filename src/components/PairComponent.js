import React, {useState, useEffect} from 'react'
import { Box, Button, Typography } from '@mui/material'
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { removePair, updatePair } from '../utils';
import NumberInput from './NumberInput';
import { getPriceWithUSDT, sendSignedTxAndGetResult } from '../utils';
import { tokenAddressTest } from '../constants/constants';
import BigNumber from 'bignumber.js';

const PairComponent = ({data, setReload, reload, web3, cakeFactoryContract, account, cakeRouterContractTest, web3Test}) => {

  const [change, setChange] = useState(false)
  const [tokenAmount, setTokenAmount] = useState("0")
  const [condition, setCondition] = useState("0")

  useEffect(() => {
    const iid = window.setInterval(async () => {
      checkPrice()
    }, [10000]);

    return () => window.clearInterval(iid);
  }, []);

  const checkPrice = () => {
    getPriceWithUSDT(web3, cakeFactoryContract, data[0])
      .then(resPrice => {
        console.log("Price of " + data[0] + ": " + resPrice)
        if(BigNumber(resPrice).isLessThanOrEqualTo(data[4])) {
          handleSwap()
        }
      })
  }

  const handleDelete = () => {
    removePair(data[0], data[1])
    setReload(!reload)
  }

  const handleClick = () => {
    updatePair(data[0], data[1], tokenAmount, condition, "")
    setChange(false)
    setReload(!reload)
  }

  const handleSwap = () => {
    const spendToken = data[5] ? tokenAddressTest[data[0]] : tokenAddressTest[[data[1]]]
    const receiveToken = data[5] ? tokenAddressTest[data[1]] : tokenAddressTest[[data[0]]]
    console.log([spendToken, receiveToken])
    const deadline = web3.utils.toHex(99999999999999999) 
    // console.log(, 0, [spendToken, receiveToken], account['address'], deadline)
    const swapFunction = cakeRouterContractTest.methods.swapExactTokensForTokens(BigNumber(data[2]).multipliedBy("1000000000000000000"), 0, [spendToken, receiveToken], account['address'], deadline)
    
    const done = res => {
      console.log(res)
      updatePair(data[0], data[1], tokenAmount, condition, "Finished")
      setReload(!reload)
    };

    // swapFunction.send(account).then(done);

    sendSignedTxAndGetResult(account, cakeRouterContractTest, 0, swapFunction, 10.0, web3Test).then(done)
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
          {data[5] ? <Box sx={{padding: "5px", backgroundColor: "red", fontSize: "15px", color: "white", borderRadius: "4px"}}> Sell </Box> : <Box sx={{padding: "5px", backgroundColor: "green", fontSize: "15px", color: "white", borderRadius: "4px"}}> Buy </Box>}
        </Box>
        <Box>
          <Typography variant='body2' align="left"><strong>Amount: </strong> {data[2]}</Typography>
          <Typography variant='body2' align="left"><strong>Condition: </strong> {data[3]}</Typography>
        </Box>
        
        {data[4] == "Finished"? <Box sx={{color: "red"}}>Finished</Box> : <Box sx={{display: "flex"}}>
          <UpdateIcon onClick={() => setChange(!change)} sx={{marginRight: "10px"}}/>
          <DeleteIcon onClick={handleDelete}/>
        </Box>}
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