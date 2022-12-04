import React from 'react'
import { Box } from '@mui/system'
import Logo from '../images/logo192.png'

const Header = () => {
  return (
    <Box>
      <img className='header-logo' src={Logo}/>
    </Box>
  )
}

export default Header