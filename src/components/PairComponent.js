import React, {useState} from 'react'
import { Box, Button, Typography } from '@mui/material'
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { removePair, updatePair } from '../utils';
import NumberInput from './NumberInput';

const PairComponent = ({data, setReload, reload}) => {

  const [change, setChange] = useState(false)
  const [tokenAmount, setTokenAmount] = useState("0")
  const [condition, setCondition] = useState("0")

  const handleDelete = () => {
    removePair(data[0], data[1])
    setReload(!reload)
  }

  const handleClick = () => {
    updatePair(data[0], data[1], tokenAmount, condition)
    setChange(false)
    setReload(!reload)
  }

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: "space-around", border: "1px solid #C0C0C0", width: "95%", padding: "5px 0", margin: "20px auto 0 auto", alignItems: "center"}}>
        <Box>
          <img className="tokenIcon2" alt="BNB" height="40px"
            src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + data[0] + '.png'}
          />
          <img className="tokenIcon2" alt="BNB" height="40px"
            src={'https://storage.googleapis.com/token-c515a.appspot.com/tokens/' + data[1] + '.png'}
          />
        </Box>
        <Box>
          <Typography variant='body2' align="left"><strong>Amount: </strong> {data[2]}</Typography>
          <Typography variant='body2' align="left"><strong>Condition: </strong> {data[3]}</Typography>
        </Box>
        <Box sx={{display: "flex"}}>
          <UpdateIcon onClick={() => setChange(!change)} sx={{marginRight: "10px"}}/>
          <DeleteIcon onClick={handleDelete}/>
        </Box>
        
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