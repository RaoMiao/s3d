pragma solidity ^0.4.24;

interface TokenDealerInterface{
    function buy(address buyerAddress, uint amountTokens, address _referredBy) public payable returns(uint256);  
    function balanceOf(address _customerAddress) public view returns(uint256);
    function escapeTokens(address sellerAddress, uint256 _amountOfTokens) public returns(uint256);
    function totalSupply() public view returns(uint256);
    function reinvest(address buyer) public;
    function exit(address buyer) public;
    function withdraw(address buyer) public;
    function sell(address buyer, uint256 _amountOfTokens) public; 
    function totalBalance() public view returns(uint);
    function myDividends(address myAddress, bool _includeReferralBonus) public view returns(uint256);
    function dividendsOf(address _customerAddress) view public returns(uint256);
    function referralBalanceOf(address _customerAddress) view public returns(uint256);
    function sellPrice() public view returns(uint256);
    function buyPrice() public view returns(uint256);
    function calculateTokensReceived(uint256 _ethereumToSpend) public view returns(uint256);
    function calculateBuyTokenSpend(uint256 _tokensToBuy) public view returns(uint256);
    function calculateBuyTokenReceived(uint256 _tokensToSell) public view returns(uint256);
    function arbitrageTokens(address sellerAddress, address sellTokenAddress, uint256 _amountOfTokens) public;
}