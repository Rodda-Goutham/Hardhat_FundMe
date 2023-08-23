const { network } = require("hardhat");
const {
  deploymentChains,
  DECIMALS,
  INITIAL_PRICE,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  if (deploymentChains.includes(network.name)) {
    log("local network detected!.....deploying mocks....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("mocks deployed...");
    log("--------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
