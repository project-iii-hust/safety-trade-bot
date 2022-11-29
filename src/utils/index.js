import BigNumber from "bignumber.js";
import { tokenAddress } from "../constants/constants";

const bep20TokenAbi = require('../abi/bep20_token.json')

export async function getPairInfo(contract, tokenA, tokenB) {
  return await contract.methods.getPair(tokenA, tokenB).call();
}

export async function getReserves(contract) {
  return await contract.methods.getReserves().call();
}

export function getTokenAddress(contract) {
  return contract.methods.token0().call();
}

export async function sendSignedTxAndGetResult(account, contract, spendAmount, contractMethod, gasMultiplier, web3) {
  const encodedAbi = contractMethod.encodeABI();

  let currentGasPrice = await web3.eth.getGasPrice();
  let proposedGasPrice = BigNumber(currentGasPrice).multipliedBy(BigNumber(gasMultiplier));

  console.log(`Currrent gas price: ${currentGasPrice}, and proposed price: ${proposedGasPrice}`)

  let tx = {
    from: account.address,
    to: contract._address,
    gas: 1000000,
    gasPrice: proposedGasPrice.toString(),
    data: encodedAbi,
    value: spendAmount
  } 

  let signedTxn = await account.signTransaction(tx);

  let response = await web3.eth.sendSignedTransaction(signedTxn.rawTransaction)
    .on('transactionHash', function(hash) {
      console.log(`New transaction ${hash} submitted`)
    });

  if(response.status) {
    console.log(`Transaction ${response.transactionHash}`);
  } else {
    console.log(`Transaction ${response.transactionHash} FAILED`);
  }

  return response.status;
}

export async function privateKeyToAccount(web3, privateKey) {
  return await web3.eth.accounts.privateKeyToAccount(privateKey);
}

export function encrypt(text, key) {
  let charText = text.split('')
  let charTextCode = charText.map(c => c.charCodeAt(0) - 48)
  let charKey = key.split('')
  let charKeyCode = charKey.map(c => c.charCodeAt(0) - 48)
  let keyLength = charKeyCode.length 
  let textLength = charTextCode.length
  for(let i = 0; i < textLength; ++i) {
    let curCode = charTextCode[i]
    curCode += charKeyCode[i % keyLength]
    curCode %= 78
    curCode += 48
    charTextCode[i] = curCode
  }
  let charTextNew = charTextCode.map(c => String.fromCharCode(c))
  return charTextNew.join("")
}

export async function addPair(spendToken, receiveToken, allowance, condition, web3, bep20TokenAbi, cakeRouterContract, account) {
  const tokenContract = await new web3.eth.Contract(
    bep20TokenAbi,
    tokenAddress[spendToken]
  )

  const approveFunction = tokenContract.methods.approve(cakeRouterContract._address, BigNumber(allowance).multipliedBy("1000000000000000000"))
  await sendSignedTxAndGetResult(account, tokenContract, 0, approveFunction, 10.0, web3)
    .then(res => {
      console.log("Successful approve " + allowance + " " + spendToken + "!")
    })

  let sbt_pairs = JSON.parse(localStorage.getItem("sbt_pairs"))
  if(sbt_pairs == null) { 
    localStorage.setItem("sbt_pairs", JSON.stringify([[spendToken, receiveToken, allowance, condition]]))
    console.log("Set local storage!")
  }
  else{
    const findPair = sbt_pairs.find(pair => pair[0] === spendToken && pair[1] === receiveToken)
    if(findPair == null) {
      sbt_pairs.push([spendToken, receiveToken, allowance, condition])
      localStorage.setItem("sbt_pairs", JSON.stringify(sbt_pairs))
    }
    else {
      let new_allowance = BigNumber(findPair[2]).isGreaterThan(allowance) ? findPair[2] : allowance
      sbt_pairs.map(pair => {
        if(pair[0] === spendToken && pair[1] === receiveToken) {
          pair[2] = new_allowance
          pair[3] = condition
        }
        return pair
      })
      localStorage.setItem("sbt_pairs", JSON.stringify(sbt_pairs))
    }
  }
}

export function decrypt(text, key) {
  let charText = text.split('')
  let charTextCode = charText.map(c => c.charCodeAt(0) - 48)
  let charKey = key.split('')
  let charKeyCode = charKey.map(c => c.charCodeAt(0) - 48)
  let keyLength = charKeyCode.length 
  let textLength = charTextCode.length
  for(let i = 0; i < textLength; ++i) {
    let curCode = charTextCode[i]
    curCode -= charKeyCode[i % keyLength]
    if(curCode < 0) {
      curCode += 78
    }
    curCode %= 78
    curCode += 48
    charTextCode[i] = curCode
  }
  let charTextNew = charTextCode.map(c => String.fromCharCode(c))
  return charTextNew.join("")
}