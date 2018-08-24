pragma solidity ^0.4.24;

interface TokenDealerInterface{
    function buy(address buyerAddress, uint amountTokens, address _referredBy) external payable returns(uint256);  
    function balanceOf(address _customerAddress) external view returns(uint256);
    function escapeTokens(address sellerAddress, uint256 _amountOfTokens) external returns(uint256);
    function totalSupply() external view returns(uint256);
    function reinvest(address buyer, uint256 buyAmount) external;
    function exit(address buyer) external;
    function withdraw(address buyer) external;
    function withdraw(address buyer, uint256 withdrawAmount) external;
    function sell(address buyer, uint256 _amountOfTokens) external; 
    function totalBalance() external view returns(uint);
    function dividendsOf(address _customerAddress) view external returns(uint256);
    function referralBalanceOf(address _customerAddress) view external returns(uint256);
    function sellPrice() external view returns(uint256);
    function buyPrice() external view returns(uint256);
    function calculateTokensReceived(uint256 _ethereumToSpend) external view returns(uint256);
    function calculateBuyTokenSpend(uint256 _tokensToBuy) external view returns(uint256);
    function calculateBuyTokenReceived(uint256 _tokensToSell) external view returns(uint256);
    function arbitrageTokens(address sellerAddress, uint256 _amountOfTokens) external;
}