pragma solidity ^0.4.24;


import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "../contracts/interface/TokenDealerInterface.sol";
import "../contracts/library/TokenDealerMapping.sol";
import "../contracts/library/StringUtils.sol";

contract S3DProtocol is Claimable{
    TokenDealerMapping.itmap tokenDealerMap;

    uint256 public referralRequirement = 500e18;
    uint256 public arbitrageRequirement = 1000e18;

    string constant internal ethSymbol = "eth";

    uint8 constant public decimals = 18;
    string constant public name = "S3D Token";
    string constant public symbol = "S3D";

    mapping(address => bool) internal referralers;
    mapping(address => bool) internal arbitragers;

    function addReferraler(address _customerAddress)
        public 
        onlyOwner()
    {
        referralers[_customerAddress] = true;
    }

    function removeReferraler(address _customerAddress)
        public
        onlyOwner()
    {
        referralers[_customerAddress] = false;
    }

    function addArbitrager(address _customerAddress)
        public 
        onlyOwner()
    {
        arbitragers[_customerAddress] = true;
    }

    function removeArbitrager(address _customerAddress)
        public
        onlyOwner()
    {
        arbitragers[_customerAddress] = false;
    }

    function isReferraler(address _customerAddress)
        public
        view
        returns(bool)
    {
        return referralers[_customerAddress];
    }

    function isArbitrager(address _customerAddress)
        public
        view
        returns(bool)
    {
        return arbitragers[_customerAddress];
    }

    function addDealer(string _symbol, address _dealerAddress) 
        public 
        onlyOwner()
        returns (uint size) 
    {
        TokenDealerMapping.insert(tokenDealerMap, _symbol, _dealerAddress);
        return tokenDealerMap.size;
    }

    function getDealer(string _symbol) 
        public 
        view 
        returns (address) 
    {
        return tokenDealerMap.data[_symbol].value;
    }

    function setReferralRequirement(uint256 _amountOfTokens) 
        public
        onlyOwner()  
    {
        referralRequirement = _amountOfTokens;
    }

    function setArbitrageRequirement(uint256 _amountOfTokens) 
        public
        onlyOwner()  
    {
        arbitrageRequirement = _amountOfTokens;
    }
    
    function balanceOf( address _customerAddress) 
        public 
        view 
        returns (uint256 _sum) 
    {
        for (uint i = TokenDealerMapping.iterate_start(tokenDealerMap); 
             TokenDealerMapping.iterate_valid(tokenDealerMap, i); 
             i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            address _value;
            (, _value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface _dealerContract = TokenDealerInterface(_value);
            _sum += _dealerContract.balanceOf(_customerAddress);
        } 
    }

    function balanceOfOneToken(string _symbol, address _customerAddress) 
        public 
        view 
        returns (uint256)
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.balanceOf(_customerAddress);
    }

    //add all s3d
    function totalSupply() 
        public 
        view 
        returns (uint256 _sum) 
    {
        _sum = 0;
        for (uint i = TokenDealerMapping.iterate_start(tokenDealerMap);
             TokenDealerMapping.iterate_valid(tokenDealerMap, i);
             i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            address _value;
            (, _value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface _dealerContract = TokenDealerInterface(_value);
            _sum += _dealerContract.totalSupply();
        }
    }

    function totalSupplyOfOneToken(string _symbol) 
        public 
        view 
        returns (uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.totalSupply();
    }

    modifier arbitrageBarrier() 
    {
        require(balanceOf(msg.sender) >= arbitrageRequirement || isArbitrager(msg.sender));
        _;
    }

    function buy(string _symbol, uint256 _tokenAmount, address _referredBy)
        public
        payable
        returns(uint256)
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));

        address _referrer = _referredBy;
        if( 
            // no cheating!
            _referrer == msg.sender 
            
            // does the referrer have at least X whole tokens?
            // i.e is the referrer a godly chad masternode
            || (balanceOf(_referrer) < referralRequirement)

            // not in referal referraler list
            || !isReferraler(_referrer)
        ) {
            _referrer = 0x0000000000000000000000000000000000000000;
        }

        if(StringUtils.compare(_symbol, ethSymbol) == 0) {
            _dealerContract.buy.value(msg.value)(msg.sender, msg.value, _referrer);
        } else {
            _dealerContract.buy(msg.sender, _tokenAmount, _referrer);
        }
    }

    function reinvest(string _symbol, uint256 _buyAmount) 
        public
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        _dealerContract.reinvest(msg.sender, _buyAmount);
    }

    function exit(string _symbol) 
        public 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        _dealerContract.exit(msg.sender);
    }


    function withdrawAll() 
        public 
    {
        for (uint i = TokenDealerMapping.iterate_start(tokenDealerMap); 
             TokenDealerMapping.iterate_valid(tokenDealerMap, i); 
             i = TokenDealerMapping.iterate_next(tokenDealerMap, i))
        {
            address _value;
            (, _value) = TokenDealerMapping.iterate_get(tokenDealerMap, i);
            TokenDealerInterface _dealerContract = TokenDealerInterface(_value);
            if (_dealerContract.dividendsOf(msg.sender) > 0 || _dealerContract.referralBalanceOf(msg.sender) > 0) {
                _dealerContract.withdrawAll(msg.sender);
            }
        }
    }

    function withdraw(string _symbol, uint256 _withdrawAmount) 
        public
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        _dealerContract.withdraw(msg.sender, _withdrawAmount);
    }

    function sell(string _symbol, uint256 _amountOfTokens) 
        public 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        _dealerContract.sell(msg.sender, _amountOfTokens);
    }

    function totalBalance(string _symbol) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.totalBalance();
    }


    function dividendsOf(string _symbol, address _customerAddress) 
        public
        view  
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.dividendsOf(_customerAddress);
    }

    function referralBalanceOf(string _symbol, address _customerAddress) 
        public
        view  
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.referralBalanceOf(_customerAddress);
    }

    function sellPrice(string _symbol) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.sellPrice();
    }

    function buyPrice(string _symbol) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.buyPrice();
    }

    function calculateTokensReceived(string _symbol, uint256 _buyTokenToSpend) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.calculateTokensReceived(_buyTokenToSpend);
    }

    function calculateBuyTokenSpend(string _symbol, uint256 _tokensToBuy) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.calculateBuyTokenSpend(_tokensToBuy);
    }

    function calculateBuyTokenReceived(string _symbol, uint256 _tokensToSell) 
        public 
        view 
        returns(uint256) 
    {
        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_symbol].value);
        assert(_dealerContract != address(0));
        return _dealerContract.calculateBuyTokenReceived(_tokensToSell);
    }

    function arbitrageTokens(string _fromSymbol, string _toSymbol, uint256 _amountOfTokens) 
        public
        arbitrageBarrier() 
    {
        TokenDealerInterface _escapeContract = TokenDealerInterface(tokenDealerMap.data[_fromSymbol].value);
        assert(_escapeContract != address(0));

        uint256 _tokens = _escapeContract.escapeTokens(msg.sender, _amountOfTokens); 
        assert(_tokens == _amountOfTokens);

        TokenDealerInterface _dealerContract = TokenDealerInterface(tokenDealerMap.data[_toSymbol].value);
        assert(_dealerContract != address(0));

        _dealerContract.arbitrageTokens(msg.sender, _amountOfTokens);
    }
}