import React, {useState} from 'react'
import { Button, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { sha224, sha256 } from 'js-sha256'
import { encrypt, decrypt } from '../utils'
import MakeTransaction from './MakeTransaction'

const Connect = ({firstToken, secondToken, web3, cakeRouterContract, lpContract}) => {
  const [connect, setConnect] = useState(false)
  const [step, setStep] = useState(0)
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [exportKey, setExportKey] = useState(false)

  const handleClickConnect = () => {
    let sbt_key = localStorage.getItem("sbt_password")
    if(sbt_key == null) { 
      setStep(1)
    }
    else {
      setStep(2)
    }
  }

  const handleChangePassword = (e) => {
    setPassword(e.target.value)
  } 

  const handleChangePrivateKey = (e) => {
    setPrivateKey(e.target.value)
  }

  const handleSubmitInfo = () => {
    const hashedPassword = sha256(password)
    localStorage.setItem("sbt_password", hashedPassword)
    const hashedPrivateKey = encrypt(privateKey, password)
    localStorage.setItem("sbt_privatekey", hashedPrivateKey)
    setStep(3)
  }

  const handleSubmit = (e) => {
    const hashedPassword = sha256(password)
    let sbt_key = localStorage.getItem("sbt_password")
    if (sbt_key === hashedPassword) {
      setStep(3)
    }
  }

  const handleExportPrivateKey = () => {
    setExportKey(true)
  }

  return (
    <Box>
      {step == 0 ? <Button variant="contained" sx={{width: "60%", marginTop: "50px"}} onClick={handleClickConnect}>Connect</Button> : ""}
      {step == 1 ? <Box>
        <TextField sx={{marginTop: "20px"}} label="Your password" variant="standard" value={password} onChange={handleChangePassword}/>
        <TextField sx={{marginTop: "20px"}} label="Private key" variant="standard" value={privateKey} onChange={handleChangePrivateKey}/>
        <Button sx={{display: "block", margin: "20px auto", width: "60%"}}variant="contained" onClick={handleSubmitInfo}>Submit</Button>
      </Box> : ""}
      {step == 2 ? <Box>
        <TextField sx={{marginTop: "20px"}} label="Your password" variant="standard" value={password} onChange={handleChangePassword}/>
        <Button sx={{display: "block", margin: "20px auto", width: "60%"}}variant="contained" onClick={handleSubmit}>Submit</Button>
      </Box> : ""}
      {step == 3 ? <Box>
        <Typography sx={{marginTop: "20px"}}  variant="body2"> Welcome!</Typography>
        <Button sx={{display: "block", margin: "20px auto", width: "60%"}}variant="contained" onClick={handleExportPrivateKey}>Export Private Key</Button>
        <MakeTransaction firstToken={firstToken} secondToken={secondToken} web3={web3} password={password} cakeRouterContract={cakeRouterContract} lpContract={lpContract}/>
      </Box> : ""}
      {step == 3 && exportKey ? <Box>
        <Typography variant="body2"> Private key: {decrypt(localStorage.getItem('sbt_privatekey'), password)}</Typography>
      </Box> : ""}
    </Box>
  )
}

export default Connect