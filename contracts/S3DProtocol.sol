pragma solidity ^0.4.24;


import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "../contracts/interface/TokenDealerInterface.sol";
import "../contracts/library/TokenDealerMapping.sol";
import "../contracts/library/StringUtils.sol";


contract S3DProtocol is Claimable{

    TokenDealerMapping.itmap tokenDealerMap;

    // proof of stake (defaults at 100 tokens)
    uint256 public stakingRequirement = 100e18;

    uint256 public arbitrageRequirement = 300e18;

    string constant public ethSymbol = "eth";

    function addDealer(string symbol, address dealerAddress) public onlyOwner returns (uint size) {
        TokenDealerMapping.insert(tokenDealerMap, symbol, dealerAddress);
        return tokenDealerMap.size;
    }

    function getDealer(string symbol) public view returns (address) {
        return tokenDealerMap.data[symbol].value;
    }

    function setStakingRequirement(uint256 _amountOfTokens) onlyOwner() public {
        stakingRequirement = _amountOfTokens;
    }

    function setArbitrageRequirement(uint256 _amountOfTokens) onlyOwner() public {
        arbitrageRequirement = _amountOfTokens;
    }
    
    //add all s3d
    function balanceOf(address _customerAddress) public view returns (uint256 sum) {
        for (var i = TokenDealerMapping.iterate_start(tokenDealerMap); TokenDealerMapping.iterate_valid(tokenDealerMap, i); i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            string memory key;
            address value; 
            (key, value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface dealerContract = TokenDealerInterface(value);
            sum += dealerContract.balanceOf(_customerAddress);
        }
    }

    function balanceOf(string symbol, address _customerAddress) public view returns (uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.balanceOf(_customerAddress);
    }

    //add all s3d
    function totalSupply() public view returns (uint256 sum) 
    {
        for (var i = TokenDealerMapping.iterate_start(tokenDealerMap); TokenDealerMapping.iterate_valid(tokenDealerMap, i); i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            string memory key;
            address value;
            (key, value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface dealerContract = TokenDealerInterface(value);
            sum += dealerContract.totalSupply();
        }
    }

    modifier referralBarrier(address _referredBy){
        // are we still in the vulnerable phase?
        // if so, enact anti early whale protocol 
        if( _referredBy != address(0)){
            require(balanceOf(_referredBy) >= stakingRequirement);
            
            // execute
            _;
        } else {

            _;    
        }     
    }

    modifier arbitrageBarrier() {
        require(balanceOf(msg.sender) >= arbitrageRequirement);
        _;
    }

    function buy(string symbol, uint256 _tokenAmount, address _referredBy)
        referralBarrier(_referredBy)
        public
        payable
        returns(uint256)
    {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        if(StringUtils.compare(symbol, ethSymbol) == 0) {
            dealerContract.buy.value(msg.value)(msg.sender, msg.value, _referredBy);
        } else {
            dealerContract.buy(msg.sender, _tokenAmount, _referredBy);
        }
    }

    function reinvest(string symbol) public{
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        dealerContract.reinvest(msg.sender);
    }

    function exit(string symbol) public {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        dealerContract.exit(msg.sender);
    }

    function withdrawAll() public {
        for (var i = TokenDealerMapping.iterate_start(tokenDealerMap); TokenDealerMapping.iterate_valid(tokenDealerMap, i); i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            string memory key;
            address value;
            (key, value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface dealerContract = TokenDealerInterface(value);
            if (dealerContract.myDividends(msg.sender, true) > 0) {
                dealerContract.withdraw(msg.sender);
            }
        }
    }

    function withdraw(string symbol) public{
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        dealerContract.withdraw(msg.sender);
    }

    function sell(string symbol, uint256 _amountOfTokens) public {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        dealerContract.sell(msg.sender, _amountOfTokens);
    }

    function totalBalance(string symbol) public view returns(uint) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.totalBalance();
    }

    function myDividends(string symbol, bool _includeReferralBonus) public view returns(uint256){
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.myDividends(msg.sender, _includeReferralBonus);
    }

    function dividendsOf(string symbol, address _customerAddress) view public returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.dividendsOf(_customerAddress);
    }

    function referralBalanceOf(string symbol, address _customerAddress) view public returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.referralBalanceOf(_customerAddress);
    }

    function sellPrice(string symbol) public view returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.sellPrice();
    }

    function buyPrice(string symbol) public view returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.buyPrice();
    }

    function calculateTokensReceived(string symbol, uint256 _ethereumToSpend) public view returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.calculateTokensReceived(_ethereumToSpend);
    }

    function calculateBuyTokenSpend(string symbol, uint256 _tokensToBuy) public view returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.calculateBuyTokenSpend(_tokensToBuy);
    }

    function calculateBuyTokenReceived(string symbol, uint256 _tokensToSell) public view returns(uint256) {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[symbol].value);
        require(dealerContract != address(0));
        return dealerContract.calculateBuyTokenReceived(_tokensToSell);
    }

    function arbitrageTokens(string fromSymbol, string sellSymbol, uint256 _amountOfTokens) 
        arbitrageBarrier()
        public 
    {
        TokenDealerInterface dealerContract = TokenDealerInterface(tokenDealerMap.data[fromSymbol].value);
        require(dealerContract != address(0));
        address toDealerContractAddress = tokenDealerMap.data[sellSymbol].value;
        require(toDealerContractAddress != address(0));
        dealerContract.arbitrageTokens(msg.sender, toDealerContractAddress, _amountOfTokens);
    }
}