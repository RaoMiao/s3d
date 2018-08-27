pragma solidity ^0.4.24;
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract S3DTokenBase {

    uint8 constant internal dividendFee = 10;

    /*================================
    =            DATASETS            =
    ================================*/
    // amount of shares for each address (scaled number)
    mapping(address => uint256) internal tokenBalanceLedger;
    mapping(address => uint256) internal referralBalance;
    mapping(address => int256) internal payoutsTo;
    mapping(address => uint256) internal ambassadorAccumulatedQuota;

    mapping(address => uint256) internal escapeTokenBalance;
    mapping(address => uint256) internal overSellTokenBalance;

    uint256 internal tokenSupply = 0;
    uint256 internal profitPerShare;

    uint256 internal escapeTokenSuppley = 0;
    uint256 internal overSellTokenAmount = 0;

    uint256 internal tokenPriceInitial = 0.0000001 ether;
    uint256 internal tokenPriceIncremental = 0.00000001 ether;
    uint256 constant internal magnitude = 2**64;

    // when this is set to true, only ambassadors can purchase tokens (this prevents a whale premine, it ensures a fairly distributed upper pyramid)
    bool public onlyAmbassadors = true;

    function S3DTokenBase() 
        public
    {

    }

    /*=================================
    =            MODIFIERS            =
    =================================*/
    // only people with tokens
    modifier onlyBagholders(address _myAddress) {
        require(balanceOf(_myAddress) > 0);
        _;
    }
    
    // only people with profits
    modifier onlyStronghands(address _myAddress) {
        require(dividendsOf(_myAddress) + referralBalanceOf(_myAddress) > 0);
        _;
    }

    function totalBalance() public view returns(uint256);
    
    /**
     * Retrieve the total token supply.
     */
    function totalSupply()
        public
        view
        returns(uint256)
    {
        return tokenSupply;
    }

    /**
     * Retrieve the token balance of any single address.
     */
    function balanceOf(address _customerAddress)
        public
        view
        returns(uint256)
    {
        return tokenBalanceLedger[_customerAddress];
    }

    /**
     * Retrieve the dividend balance of any single address.
     */
    function dividendsOf(address _customerAddress)
        public
        view
        returns(uint256)
    {
        return (uint256) ((int256)(profitPerShare * tokenBalanceLedger[_customerAddress]) - payoutsTo[_customerAddress]) / magnitude;
    }

    /**
     * Retrieve the referral balance of any single address.
     */
    function referralBalanceOf(address _customerAddress)
        public 
        view
        returns(uint256)
    {
        return referralBalance[_customerAddress];
    }

    /**
     * Return the buy price of 1 individual token.
     */
    function sellPrice() 
        public 
        view 
        returns(uint256)
    {
        // our calculation relies on the token supply, so we need supply. Doh.
        if(getPricedTokenAmount() == 0){
            return tokenPriceInitial - tokenPriceIncremental;
        } else {
            uint256 _buyTokenAmount = s3dToBuyTokens(1e18);
            uint256 _dividends = SafeMath.div(_buyTokenAmount, dividendFee);
            uint256 _taxedBuyToken = SafeMath.sub(_buyTokenAmount, _dividends);
            return _taxedBuyToken;
        }
    }
    
    /**
     * Return the sell price of 1 individual token.
     */
    function buyPrice() 
        public 
        view 
        returns(uint256)
    {
        // our calculation relies on the token supply, so we need supply. Doh.
        if(getPricedTokenAmount() == 0){
            return tokenPriceInitial + tokenPriceIncremental;
        } else {
            uint256 _buyTokenAmount = s3dToBuyTokens(1e18);
            uint256 _dividends = SafeMath.div(_buyTokenAmount, dividendFee);
            uint256 _taxedBuyToken = SafeMath.add(_buyTokenAmount, _dividends);
            return _taxedBuyToken;
        }
    }
    
    /**
     * Function for the frontend to dynamically retrieve the price scaling of buy orders.
     */
    function calculateTokensReceived(uint256 _buyTokenToSpend) 
        public 
        view 
        returns(uint256)
    {
        uint256 _dividends = SafeMath.div(_buyTokenToSpend, dividendFee);
        uint256 _taxedBuyToken = SafeMath.sub(_buyTokenToSpend, _dividends);
        uint256 _amountOfTokens = buyTokensToS3d(_taxedBuyToken);
        
        return _amountOfTokens;
    }
    
    function calculateBuyTokenSpend(uint256 _tokensToBuy)
        public 
        view
        returns(uint256)
    {
        uint256 _buyTokenAmount = needBuyTokensToS3d(_tokensToBuy);
        uint256 _dividends = SafeMath.div(_buyTokenAmount, dividendFee);
        uint256 _taxedBuyToken = SafeMath.add(_buyTokenAmount, _dividends);
        return _taxedBuyToken;
    }

    /**
     * Function for the frontend to dynamically retrieve the price scaling of sell orders.
     */
    function calculateBuyTokenReceived(uint256 _tokensToSell) 
        public 
        view 
        returns(uint256)
    {
        require(_tokensToSell <= getPricedTokenAmount());
        uint256 _buyTokenAmount = s3dToBuyTokens(_tokensToSell);
        uint256 _dividends = SafeMath.div(_buyTokenAmount, dividendFee);
        uint256 _taxedBuyToken = SafeMath.sub(_buyTokenAmount, _dividends);
        return _taxedBuyToken;
    }

    function needBuyTokensToS3d(uint256 _tokens)
        internal 
        view
        returns(uint256)
    {
        uint256 _tokenSupply = getPricedTokenAmount();
        uint256 _beginPrice = tokenPriceInitial +(tokenPriceIncremental * (tokenSupply/1e18));
        uint256 _endPrice = _beginPrice + (tokenPriceIncremental * (_tokens/1e18));
        uint256 _buyTokenNeeded = ((_beginPrice+_endPrice) * _tokens) / ( 1e18*2);

        return _buyTokenNeeded;
    }

    /**
     * Calculate Token price based on an amount of incoming ethereum
     * It's an algorithm, hopefully we gave you the whitepaper with it in scientific notation;
     * Some conversions occurred to prevent decimal errors or underflows / overflows in solidity code.
     */
    function buyTokensToS3d(uint256 _buyTokenAmount)
        internal
        view
        returns(uint256)
    {
        uint256 _tokenPriceInitial = tokenPriceInitial ;
        uint256 _tokenSupply =  getPricedTokenAmount();
        uint256 _tokensReceived = 
         (
            (
                // underflow attempts BTFO
                SafeMath.sub(
                    (sqrt
                        (   
                            (_tokenPriceInitial**2)
                            +
                            (2*(tokenPriceIncremental * 1e18 )*(_buyTokenAmount * 1e18))
                            +
                            (((tokenPriceIncremental)**2)*(tokenSupply**2))
                            +
                            (2*(tokenPriceIncremental)*_tokenPriceInitial*tokenSupply)
                        )
                    ), _tokenPriceInitial
                )
            )/(tokenPriceIncremental)
        )-(tokenSupply)
        ;
  
        return _tokensReceived;
    }
    

    function s3dToBuyTokens(uint256 _tokens)
        internal
        view
        returns(uint256)
    {

        uint256 tokens_ = (_tokens + 1e18);
        uint256 _tokenSupply = (getPricedTokenAmount() + 1e18);
        uint256 _buyTokensReceived =
        (
            // underflow attempts BTFO
            SafeMath.sub(
                (
                    (
                        (
                            tokenPriceInitial +(tokenPriceIncremental * (_tokenSupply/1e18))
                        )-tokenPriceIncremental
                    )*(tokens_ - 1e18)
                ),(tokenPriceIncremental*((tokens_**2-tokens_)/1e18))/2
            )
        /1e18);
        return _buyTokensReceived;
    }
    

    //This is where all your gas goes, sorry
    //Not sorry, you probably only paid 1 gwei
    function sqrt(uint x) internal pure returns (uint y) {
        uint z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function getDividendTokenAmount() 
        internal 
        view 
        returns (uint256) 
    {
        return tokenSupply;
    }

    function getPricedTokenAmount() 
        internal 
        view 
        returns (uint256) 
    {
        return SafeMath.sub(SafeMath.add(tokenSupply, escapeTokenSuppley), overSellTokenAmount);
    }

    function getProfitPerShare() 
        public
        view
        returns(uint256)
    {
        return profitPerShare;
    }
}