export async function getPairInfo(contract, tokenA, tokenB) {
  return await contract.methods.getPair(tokenA, tokenB).call();
}

export async function getReserves(contract) {
  return await contract.methods.getReserves().call();
}

export async function getTokenAddress(contract) {
  return await contract.methods.token0().call();
}