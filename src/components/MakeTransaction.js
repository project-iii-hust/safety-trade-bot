import React, {useState, useMemo, useEffect} from 'react';
import { privateKeyToAccount, addPair, decrypt } from '../utils';
import {tokenAddress} from "../constants/constants.js"
import { Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import NumberInput from './NumberInput';
import BigNumber from 'bignumber.js';
import PairComponent from './PairComponent.js'

const bep20TokenAbi = require('../abi/bep20_token.json')

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const MakeTransaction = ({firstToken, secondToken, web3, password, cakeRouterContract, lpContract}) => {
  const [tokenAmount, setTokenAmount] = useState("0")
  const [condition, setCondition] = useState("0")
  const [update, setUpdate] = useState(false)
  const [account, setAccount] = useState(null)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [reload, setReload] = useState(false)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  };

  const tokenContract = useMemo(() => {
    const tokenContract = new web3.eth.Contract(
      bep20TokenAbi,
      tokenAddress[firstToken]
    )
    return tokenContract
  }, [firstToken])

  const pairList = useMemo(() => {
    const pairList = JSON.parse(localStorage.getItem("sbt_pairs"))
    console.log("Reload pairs!" + pairList)
    return pairList
  }, [update, reload])

  useEffect(() => {
    const pk = decrypt(localStorage.getItem('sbt_privatekey'), password)
    privateKeyToAccount(web3, pk)
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
    await addPair(firstToken, secondToken, tokenAmount, condition, web3, bep20TokenAbi, cakeRouterContract, account)
    setReload(!reload)
  }

  // const handleShowAllowance = () => {
  //   tokenContract.methods.allowance(account.address, cakeRouterContract._address).call()
  //     .then((res) => {
  //       console.log("Allowance: " + BigNumber(res).dividedBy("1000000000000000000").toFixed(4))
  //     })
  // }

  return (
    <Box>
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
      <Button sx={{marginTop: "20px"}} variant="contained" onClick={handleClick}>Add {firstToken} ~ {secondToken}</Button> 
      {pairList ? <Box>
        <TableContainer>
          <Table sx={{width: "100%"}}>
            <TableBody>
              {pairList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((pair) => (
                <TableRow>
                  <PairComponent data={pair} setReload={setReload} reload={reload}/>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[1, 2]}
            component="div"
            count={pairList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box> : ""}
      {/* <Button onClick={handleShowAllowance}>Check</Button>  */}
      {/* <CustomAlert message="Hi" status="success"/> */}
      {/* <div>{account}</div> */}
    </Box> 
  )
}

export default MakeTransaction