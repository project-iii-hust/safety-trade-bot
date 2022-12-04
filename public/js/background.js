import Web3 from 'web3';
import {tokenAddress} from "../../src/constants"
import {getPairInfo, getReserves, getTokenAddress} from "../../src/utils/index.js"
import BigNumber from 'bignumber.js';

const web3 = new Web3('https://bsc-dataseed1.binance.org/');
const cakeFactoryAbi = require('../../src/abi/pcs_factory.json')
const lpAbi = require('../../src/abi/lp_abi.json')

chrome.alarms.create("5min", {
  delayInMinutes: 0,
  periodInMinutes: 1
});

chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.local.get(["sbt_pairs"])
  .then((result) => {
    let sbt_pairs = JSON.parse(result.sbt_pairs)
    let message = ""
    for (let pair of sbt_pairs){
      message = message + pair[0] + " " + pair[1] + " : " + getPrice(pair[0]) + ".\n"
    }
    chrome.notifications.create(
      "1", {
      iconUrl: chrome.runtime.getURL("icons/128.png"),
      title: "This should be a notification",
      type: "basic",
      message: message,
      isClickable: true,
      priority: 2,
    },
        function () { }
    );
  });
});

const getPrice = async (token) => {
  let tokenPrice = "0"
  const cakeFactoryContract = new web3.eth.Contract(
    cakeFactoryAbi,
    FACTORY_ADDRESS
  )

  const pairAddress = await getPairInfo(
    cakeFactoryContract,
    tokenAddress[token],
    tokenAddress[USDT]
  )

  const lpContract = new web3.eth.Contract(
    lpAbi,
    pairAddress
  )

  const resAddress = await getTokenAddress(lpContract)
   
  const res = await getReserves(lpContract)

  if(resAddress.toLowerCase() === tokenAddress["USDT"].toLowerCase()){
    tokenPrice = BigNumber(res[0]).dividedBy(res[1]).toFixed(4)
  }
  else{
    tokenPrice = BigNumber(res[1]).dividedBy(res[0]).toFixed(4)
  }

  return tokenPrice
} 