const networkConfig = {
  31337: {
    name: "localhost",
  },
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694aa1769357215de4fac081bf1f309adc325306",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xd4a33860578de61dbabdc8bfdb98fd742fa7028e",
  },
};
const DECIMALS = "8";
const INITIAL_PRICE = "200000000000";

const deploymentChains = ["hardhat", "localhost"];
module.exports = {
  networkConfig,
  deploymentChains,
  DECIMALS,
  INITIAL_PRICE,
};
