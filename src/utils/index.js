export async function getPairInfo(contract, tokenA, tokenB) {
  return await contract.methods.getPair(tokenA, tokenB).call();
}

export async function getReserves(contract) {
  return await contract.methods.getReserves().call();
}

export async function getTokenAddress(contract) {
  return await contract.methods.token0().call();
}

export function encrypt(text, key) {
  let charText = text.split('')
  let charTextCode = charText.map(c => c.charCodeAt(0) - 65)
  let charKey = key.split('')
  let charKeyCode = charKey.map(c => c.charCodeAt(0) - 65)
  let keyLength = charKeyCode.length 
  let textLength = charTextCode.length
  for(let i = 0; i < textLength; ++i) {
    let curCode = charTextCode[i]
    curCode += charKeyCode[i % keyLength]
    curCode %= 57
    curCode += 65
    charTextCode[i] = curCode
  }
  let charTextNew = charTextCode.map(c => String.fromCharCode(c))
  return charTextNew.join("")
}

export function decrypt(text, key) {
  let charText = text.split('')
  let charTextCode = charText.map(c => c.charCodeAt(0) - 65)
  let charKey = key.split('')
  let charKeyCode = charKey.map(c => c.charCodeAt(0) - 65)
  let keyLength = charKeyCode.length 
  let textLength = charTextCode.length
  for(let i = 0; i < textLength; ++i) {
    let curCode = charTextCode[i]
    curCode -= charKeyCode[i % keyLength]
    if(curCode < 0) {
      curCode += 57
    }
    curCode %= 57
    curCode += 65
    charTextCode[i] = curCode
  }
  let charTextNew = charTextCode.map(c => String.fromCharCode(c))
  return charTextNew.join("")
}