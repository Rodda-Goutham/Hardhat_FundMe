//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

error FundMe__notOwner();

contract FundMe {
  using PriceConverter for uint256;

  uint256 public constant MIN_USD = 50 * 1e18;

  address private immutable i_owner;

  address[] public s_funders;

  mapping(address => uint256) private s_AddressToAmount;

  AggregatorV3Interface private s_priceFeed;

  constructor(address priceFeedAddress) {
    i_owner = msg.sender;
    s_priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }

  modifier ownerOnly() {
    //require(msg.sender == i_owner, "sender is not owner");
    if (msg.sender != i_owner) {
      //gas efficient before:{gas 864338, txn cost 751598, exc cost 650746}
      revert FundMe__notOwner(); //after ::{gas 835452, txn cost 726480, exc cost 627320}
    }
    _;
  }

  function fund() public payable {
    require(
      msg.value.getConversion(s_priceFeed) >= MIN_USD,
      "didn't send enough ETH"
    );
    s_funders.push(msg.sender);
    s_AddressToAmount[msg.sender] = msg.value;
  }

  function withdraw() public ownerOnly {
    for (
      uint256 fundersIndex = 0;
      fundersIndex < s_funders.length;
      fundersIndex++
    ) {
      address funder = s_funders[fundersIndex];
      s_AddressToAmount[funder] = 0;
    }

    s_funders = new address[](0);

    (bool callsuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callsuccess, "call failed");
  }

  function cheapWithdraw() public ownerOnly {
    address[] memory funders = s_funders;
    for (
      uint256 fundersIndex = 0;
      fundersIndex < funders.length;
      fundersIndex++
    ) {
      address funder = funders[fundersIndex];
      s_AddressToAmount[funder] = 0;
    }

    s_funders = new address[](0);

    (bool callsuccess, ) = payable(msg.sender).call{
      value: address(this).balance
    }("");
    require(callsuccess, "call failed");
  }

  //getters

  function getFunder(uint256 index) public view returns (address) {
    return s_funders[index];
  }

  function getAddressToAmount(address funder) public view returns (uint256) {
    return s_AddressToAmount[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return s_priceFeed;
  }
}
