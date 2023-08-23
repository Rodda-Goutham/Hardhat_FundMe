const { ethers, network, deployments, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { deploymentChains } = require("../../helper-hardhat-config");

!deploymentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.parseEther("1");
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer,
        );
      });
      describe("constructor", async function () {
        it("assigns the priceFeed address", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.target);
        });
      });
      describe("fund", async function () {
        it("fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "didn't send enough ETH",
          );
        });
        it("updates funded amount", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmount(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });
        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("sends ETH to single funder", async function () {
          const startingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasPrice, gasUsed } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;
          const endingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const endingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance + startingFunderBalance,
            endingFunderBalance + gasCost,
          );
        });
        it("sends ETH to multiple funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasPrice, gasUsed } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;

          const endingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const endingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance + startingFunderBalance,
            endingFunderBalance + gasCost,
          );
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(await fundMe.getAddressToAmount(accounts[i]), 0);
          }
        });
        it("allows only owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const fundMeConnectedContract = fundMe.connect(attacker);
          await expect(fundMeConnectedContract.withdraw()).to.be.reverted;
        });
        it("cheapWithdraw testing...", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          const transactionResponse = await fundMe.cheapWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasPrice, gasUsed } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;

          const endingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const endingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance + startingFunderBalance,
            endingFunderBalance + gasCost,
          );
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 1; i < 6; i++) {
            assert.equal(await fundMe.getAddressToAmount(accounts[i]), 0);
          }
        });
        it("cheapWithdraw: sends ETH to single funder", async function () {
          const startingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const startingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          const transactionResponse = await fundMe.cheapWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          const { gasPrice, gasUsed } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;
          const endingFundBalance = await ethers.provider.getBalance(
            fundMe.target,
          );
          const endingFunderBalance = await ethers.provider.getBalance(
            deployer,
          );
          assert.equal(endingFundBalance, 0);
          assert.equal(
            startingFundBalance + startingFunderBalance,
            endingFunderBalance + gasCost,
          );
        });
      });
    });
