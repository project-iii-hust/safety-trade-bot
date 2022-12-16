/*global chrome*/
import BigNumber from "bignumber.js";
import { tokenAddress, tokenAddressTest } from "../constants/constants";
import notification from "./notification";
import { sendTelegramMessage } from "../telegram_bot";

const lpAbi = require('../abi/lp_abi.json')
const telegramId = localStorage.getItem("sbt_telegram_id")

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
  console.log(account)
  const encodedAbi = contractMethod.encodeABI();

  let currentGasPrice = await web3.eth.getGasPrice();
  let proposedGasPrice = BigNumber(currentGasPrice).multipliedBy(BigNumber(gasMultiplier));

  console.log(`Currrent gas price: ${currentGasPrice}, and proposed price: ${proposedGasPrice}`)

  let tx = {
    from: account['address'],
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

export async function addPair(spendToken, receiveToken, allowance, condition, web3, bep20TokenAbi, cakeRouterContract, account, sell) {
  try{ 
    const tokenContract = await new web3.eth.Contract(
      bep20TokenAbi,
      tokenAddressTest[spendToken]
    )

    const approveFunction = tokenContract.methods.approve(cakeRouterContract._address, BigNumber(allowance).multipliedBy("1000000000000000000").toFixed())
    await sendSignedTxAndGetResult(account, tokenContract, 0, approveFunction, 10.0, web3)
      .then(res => {
        let sellStatus = sell ? "Sell" : "Buy"
        notification("Pairs", "Successful add pair: " + spendToken + " - " + receiveToken + "\nAmount: " + allowance + "\nCondition: " + condition + "\nSell status: " + sellStatus)
        sendTelegramMessage(telegramId, "Successful add pair: " + spendToken + " - " + receiveToken + "\nAmount: " + allowance + "\nCondition: " + condition + "\nSell status: " + sellStatus)
        console.log("Successful approve " + allowance + " " + spendToken + "!")
      })

    let sbt_pairs = JSON.parse(localStorage.getItem("sbt_pairs"))
    let status = ""
    if(sbt_pairs == null) { 
      localStorage.setItem("sbt_pairs", JSON.stringify([[spendToken, receiveToken, allowance, condition, status, sell]]))
      chrome.storage.local.set({"sbt_pairs": JSON.stringify([[spendToken, receiveToken, allowance, condition]])}, () => {})
      console.log("Set local storage!")
    }
    else{
      const findPair = sbt_pairs.find(pair => pair[0] === spendToken && pair[1] === receiveToken && pair[5] === sell)
      if(findPair == null) {
        sbt_pairs.push([spendToken, receiveToken, allowance, condition, status, sell])
        localStorage.setItem("sbt_pairs", JSON.stringify(sbt_pairs))
        chrome.storage.local.set({"sbt_pairs": JSON.stringify(sbt_pairs)}, () => {})
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
        chrome.storage.local.set({"sbt_pairs": JSON.stringify(sbt_pairs)}, () => {})
      }
    }
  }
  catch(ex) {
    notification("Pairs", "There is an error when adding pairs!")
  }
}

export function removePair(spendToken, receiveToken, sell) {
  try {
    let sbt_pairs = JSON.parse(localStorage.getItem("sbt_pairs"))
    sbt_pairs = sbt_pairs.filter((pair) => pair[0] !== spendToken || pair[1] !== receiveToken || pair[5] !== sell)
    localStorage.setItem("sbt_pairs", JSON.stringify(sbt_pairs))
    let sellStatus = sell ? "Sell" : "Buy"
    notification("Pairs", "Succesfully delete pair: " + spendToken + " - " + receiveToken + " " + sellStatus)
    sendTelegramMessage(telegramId, "Succesfully delete pair: " + spendToken + " - " + receiveToken + " " + sellStatus)
    console.log("Remove pair " + spendToken + " ~ " + receiveToken + " !")
  } catch(ex) {
    notification("Pairs", "There is an error when deleting pairs!")
    console.log(ex)
  }
}

export function updatePair(spendToken, receiveToken, allowance, condition, status, sell) {
  try {
    let sbt_pairs = JSON.parse(localStorage.getItem("sbt_pairs"))
    sbt_pairs.map(pair => {
      if(pair[0] === spendToken && pair[1] === receiveToken && pair[5] === sell) {
        pair[2] = allowance
        pair[3] = condition
        pair[4] = status
      }
      return pair
    })
    localStorage.setItem("sbt_pairs", JSON.stringify(sbt_pairs))
    notification("Pairs", "Successful update pair: " + spendToken + " - " + receiveToken + "\nAmount: " + allowance + "\nCondition: " + condition)
    sendTelegramMessage(telegramId, "Successful update pair: " + spendToken + " - " + receiveToken + "\nAmount: " + allowance + "\nCondition: " + condition)
    console.log("Update pair " + spendToken + " ~ " + receiveToken + " !")
  } catch(ex) {
    notification("Pairs", "There is an error when updating pairs!")
    console.log(ex)
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

export async function getPrice (web3, pairAddress) {
  try {
    const lpContract = await new web3.eth.Contract(
      lpAbi,
      pairAddress
    )

    const resAddress = await getTokenAddress(lpContract)

    console.log("Res Address: " +   resAddress)
    
    return getReserves(lpContract)
    .then(res => {
      if(resAddress.toLowerCase() === tokenAddress["USDT"].toLowerCase()){
        return BigNumber(res[0]).dividedBy(res[1]).toFixed(4)
      }
      else{
        return BigNumber(res[1]).dividedBy(res[0]).toFixed(4)
      }
    })
  } catch (err) {
    console.log(err)
  }
  
} 


export async function getPriceWithUSDT (web3, cakeFactoryContract, token) {
  try {
    const pairAddress = await getPairInfo(
      cakeFactoryContract,
      tokenAddress[token],
      tokenAddress['USDT']
    )
    
    const lpContract = await new web3.eth.Contract(
      lpAbi,
      pairAddress
    )

    const resAddress = await getTokenAddress(lpContract)

    console.log("Res Address: " +   resAddress)
    
    return getReserves(lpContract)
    .then(res => {
      if(resAddress.toLowerCase() === tokenAddress["USDT"].toLowerCase()){
        return BigNumber(res[0]).dividedBy(res[1]).toFixed(4)
      }
      else{
        return BigNumber(res[1]).dividedBy(res[0]).toFixed(4)
      }
    })
  } catch (err) {
    console.log(err)
  }
  
} 

export const passwordTransform = (password) => {
  const passwordLength = password.length
  let transformedPassword = ""
  for (let i = 0; i < passwordLength; ++ i) {
    transformedPassword = transformedPassword + "*"
  }
  return transformedPassword
}

// export function swapFunctionTest(spendToken, receiveToken, amount)