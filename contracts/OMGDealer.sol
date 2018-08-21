pragma solidity ^0.4.21;
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "zeppelin-solidity/contracts/access/Whitelist.sol";
import "../contracts/interface/TokenDealerInterface.sol";
import "./S3Devents.sol";
import "./S3DTokenBase.sol";
import "../contracts/interface/OMGTokenInterface.sol";

contract OMGDealer is Claimable, Whitelist, S3DEvents, S3DTokenBase{ 

 
    // ensures that the first tokens in the contract will be equally distributed
    // meaning, no divine dump will be ever possible
    // result: healthy longevity.
    modifier antiEarlyWhale(address buyer, uint256 _amountOfEthereum){
        address _customerAddress = buyer;
        
        // are we still in the vulnerable phase?
        // if so, enact anti early whale protocol 
        if( onlyAmbassadors && ((totalBalance() - _amountOfEthereum) <= ambassadorQuota_ )){
            require(
                // is the customer in the ambassador list?
                ambassadors_[_customerAddress] == true &&
                
                // does the customer purchase exceed the max ambassador quota?
                (ambassadorAccumulatedQuota_[_customerAddress] + _amountOfEthereum) <= ambassadorMaxPurchase_
                
            );
            
            // updated the accumulated quota    
            ambassadorAccumulatedQuota_[_customerAddress] = SafeMath.add(ambassadorAccumulatedQuota_[_customerAddress], _amountOfEthereum);
        
            // execute
            _;
        } else {
            // in case the ether count drops low, the ambassador phase won't reinitiate
            onlyAmbassadors = false;
            _;    
        }
        
    }
    
    /*=====================================
    =            CONFIGURABLES            =
    =====================================*/
    string public name = "OMG-S3D";
    string public symbol = "OMG-S3D";
    
    // ambassador program
    mapping(address => bool) internal ambassadors_;
    uint256 constant internal ambassadorMaxPurchase_ = 10000;
    uint256 constant internal ambassadorQuota_ = 200000;
    
    address public OMGTokenAddress = 0x47879ac781938CFfd879392Cd2164b9F7306188a;

    
 
    // when this is set to true, only ambassadors can purchase tokens (this prevents a whale premine, it ensures a fairly distributed upper pyramid)
    bool public onlyAmbassadors = true;


    /*=======================================
    =            PUBLIC FUNCTIONS            =
    =======================================*/
    /*
    * -- APPLICATION ENTRY POINTS --  
    */
    function OMGDealer(address tokenAddress)
        public
    {
        tokenPriceInitial_ = 0.000008 * 1e18;
        tokenPriceIncremental_ = 0.0000008 * 1e18;

        OMGTokenAddress = tokenAddress;

        // add the ambassadors here.
        // mantso - lead solidity dev & lead web dev. 
        ambassadors_[0xCd16575A90eD9506BCf44C78845d93F1b647F48C] = true;
    }

    /**
     * Converts all incoming ethereum to tokens for the caller, and passes down the referral addy (if any)
     */
    function buy(address buyer, uint256 seeleAmount, address _referredBy)
        public
        payable
        onlyIfWhitelisted(msg.sender)
        returns(uint256)
    {
        //transfer seele to contract
        OMGTokenInterface(OMGTokenAddress).transferFrom(buyer, address(this), seeleAmount);
        purchaseTokens(buyer, seeleAmount, _referredBy);
    }
    
    /*
     * default fallback函数
    */
    // function()
    //     payable
    //     public
    // {
        
    // }

    /**
     * Converts all of caller's dividends to tokens.
     */
    function reinvest(address buyer, uint buyAmount)
        onlyStronghands(buyer)
        onlyIfWhitelisted(msg.sender)
        public
    {
        // fetch dividends
        uint256 _dividends = dividendsOf(buyer); // retrieve ref. bonus later in the code
        uint256 _referralBalance = referralBalance_[buyer];
        require(buyAmount <= (_dividends + _referralBalance));

        if (buyAmount <= _dividends) {
            // pay out the dividends virtually
            payoutsTo_[buyer] +=  (int256)(buyAmount * magnitude);
        } else {
            payoutsTo_[buyer] +=  (int256) (_dividends * magnitude);
            // retrieve ref. bonus
            referralBalance_[buyer] = SafeMath.sub(referralBalance_[buyer], buyAmount - _dividends);
        }
                
        // dispatch a buy order with the virtualized "withdrawn dividends"
        uint256 _tokens = purchaseTokens(buyer, buyAmount, 0x0);
        
        // fire event
        emit S3DEvents.onReinvestment(buyer, buyAmount, _tokens);
    }

    // function reinvest(address buyer)
    //     onlyStronghands(buyer)
    //     public
    // {
    //     // fetch dividends
    //     uint256 _dividends = myDividends(buyer, false); // retrieve ref. bonus later in the code
        
    //     // pay out the dividends virtually
    //     address _customerAddress = buyer;
    //     payoutsTo_[_customerAddress] +=  (int256) (_dividends * magnitude);
        
    //     // retrieve ref. bonus
    //     _dividends += referralBalance_[_customerAddress];
    //     referralBalance_[_customerAddress] = 0;
        
    //     // dispatch a buy order with the virtualized "withdrawn dividends"
    //     uint256 _tokens = purchaseTokens(_customerAddress, _dividends, 0x0);
        
    //     // fire event
    //     emit onReinvestment(_customerAddress, _dividends, _tokens);
    // }
    
    /**
     * Alias of sell() and withdraw().
     */
    function exit(address buyer)
        onlyIfWhitelisted(msg.sender)
        public
    {
        // get token count for caller & sell them all
        address _customerAddress = buyer;
        uint256 _tokens = tokenBalanceLedger_[_customerAddress];
        if(_tokens > 0) 
            sell(buyer, _tokens);
        
        // lambo delivery service
        withdraw(buyer);
    }

    /**
     * Withdraws all of the callers earnings.
     */
    function withdraw(address buyer)
        onlyStronghands(buyer)
        onlyIfWhitelisted(msg.sender)
        public
    {
        // setup data
        address _customerAddress = buyer;
        uint256 _dividends = dividendsOf(_customerAddress); // get ref. bonus later in the code
        
        // update dividend tracker
        payoutsTo_[_customerAddress] +=  (int256) (_dividends * magnitude);
        
        // add ref. bonus
        _dividends += referralBalance_[_customerAddress];
        referralBalance_[_customerAddress] = 0;
        
        // lambo delivery service
        //_customerAddress.transfer(_dividends);
        OMGTokenInterface(OMGTokenAddress).transfer(_customerAddress, _dividends);
        
        // fire event
        emit S3DEvents.onWithdraw(_customerAddress, _dividends);
    }

    function withdraw(address buyer, uint256 withdrawAmount)
        onlyStronghands(buyer)
        onlyIfWhitelisted(msg.sender)
        public
    {
        // setup data
        uint256 _dividends = dividendsOf(buyer); // get ref. bonus later in the code
        uint256 _referralBalance = referralBalance_[buyer];
        require(withdrawAmount <= (_dividends + _referralBalance));

        if (withdrawAmount <= _dividends) {
            // pay out the dividends virtually
            payoutsTo_[buyer] +=  (int256)(withdrawAmount * magnitude);
        } else {
            // retrieve ref. bonus
            payoutsTo_[buyer] +=  (int256) (_dividends * magnitude);
            referralBalance_[buyer] = SafeMath.sub(referralBalance_[buyer], withdrawAmount - _dividends);
        }
        
        
        // lambo delivery service
        //_customerAddress.transfer(withdrawAmount);
        OMGTokenInterface(OMGTokenAddress).transfer(buyer, _dividends);
        
        // fire event
        emit S3DEvents.onWithdraw(buyer, withdrawAmount);
    }
    
    /**
     * Liquifies tokens to ethereum.
     */
    function sell(address seller, uint256 _amountOfTokens)
        onlyBagholders(seller)
        onlyIfWhitelisted(msg.sender)
        public
    {
        // setup data
        address _customerAddress = seller;
        // russian hackers BTFO
        require(_amountOfTokens <= tokenBalanceLedger_[_customerAddress]);
        uint256 _tokens = _amountOfTokens;
        uint256 _seeleAmount = s3dToBuyTokens_(_tokens);
        uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_);
        uint256 _taxedSeele = SafeMath.sub(_seeleAmount, _dividends);
        
        // burn the sold tokens
        tokenSupply_ = SafeMath.sub(tokenSupply_, _tokens);
        tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _tokens);
        
        // update dividends tracker
        int256 _updatedPayouts = (int256) (profitPerShare_ * _tokens + (_taxedSeele * magnitude));
        payoutsTo_[_customerAddress] -= _updatedPayouts;       
        
        // dividing by zero is a bad idea
        uint256 dividendTokenAmount_ =  getDividendTokenAmount();
        if (dividendTokenAmount_ > 0) {
            // update the amount of dividends per token
            profitPerShare_ = SafeMath.add(profitPerShare_, (_dividends * magnitude) / dividendTokenAmount_);
        }
        
        // fire event
        emit S3DEvents.onTokenSell(_customerAddress, _tokens, _taxedSeele);
    }
    
    /**
     * Transfer tokens from the caller to a new holder.
     * Remember, there's a 10% fee here as well.
     */
    // function transfer(address _toAddress, uint256 _amountOfTokens)
    //     onlyBagholders()
    //     public
    //     returns(bool)
    // {
    //     // setup
    //     address _customerAddress = msg.sender;
        
    //     // make sure we have the requested tokens
    //     // also disables transfers until ambassador phase is over
    //     // ( we dont want whale premines )
    //     require(!onlyAmbassadors && _amountOfTokens <= tokenBalanceLedger_[_customerAddress]);
        
    //     // withdraw all outstanding dividends first
    //     if(myDividends(true) > 0) withdraw();
        
    //     // liquify 10% of the tokens that are transfered
    //     // these are dispersed to shareholders
    //     uint256 _tokenFee = SafeMath.div(_amountOfTokens, dividendFee_);
    //     uint256 _taxedTokens = SafeMath.sub(_amountOfTokens, _tokenFee);
    //     uint256 _dividends = tokensToSeele(_tokenFee);
  
    //     // burn the fee tokens
    //     tokenSupply_ = SafeMath.sub(tokenSupply_, _tokenFee);

    //     // exchange tokens
    //     tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _amountOfTokens);
    //     tokenBalanceLedger_[_toAddress] = SafeMath.add(tokenBalanceLedger_[_toAddress], _taxedTokens);
        
    //     // update dividend trackers
    //     payoutsTo_[_customerAddress] -= (int256) (profitPerShare_ * _amountOfTokens);
    //     payoutsTo_[_toAddress] += (int256) (profitPerShare_ * _taxedTokens);
        
    //     // disperse dividends among holders
    //     profitPerShare_ = SafeMath.add(profitPerShare_, (_dividends * magnitude) / tokenSupply_);
        
    //     // fire event
    //     emit Transfer(_customerAddress, _toAddress, _taxedTokens);
        
    //     // ERC20
    //     return true;
       
    // }
    
    /*----------  ADMINISTRATOR ONLY FUNCTIONS  ----------*/
    /**
     * In case the amassador quota is not met, the administrator can manually disable the ambassador phase.
     */
    function disableInitialStage()
        onlyOwner()
        public
    {
        onlyAmbassadors = false;
    }
    
    /**
     * Precautionary measures in case we need to adjust the masternode rate.
     */
    // function setStakingRequirement(uint256 _amountOfTokens)
    //     onlyOwner()
    //     public
    // {
    //     stakingRequirement = _amountOfTokens;
    // }
    

    
    /*----------  HELPERS AND CALCULATORS  ----------*/
    /**
     * Method to view the current Ethereum stored in the contract
     * Example: totalEthereumBalance()
     */
    function totalBalance()
        public
        view
        returns(uint256)
    {
        return OMGTokenInterface(OMGTokenAddress).balanceOf(address(this));
    }
    

    /*==========================================
    =            INTERNAL FUNCTIONS            =
    ==========================================*/
    function purchaseTokens(address buyer, uint256 _incomingSeele, address _referredBy)
        antiEarlyWhale(buyer, _incomingSeele)
        internal
        returns(uint256)
    {
        // data setup
        //address _customerAddress = buyer;
        uint256 _undividedDividends = SafeMath.div(_incomingSeele, dividendFee_);
        uint256 _referralBonus = SafeMath.div(_undividedDividends, 3);
        uint256 _dividends = SafeMath.sub(_undividedDividends, _referralBonus);
        uint256 _taxedSeele = SafeMath.sub(_incomingSeele, _undividedDividends);
        uint256 _amountOfTokens = buyTokensToS3d_(_taxedSeele);
        uint256 _fee = _dividends * magnitude;
 
        // no point in continuing execution if OP is a poorfag russian hacker
        // prevents overflow in the case that the pyramid somehow magically starts being used by everyone in the world
        // (or hackers)
        // and yes we know that the safemath function automatically rules out the "greater then" equasion.
        require(_amountOfTokens > 0 && (SafeMath.add(_amountOfTokens,tokenSupply_) > tokenSupply_));
        
        // is the user referred by a masternode?
        if(
            // is this a referred purchase?
            _referredBy != 0x0000000000000000000000000000000000000000 &&

            // no cheating!
            _referredBy != buyer
            
            // does the referrer have at least X whole tokens?
            // i.e is the referrer a godly chad masternode
            //tokenBalanceLedger_[_referredBy] >= stakingRequirement
        ){
            // wealth redistribution
            referralBalance_[_referredBy] = SafeMath.add(referralBalance_[_referredBy], _referralBonus);
        } else {
            // no ref purchase
            // add the referral bonus back to the global dividends cake
            _dividends = SafeMath.add(_dividends, _referralBonus);
            _fee = _dividends * magnitude;
        }
        
        // we can't give people infinite ethereum
        if(tokenSupply_ > 0){
            
            // add tokens to the pool
            tokenSupply_ = SafeMath.add(tokenSupply_, _amountOfTokens);

            //uint256 dividendTokenAmount_ =  getDividendTokenAmount();
 
            // take the amount of dividends gained through this transaction, and allocates them evenly to each shareholder
            profitPerShare_ += (_dividends * magnitude / (getDividendTokenAmount()));
            
            // calculate the amount of tokens the customer receives over his purchase 
            _fee = _fee - (_fee-(_amountOfTokens * (_dividends * magnitude / (getDividendTokenAmount()))));
        
        } else {
            // add tokens to the pool
            tokenSupply_ = _amountOfTokens;
        }
        
        // update circulating supply & the ledger address for the customer
        tokenBalanceLedger_[buyer] = SafeMath.add(tokenBalanceLedger_[buyer], _amountOfTokens);
        
        // Tells the contract that the buyer doesn't deserve dividends for the tokens before they owned them;
        //really i know you think you do but you don't

        //int256 _updatedPayouts = (int256) ((profitPerShare_ * _amountOfTokens) - _fee);
        payoutsTo_[buyer] += (int256) ((profitPerShare_ * _amountOfTokens) - _fee);
        
        // fire event
        emit S3DEvents.onTokenPurchase(buyer, _incomingSeele, _amountOfTokens, _referredBy);
        
        return _amountOfTokens;
    }

    //NEW FUNCTION        
    function escapeTokens(address sellerAddress, uint256 _amountOfTokens) 
        onlyBagholders(sellerAddress) 
        onlyIfWhitelisted(msg.sender)
        public 
        returns(uint256)
    {
        // setup data
        address _customerAddress = sellerAddress;

        // russian hackers BTFO
        require(_amountOfTokens <= tokenBalanceLedger_[_customerAddress]);
        uint256 _tokens = _amountOfTokens;

        // add the sold tokens to escape tokens
        tokenSupply_ = SafeMath.sub(tokenSupply_, _tokens);
        escapeTokenSuppley_ = SafeMath.add(escapeTokenSuppley_, _tokens);
        tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _tokens);
        escapeTokenBalance_[_customerAddress] = SafeMath.add(escapeTokenBalance_[_customerAddress], _tokens);
   
        // update dividends tracker
        // take you token dividends
        int256 _updatedPayouts = (int256) (profitPerShare_ * _tokens);
        payoutsTo_[_customerAddress] -= _updatedPayouts;       

        // fire event
        emit S3DEvents.onTokenEscape(_customerAddress, _tokens);
        return _tokens;
    }

    //套利
    function arbitrageTokens(address sellerAddress,  uint256 _amountOfTokens) 
        onlyIfWhitelisted(msg.sender)
        public
        returns(uint256)
    {
        require(_amountOfTokens <= getPricedTokenAmount());
        
        // setup data
        address _customerAddress = sellerAddress;
        
        // TokenDealerInterface escapeContract = TokenDealerInterface(sellTokenAddress);
        // uint256 _tokens = escapeContract.escapeTokens(_customerAddress, _amountOfTokens);
        // require(_tokens == _amountOfTokens);

        // russian hackers BTFO
        uint256 _seeleAmount = s3dToBuyTokens_(_amountOfTokens);
        require(_seeleAmount <= totalBalance());        

        uint256 _dividends = SafeMath.div(_seeleAmount, dividendFee_);
        uint256 _taxedSeele = SafeMath.sub(_seeleAmount, _dividends);
        
        // burn the sold tokens
        //tokenSupply_ = SafeMath.sub(tokenSupply_, _tokens);
        //tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _tokens);

        // add escape tokens to oversell
        overSellTokenAmount_ = SafeMath.add(overSellTokenAmount_, _amountOfTokens);
        overSellTokenBalance_[_customerAddress] = SafeMath.add(overSellTokenBalance_[_customerAddress], _amountOfTokens);

             
        // dividing by zero is a bad idea
        uint256 dividendTokenAmount_ =  getDividendTokenAmount();
        if (dividendTokenAmount_ > 0) {
            // update the amount of dividends per token
            profitPerShare_ = SafeMath.add(profitPerShare_, (_dividends * magnitude) / dividendTokenAmount_);
        }
        
        // lambo delivery service
        //_customerAddress.transfer(_taxedEthereum);
        OMGTokenInterface(OMGTokenAddress).transfer(_customerAddress, _taxedSeele);

        // fire event
        emit S3DEvents.onTokenArbitrage(_customerAddress, _amountOfTokens, _taxedSeele);
        return _taxedSeele;
    }
}