const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log("withdrawing .....");
  const transactionResponse = await fundMe.withdraw();
  console.log("Done!");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
