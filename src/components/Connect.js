/*global chrome*/
import React, {useState} from 'react'
import { Button, TextField } from '@mui/material'
import { Box } from '@mui/system'
import { sha256 } from 'js-sha256'
import { encrypt } from '../utils'
import MakeTransaction from './MakeTransaction'
import { sendTelegramMessage } from '../telegram_bot'

const Connect = ({firstToken, secondToken, web3Test, web3, cakeFactoryContract, cakeRouterContract, lpContract, cakeRouterContractTest}) => {
  const [step, setStep] = useState(0)
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [telegramId, setTelegramId] = useState("")

  const handleClickConnect = () => {
    let sbt_key = localStorage.getItem("sbt_password")
    if(sbt_key == null) { 
      setStep(1)
    }
    else {
      setStep(2)
      sendTelegramMessage()
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
    localStorage.setItem("sbt_telegram_id", telegramId)
    setStep(3)
  }

  const handleSubmit = (e) => {
    const hashedPassword = sha256(password)
    let sbt_key = localStorage.getItem("sbt_password")
    if (sbt_key === hashedPassword) {
      setStep(3)
    }
  }

  const handleChangeTelegramId = (e) => {
    setTelegramId(e.target.value)
  }

  return (
    <Box>
      {step == 0 ? <Button variant="contained" sx={{width: "60%", marginTop: "50px"}} onClick={handleClickConnect}>Connect</Button> : ""}
      {step == 1 ? <Box>
        <TextField sx={{marginTop: "20px"}} label="Your password" variant="standard" value={password} onChange={handleChangePassword}/>
        <TextField sx={{marginTop: "20px"}} label="Private key" variant="standard" value={privateKey} onChange={handleChangePrivateKey}/>
        <TextField sx={{marginTop: "20px"}} label="Telegram Id" variant="standard" value={telegramId} onChange={handleChangeTelegramId}/>
        <Button sx={{display: "block", margin: "20px auto", width: "60%"}}variant="contained" onClick={handleSubmitInfo}>Submit</Button>
      </Box> : ""}
      {step == 2 ? <Box>
        <TextField sx={{marginTop: "20px"}} label="Your password" variant="standard" value={password} onChange={handleChangePassword}/>
        <Button sx={{display: "block", margin: "20px auto", width: "60%"}}variant="contained" onClick={handleSubmit}>Submit</Button>
      </Box> : ""}
      {step == 3 ? <Box>
        <MakeTransaction firstToken={firstToken} secondToken={secondToken} web3Test={web3Test} web3={web3} cakeFactoryContract={cakeFactoryContract} password={password} cakeRouterContract={cakeRouterContract} lpContract={lpContract} cakeRouterContractTest={cakeRouterContractTest}/>
      </Box> : ""}
    </Box>
  )
}

export default Connect