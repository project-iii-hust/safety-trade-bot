import BigNumber from "bignumber.js";

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