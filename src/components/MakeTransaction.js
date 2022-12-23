import React, {useState, useMemo, useEffect} from 'react';
import { privateKeyToAccount, addPair, decrypt } from '../utils';
import {tokenAddress} from "../constants/constants.js"
import { Button, Box, Table, TableBody, TableContainer, TableRow, TablePagination, Modal, Typography, Select, MenuItem } from '@mui/material';
import NumberInput from './NumberInput';
import PairComponent from './PairComponent.js'
import notification from '../utils/notification';
import { Sell } from '@mui/icons-material';

const bep20TokenAbi = require('../abi/bep20_token.json')

const MakeTransaction = ({firstToken, secondToken, web3Test, web3, cakeFactoryContract, password, cakeRouterContract, lpContract, cakeRouterContractTest}) => {
  const [tokenAmount, setTokenAmount] = useState("0")
  const [condition, setCondition] = useState("0")
  const [update, setUpdate] = useState(false)
  const [account, setAccount] = useState(null)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [reload, setReload] = useState(false)
  const [sell, setSell] = useState("sell")
  const [greaterOrLess, setGreaterOrLess] = useState("greater")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePage = ( newPage) => {
    setPage(newPage)
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  };

  const pairList = useMemo(() => {
    const pairList = JSON.parse(localStorage.getItem("sbt_pairs"))
    console.log("Reload pairs!" + pairList)
    return pairList
  }, [update, reload])

  useEffect(() => {
    const pk = decrypt(localStorage.getItem('sbt_privatekey'), password)
    privateKeyToAccount(web3Test, pk)
      .then(res => {
        setAccount(res)
      })
  }, [])

  // Re-render after 39s
  useEffect(() => {
    const iid = window.setInterval(async () => {
      setUpdate(!update)
      console.log("Refresh Pairs List!")
    }, [10000]);

    return () => window.clearInterval(iid);
  }, []);

  const handleClick = async () => {
    setLoading(true)
    await addPair(firstToken, secondToken, tokenAmount, condition, web3Test, bep20TokenAbi, cakeRouterContractTest, account, sell, greaterOrLess)
    setReload(!reload)
    setLoading(false)
    setOpen(false)
  }

  return (
    <Box>
      <Box sx={{display: "flex", justifyContent: "space-around", alignItems: "center"}}>
        <Box sx={{paddingTop: "30px"}}>
          <Select
            sx={{height: "40px"}}
            value={sell}
            label="Action"
            onChange={(e) => setSell(e.target.value)}
          >
            <MenuItem value="sell">Sell</MenuItem>
            <MenuItem value="buy">Buy</MenuItem>
          </Select>
        </Box>
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
        <Typography sx={{paddingTop: "30px"}} variant="body2" center> when price </Typography>
        <Box sx={{paddingTop: "30px"}}>
          <Select
            sx={{height: "40px"}}
            value={greaterOrLess}
            label="Action"
            onChange={(e) => setGreaterOrLess(e.target.value)}
          >
            <MenuItem value="greater">{">="}</MenuItem>
            <MenuItem value="less">{"<="}</MenuItem>
          </Select>
        </Box>
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
        {/* <Box sx={{display: "flex", alignItems: "center", paddingTop: "25px"}}>
          <Checkbox checked={checked} onChange={(e) => setChecked(!checked)}></Checkbox>
          <Typography variant="body2">Buy?</Typography>
        </Box> */}
        {/* <Box sx={{display: "flex", alignItems: "center", paddingTop: "25px"}}>
          <Select
            sx={{height: "50px"}}
            value={sell}
            label="Action"
            onChange={(e) => setSell(e.target.value)}
          >
            <MenuItem value="sell">Sell</MenuItem>
            <MenuItem value="buy">Buy</MenuItem>
          </Select>
          <Select 
            sx={{height: "50px"}}
            value={ceil}
            label="Action"
            onChange={(e) => setCeil(e.target.value)}
          >
            <MenuItem value="ceil">Ceil</MenuItem>
            <MenuItem value="floor">Floor</MenuItem>
          </Select>
        </Box> */}
        
      </Box>
      <Button sx={{marginTop: "20px"}} variant="contained" onClick={() => setOpen(true)}>Add {firstToken} ~ {secondToken}</Button> 
      {/* <Button onClick={() => setOpen(true)}>Open modal</Button> */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{height: "120px", width: "500px", background: "white", margin: "0 auto", marginTop: "200px", padding: "20px", boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)"}}>
            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{fontWeight: 600}}>
              Add {firstToken} ~ {secondToken} confirmation
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              {sell === "sell" ? "Sell" : "Buy"} {tokenAmount} {firstToken} when the price of {firstToken} {greaterOrLess ? ">=" : "<="} {condition}$
            </Typography>
            <Box sx={{display: "flex", justifyContent: "center", marginTop: "15px"}}>
              {loading ? <Typography variant="body2"> Please wait ....</Typography> : <Button variant="contained" onClick={handleClick}>Confirm</Button>}
            </Box>
          </Box>
        </Modal>
      {pairList && account ? <Box>
        <TableContainer>
          <Table sx={{width: "100%"}}>
            <TableBody>
              {pairList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pair) => (
                <TableRow>
                  <PairComponent data={pair} setReload={setReload} reload={reload} web3={web3} web3Test={web3Test} cakeFactoryContract={cakeFactoryContract} account={account} cakeRouterContractTest={cakeRouterContractTest}/>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {pairList.length > 0 ? <TablePagination
            rowsPerPageOptions={[1, 2]}
            component="div"
            count={pairList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          /> : ""}
        </TableContainer>
      </Box> : ""}
      {/* <Button onClick={handleShowAllowance}>Check</Button>  */}
      {/* <CustomAlert message="Hi" status="success"/> */}
      {/* <div>{account}</div> */}
    </Box> 
  )
}

export default MakeTransaction