pragma solidity ^0.4.24;
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract S3DTokenBase {

    uint8 constant public decimals = 18;
    uint8 constant internal dividendFee_ = 10;

    /*================================
    =            DATASETS            =
    ================================*/
    // amount of shares for each address (scaled number)
    mapping(address => uint256) internal tokenBalanceLedger_;
    mapping(address => uint256) internal referralBalance_;
    mapping(address => int256) internal payoutsTo_;
    mapping(address => uint256) internal ambassadorAccumulatedQuota_;

    mapping(address => uint256) public escapeTokenBalance_;
    mapping(address => uint256) public overSellTokenBalance_;

    uint256 internal tokenSupply_ = 0;
    uint256 internal profitPerShare_;

    uint256 internal escapeTokenSuppley_ = 0;
    uint256 internal overSellTokenAmount_ = 0;

    uint256 internal tokenPriceInitial_ = 0.0000001 ether;
    uint256 internal tokenPriceIncremental_ = 0.00000001 ether;
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
    modifier onlyBagholders(address myAddress) {
        require(balanceOf(myAddress) > 0);
        _;
    }
    
    // only people with profits
    modifier onlyStronghands(address myAddress) {
        require(dividendsOf(myAddress) + referralBalanceOf(myAddress) > 0);
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
        return tokenSupply_;
    }

    /**
     * Retrieve the token balance of any single address.
     */
    function balanceOf(address _customerAddress)
        view
        public
        returns(uint256)
    {
        return tokenBalanceLedger_[_customerAddress];
    }

    /**
     * Retrieve the dividend balance of any single address.
     */
    function dividendsOf(address _customerAddress)
        view
        public
        returns(uint256)
    {
        return (uint256) ((int256)(profitPerShare_ * tokenBalanceLedger_[_customerAddress]) - payoutsTo_[_customerAddress]) / magnitude;
    }

    /**
     * Retrieve the referral balance of any single address.
     */
    function referralBalanceOf(address _customerAddress)
        view
        public 
        returns(uint256)
    {
        return referralBalance_[_customerAddress];
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
            return tokenPriceInitial_ - tokenPriceIncremental_;
        } else {
            uint256 _seeleAmount = s3dToBuyTokens_(1e18);
            uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_  );
            uint256 _taxedSeele = SafeMath.sub(_seeleAmount, _dividends);
            return _taxedSeele;
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
            return tokenPriceInitial_ + tokenPriceIncremental_;
        } else {
            uint256 _seeleAmount = s3dToBuyTokens_(1e18);
            uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_  );
            uint256 _taxedSeele = SafeMath.add(_seeleAmount, _dividends);
            return _taxedSeele;
        }
    }
    
    /**
     * Function for the frontend to dynamically retrieve the price scaling of buy orders.
     */
    function calculateTokensReceived(uint256 _seeleToSpend) 
        public 
        view 
        returns(uint256)
    {
        uint256 _dividends = SafeMath.div(_seeleToSpend, dividendFee_);
        uint256 _taxedSeele = SafeMath.sub(_seeleToSpend, _dividends);
        uint256 _amountOfTokens = buyTokensToS3d_(_taxedSeele);
        
        return _amountOfTokens;
    }
    
    function calculateBuyTokenSpend(uint256 _tokensToBuy)
        public 
        view
        returns(uint256)
    {
        uint256 _seeleAmount = s3dToBuyTokens_(_tokensToBuy);
        uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_);
        uint256 _taxedSeele = SafeMath.sub(_seeleAmount, _dividends);
        return _taxedSeele;
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
        uint256 _seeleAmount = s3dToBuyTokens_(_tokensToSell);
        uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_);
        uint256 _taxedSeele = SafeMath.sub(_seeleAmount, _dividends);
        return _taxedSeele;
    }

    /**
     * Calculate Token price based on an amount of incoming ethereum
     * It's an algorithm, hopefully we gave you the whitepaper with it in scientific notation;
     * Some conversions occurred to prevent decimal errors or underflows / overflows in solidity code.
     */
    function buyTokensToS3d_(uint256 seeleAmount)
        internal
        view
        returns(uint256)
    {
        uint256 _tokenPriceInitial = tokenPriceInitial_ ;
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
                            (2*(tokenPriceIncremental_ * 1e18 )*(seeleAmount * 1e18))
                            +
                            (((tokenPriceIncremental_)**2)*(tokenSupply_**2))
                            +
                            (2*(tokenPriceIncremental_)*_tokenPriceInitial*tokenSupply_)
                        )
                    ), _tokenPriceInitial
                )
            )/(tokenPriceIncremental_)
        )-(tokenSupply_)
        ;
  
        return _tokensReceived;
    }
    

    function s3dToBuyTokens_(uint256 _tokens)
        internal
        view
        returns(uint256)
    {

        uint256 tokens_ = (_tokens + 1e18);
        uint256 _tokenSupply = (getPricedTokenAmount() + 1e18);
        uint256 _seeleReceived =
        (
            // underflow attempts BTFO
            SafeMath.sub(
                (
                    (
                        (
                            tokenPriceInitial_ +(tokenPriceIncremental_ * (_tokenSupply/1e18))
                        )-tokenPriceIncremental_
                    )*(tokens_ - 1e18)
                ),(tokenPriceIncremental_*((tokens_**2-tokens_)/1e18))/2
            )
        /1e18);
        return _seeleReceived;
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

    function getDividendTokenAmount() internal view returns (uint256) {
        return tokenSupply_;
    }

    function getPricedTokenAmount() internal view returns (uint256) {
        return SafeMath.sub(SafeMath.add(tokenSupply_, escapeTokenSuppley_), overSellTokenAmount_);
    }
}