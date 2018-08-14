pragma solidity ^0.4.24;


import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "../contracts/interface/TokenDealerInterface.sol";
import "../contracts/library/TokenDealerMapping.sol";
import "../contracts/library/StringUtils.sol";


contract S3DProtocol is Claimable{

    TokenDealerMapping.itmap tokenDealerMap;

    // proof of stake (defaults at 100 tokens)
    uint256 public stakingRequirement = 100e18;

    string constant public ethSymbol = "eth";

    function addDealer(string symbol, address dealerAddress) public onlyOwner returns (uint size) {
        TokenDealerMapping.insert(tokenDealerMap, symbol, dealerAddress);
        return tokenDealerMap.size;
    }

    function getDealer(string symbol) public view returns (address) {
        return tokenDealerMap.data[symbol].value;
    }

    function getSize() public view returns (uint) {
        return tokenDealerMap.size;
    }

    function setStakingRequirement(uint256 _amountOfTokens) onlyOwner() public
    {
        stakingRequirement = _amountOfTokens;
    }
    

    function totalSupply() public view returns (uint256 sum) 
    {
        for (var i = TokenDealerMapping.iterate_start(tokenDealerMap); TokenDealerMapping.iterate_valid(tokenDealerMap, i); i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            var (key, value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface dealerContract = TokenDealerInterface(value);
            sum += dealerContract.totalSupply();
        }
    }

    //add all s3d
    function balanceOf(address _customerAddress) view public returns (uint256 sum) 
    {
        for (var i = TokenDealerMapping.iterate_start(tokenDealerMap); TokenDealerMapping.iterate_valid(tokenDealerMap, i); i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            var (key, value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface dealerContract = TokenDealerInterface(value);
            sum += dealerContract.balanceOf(_customerAddress);
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

}