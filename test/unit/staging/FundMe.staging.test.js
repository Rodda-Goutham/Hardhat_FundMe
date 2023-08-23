const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { assert } = require("chai");
const { deploymentChains } = require("../../../helper-hardhat-config");

deploymentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe, deployer;
      const sendValue = ethers.parseEther("0.1");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });
      it("allows to fund and withdraw ETH from contract", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();

        const endingFundBalance = await ethers.provider.getBalance(
          fundMe.target,
        );
        assert.equal(endingFundBalance, 0);
      });
    });
