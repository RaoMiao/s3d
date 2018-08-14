pragma solidity ^0.4.24;

interface TokenDealerInterface{
    function buy(address buyerAddress, uint amountTokens, address _referredBy) public payable returns(uint256);  
    function balanceOf(address _customerAddress) view public returns(uint256);
    function escapeTokens(uint256 _amountOfTokens) view public returns(uint256);
    function totalSupply() public view returns(uint256);
}