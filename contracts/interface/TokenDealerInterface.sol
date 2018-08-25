pragma solidity ^0.4.24;

interface TokenDealerInterface{
    function buy(address _buyerAddress, uint _amountTokens, address _referredBy) external payable returns(uint256);  
    function balanceOf(address _customerAddress) external view returns(uint256);
    function escapeTokens(address _sellerAddress, uint256 _amountOfTokens) external returns(uint256);
    function totalSupply() external view returns(uint256);
    function reinvest(address _buyer, uint256 _buyAmount) external;
    function exit(address _buyer) external;
    function withdrawAll(address _buyer) external;
    function withdraw(address _buyer, uint256 _withdrawAmount) external;
    function sell(address _buyer, uint256 _amountOfTokens) external; 
    function totalBalance() external view returns(uint);
    function dividendsOf(address _customerAddress) view external returns(uint256);
    function referralBalanceOf(address _customerAddress) view external returns(uint256);
    function sellPrice() external view returns(uint256);
    function buyPrice() external view returns(uint256);
    function calculateTokensReceived(uint256 _ethereumToSpend) external view returns(uint256);
    function calculateBuyTokenSpend(uint256 _tokensToBuy) external view returns(uint256);
    function calculateBuyTokenReceived(uint256 _tokensToSell) external view returns(uint256);
    function arbitrageTokens(address _sellerAddress, uint256 _amountOfTokens) external;
}