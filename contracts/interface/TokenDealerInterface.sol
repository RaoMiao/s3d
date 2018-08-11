pragma solidity ^0.4.24;

interface TokenDealerInterface{
    function purchaseTokens(uint256 incomingToken, address referredBy) external payable returns(uint256);
     
}