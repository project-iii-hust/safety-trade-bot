import React, {useState} from 'react'
import { Button, TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { sha224, sha256 } from 'js-sha256'

const Connect = () => {
  const [connect, setConnect] = useState(false)
  const [step, setStep] = useState(0)
  const [password, setPassword] = useState("")
  const [privateKey, setPrivateKey] = useState("")

  const handleClickConnect = () => {
    let sbt_key = localStorage.getItem("sbt_key")
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

  const handleSubmitInfo = (e) => {
    const hashedPassword = sha256(password)
    localStorage.setItem("sbt_key", hashedPassword)
    setStep(3)
  }

  const handleSubmit = (e) => {
    const hashedPassword = sha256(password)
    let sbt_key = localStorage.getItem("sbt_key")
    if (sbt_key === hashedPassword) {
      setStep(3)
    }
  }
  console.log(localStorage.getItem('stb_key'))
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
      </Box> : ""}
    </Box>
  )
}

export default Connect