pragma solidity ^0.4.21;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "zeppelin-solidity/contracts/access/Whitelist.sol";
import "../contracts/interface/TokenDealerInterface.sol";
import "./S3Devents.sol";
import "./SeeleDividendsToEth.sol";
import "./S3DTokenBase.sol";


contract EthDealer is Claimable, Whitelist, S3DEvents, S3DTokenBase{

    // ensures that the first tokens in the contract will be equally distributed
    // meaning, no divine dump will be ever possible
    // result: healthy longevity.
    modifier antiEarlyWhale(address _buyer, uint256 _amountOfBuyToken){
        address _customerAddress = _buyer;
        
        // are we still in the vulnerable phase?
        // if so, enact anti early whale protocol 
        if( onlyAmbassadors && ((totalBalance() - _amountOfBuyToken) <= ambassadorQuota )){
            require(
                // is the customer in the ambassador list?
                ambassadors[_customerAddress] == true &&
                
                // does the customer purchase exceed the max ambassador quota?
                (ambassadorAccumulatedQuota[_customerAddress] + _amountOfBuyToken) <= ambassadorMaxPurchase
                
            );
            
            // updated the accumulated quota    
            ambassadorAccumulatedQuota[_customerAddress] = SafeMath.add(ambassadorAccumulatedQuota[_customerAddress], _amountOfBuyToken);
        
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
    string public name = "Eth-S3D";
    string public symbol = "Eth-S3D";


    // ambassador program
    mapping(address => bool) internal ambassadors;
    uint256 constant internal ambassadorMaxPurchase = 1 ether;
    uint256 constant internal ambassadorQuota = 20 ether;
    

    /*=======================================
    =            PUBLIC FUNCTIONS            =
    =======================================*/
    /*
    * -- APPLICATION ENTRY POINTS --  
    */
    function EthDealer()
        public
    {
        tokenPriceInitial = 0.0000001 ether;
        tokenPriceIncremental = 0.00000001 ether;

        // add the ambassadors here.
        // mantso - lead solidity dev & lead web dev. 
        ambassadors[0xCd16575A90eD9506BCf44C78845d93F1b647F48C] = true;
    }
    
    /**
     * Converts all incoming ethereum to tokens for the caller, and passes down the referral addy (if any)
     */
    function buy(address _buyer, uint _amountTokens, address _referredBy)
        public
        payable
        onlyIfWhitelisted(msg.sender)
        returns(uint256)
    {
        purchaseTokens(_buyer, msg.value, _referredBy);
    }
    
    /**
     * Fallback function to handle ethereum that was send straight to the contract
     * Unfortunately we cannot use a referral address this way.
     */
    function()
        public
        payable
    {
        //purchaseTokens(msg.value, 0x0);
    }
    
    /**
     * Converts all of caller's dividends to tokens.
     */
    //将当前所有分红拿去再投资
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
    function reinvest(address _buyer, uint _buyAmount)
        public
        onlyStronghands(_buyer)
        onlyIfWhitelisted(msg.sender)
    {
        // fetch dividends
        uint256 _dividends = dividendsOf(_buyer); // retrieve ref. bonus later in the code
        uint256 _referralBalance = referralBalance[_buyer];
        require(_buyAmount <= (_dividends + _referralBalance));

        if (_buyAmount <= _dividends) {
            // pay out the dividends virtually
            payoutsTo[_buyer] +=  (int256)(_buyAmount * magnitude);
        } else {
            // retrieve ref. bonus
            payoutsTo[_buyer] +=  (int256) (_dividends * magnitude);
            referralBalance[_buyer] = SafeMath.sub(referralBalance[_buyer], _buyAmount - _dividends);
        }
                
        // dispatch a buy order with the virtualized "withdrawn dividends"
        uint256 _tokens = purchaseTokens(_buyer, _buyAmount, 0x0);
        
        // fire event
        emit S3DEvents.onReinvestment(_buyer, _buyAmount, _tokens);
    }

    
    /**
     * Alias of sell() and withdraw().
    */
    //卖出所有的token 并且提出所有的币
    function exit(address _buyer)
        public
        onlyIfWhitelisted(msg.sender)
    {
        // get token count for caller & sell them all
        uint256 _tokens = tokenBalanceLedger[_buyer];
        if(_tokens > 0) 
            sell(_buyer, _tokens);
        
        // lambo delivery service
        withdrawAll(_buyer);
    }

    /**
     * Withdraws all of the callers earnings.
     */
    function withdrawAll(address _buyer)
        public
        onlyStronghands(_buyer)
        onlyIfWhitelisted(msg.sender)
    {
        // setup data
        address _customerAddress = _buyer;
        uint256 _dividends = dividendsOf(_customerAddress); // get ref. bonus later in the code
        
        // update dividend tracker
        payoutsTo[_customerAddress] +=  (int256) (_dividends * magnitude);
        
        // add ref. bonus
        _dividends += referralBalance[_customerAddress];
        referralBalance[_customerAddress] = 0;
        
        // lambo delivery service
        _customerAddress.transfer(_dividends);
        
        // fire event
        emit S3DEvents.onWithdraw(_customerAddress, _dividends);
    }
    
    function withdraw(address _buyer, uint256 _withdrawAmount)
        public
        onlyStronghands(_buyer)
        onlyIfWhitelisted(msg.sender)
    {
        // setup data
        uint256 _dividends = dividendsOf(_buyer); // get ref. bonus later in the code
        uint256 _referralBalance = referralBalance[_buyer];
        require(_withdrawAmount <= (_dividends + _referralBalance));

        if (_withdrawAmount <= _dividends) {
            // pay out the dividends virtually
            payoutsTo[_buyer] +=  (int256)(_withdrawAmount * magnitude);
        } else {
            // retrieve ref. bonus
            payoutsTo[_buyer] +=  (int256) (_dividends * magnitude);
            referralBalance[_buyer] = SafeMath.sub(referralBalance[_buyer], SafeMath.sub(_withdrawAmount,_dividends));
        }
          
        // lambo delivery service
        _buyer.transfer(_withdrawAmount);
        
        // fire event
        emit S3DEvents.onWithdraw(_buyer, _withdrawAmount);
    }
    /**
     * Liquifies tokens to ethereum.
     */
    function sell(address _seller, uint256 _amountOfTokens)
        public
        onlyBagholders(_seller)
        onlyIfWhitelisted(msg.sender)
    {
        // setup data
        address _customerAddress = _seller;
        // russian hackers BTFO
        require(_amountOfTokens <= tokenBalanceLedger[_customerAddress]);
        uint256 _tokens = _amountOfTokens;
        uint256 _ethereum = s3dToBuyTokens(_tokens);
        uint256 _dividends = SafeMath.div(_ethereum, dividendFee);
        uint256 _taxedEthereum = SafeMath.sub(_ethereum, _dividends);
        
        // burn the sold tokens
        tokenSupply = SafeMath.sub(tokenSupply, _tokens);
        tokenBalanceLedger[_customerAddress] = SafeMath.sub(tokenBalanceLedger[_customerAddress], _tokens);
        
        // update dividends tracker
        int256 _updatedPayouts = (int256) (profitPerShare * _tokens + (_taxedEthereum * magnitude));
        payoutsTo[_customerAddress] -= _updatedPayouts;       

        //SeeleDividendsToEth(seeleDividendsToEthContractAddress).updatePayouts(_customerAddress, _tokens);

        // dividing by zero is a bad idea
        uint256 _dividendTokenAmount =  getDividendTokenAmount();
        if (_dividendTokenAmount > 0) {
            // update the amount of dividends per token
            profitPerShare = SafeMath.add(profitPerShare, (_dividends * magnitude) / _dividendTokenAmount);
        }
        
        // fire event
        emit S3DEvents.onTokenSell(_customerAddress, _tokens, _taxedEthereum);
    }

    
    /*----------  ADMINISTRATOR ONLY FUNCTIONS  ----------*/
    /**
     * In case the amassador quota is not met, the administrator can manually disable the ambassador phase.
     */
    function disableInitialStage()
        public
        onlyOwner()
    {
        onlyAmbassadors = false;
    }
    
    
    /*----------  HELPERS AND CALCULATORS  ----------*/
    /**
     * Method to view the current Ethereum stored in the contract
     * Example: totalEthereumBalance()
     */
    function totalBalance()
        public
        view
        returns(uint)
    {
        return address(this).balance;
    }

    
    // /**
    //  * Retrieve the dividends owned by the caller.
    //  * If `_includeReferralBonus` is to to 1/true, the referral bonus will be included in the calculations.
    //  * The reason for this, is that in the frontend, we will want to get the total divs (global + ref)
    //  * But in the internal calculations, we want them separate. 
    //  */ 
    // function myDividends(address myAddress, bool _includeReferralBonus) 
    //     public 
    //     view 
    //     returns(uint256)
    // {
    //     address _customerAddress = myAddress;
    //     return _includeReferralBonus ? dividendsOf(_customerAddress) + referralBalance_[_customerAddress] : dividendsOf(_customerAddress) ;
    // }
    


    /*==========================================
    =            INTERNAL FUNCTIONS            =
    ==========================================*/
    function purchaseTokens(address _buyer, uint256 _incomingEthereum, address _referredBy)
        internal
        antiEarlyWhale(_buyer, _incomingEthereum)
        returns(uint256)
    {
        // data setup
        //address _customerAddress = buyer;
        uint256 _undividedDividends = SafeMath.div(_incomingEthereum, dividendFee);
        uint256 _referralBonus = SafeMath.div(_undividedDividends, 3);
        uint256 _dividends = SafeMath.sub(_undividedDividends, _referralBonus);
        uint256 _taxedEthereum = SafeMath.sub(_incomingEthereum, _undividedDividends);
        uint256 _amountOfTokens = buyTokensToS3d(_taxedEthereum);
        uint256 _fee = _dividends * magnitude;
 
        // no point in continuing execution if OP is a poorfag russian hacker
        // prevents overflow in the case that the pyramid somehow magically starts being used by everyone in the world
        // (or hackers)
        // and yes we know that the safemath function automatically rules out the "greater then" equasion.
        require(_amountOfTokens > 0 && (SafeMath.add(_amountOfTokens, tokenSupply) > tokenSupply));
        
        // is the user referred by a masternode?
        if(
            // is this a referred purchase?
            _referredBy != 0x0000000000000000000000000000000000000000 &&

            // no cheating!
            _referredBy != _buyer 
        ){
            // wealth redistribution
            referralBalance[_referredBy] = SafeMath.add(referralBalance[_referredBy], _referralBonus);
        } else {
            // no ref purchase
            // add the referral bonus back to the global dividends cake
            _dividends = SafeMath.add(_dividends, _referralBonus);
            _fee = _dividends * magnitude;
        }
        
        // we can't give people infinite ethereum
        if(tokenSupply > 0){
            
            // add tokens to the pool
            tokenSupply = SafeMath.add(tokenSupply, _amountOfTokens);
 
            //uint256 dividendTokenAmount_ =  getDividendTokenAmount();

            // take the amount of dividends gained through this transaction, and allocates them evenly to each shareholder
            profitPerShare += (_dividends * magnitude / (getDividendTokenAmount()));
            
            // calculate the amount of tokens the customer receives over his purchase 
            _fee = _fee - (_fee - (_amountOfTokens * (_dividends * magnitude / (getDividendTokenAmount()))));
        
        } else {
            // add tokens to the pool
            tokenSupply = _amountOfTokens;
        }
        
        // update circulating supply & the ledger address for the customer
        tokenBalanceLedger[_buyer] = SafeMath.add(tokenBalanceLedger[_buyer], _amountOfTokens);
        
        // Tells the contract that the buyer doesn't deserve dividends for the tokens before they owned them;
        //really i know you think you do but you don't
        //int256 _updatedPayouts = (int256) ((profitPerShare_ * _amountOfTokens) - _fee);
        payoutsTo[_buyer] += (int256) ((profitPerShare * _amountOfTokens) - _fee);
        
        // fire event
        emit S3DEvents.onTokenPurchase(_buyer, _incomingEthereum, _amountOfTokens, _referredBy);
        
        return _amountOfTokens;
    }

    //NEW FUNCTION        
    function escapeTokens(address _sellerAddress, uint256 _amountOfTokens) 
             public 
             onlyBagholders(_sellerAddress) 
             onlyIfWhitelisted(msg.sender)
             returns(uint256)
    {
        // setup data
        address _customerAddress = _sellerAddress;

        // russian hackers BTFO
        require(_amountOfTokens <= tokenBalanceLedger[_customerAddress]);
        uint256 _tokens = _amountOfTokens;

        // add the sold tokens to escape tokens
        tokenSupply = SafeMath.sub(tokenSupply, _tokens);
        escapeTokenSuppley = SafeMath.add(escapeTokenSuppley, _tokens);
        tokenBalanceLedger[_customerAddress] = SafeMath.sub(tokenBalanceLedger[_customerAddress], _tokens);
        escapeTokenBalance[_customerAddress] = SafeMath.add(escapeTokenBalance[_customerAddress], _tokens);
   
        // update dividends tracker
        // take you token dividends
        int256 _updatedPayouts = (int256) (profitPerShare * _tokens);
        payoutsTo[_customerAddress] -= _updatedPayouts;       

        //SeeleDividendsToEth(seeleDividendsToEthContractAddress).updatePayouts(_customerAddress, _tokens);

        // fire event
        emit S3DEvents.onTokenEscape(_customerAddress, _tokens);
        return _tokens;
    }

    function arbitrageTokens(address _sellerAddress, uint256 _amountOfTokens) 
        public 
        onlyIfWhitelisted(msg.sender)
        returns(uint256)
    {
        require(_amountOfTokens <= getPricedTokenAmount());
        
        // setup data
        address _customerAddress = _sellerAddress;
        
        // TokenDealerInterface escapeContract = TokenDealerInterface(sellTokenAddress);
        // uint256 _tokens = escapeContract.escapeTokens(_customerAddress, _amountOfTokens);
        // require(_tokens == _amountOfTokens);

        // russian hackers BTFO
        uint256 ethereum_ = s3dToBuyTokens(_amountOfTokens);
        require(ethereum_ <= totalBalance());

        uint256 dividends_ = SafeMath.div(ethereum_, dividendFee);
        uint256 taxedEthereum_ = SafeMath.sub(ethereum_, dividends_);
        
        // burn the sold tokens
        //tokenSupply_ = SafeMath.sub(tokenSupply_, _tokens);
        //tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _tokens);

        // add escape tokens to oversell
        overSellTokenAmount = SafeMath.add(overSellTokenAmount, _amountOfTokens);
        overSellTokenBalance[_customerAddress] = SafeMath.add(overSellTokenBalance[_customerAddress], _amountOfTokens);

             
        // dividing by zero is a bad idea
        uint256 dividendTokenAmount_ =  getDividendTokenAmount();
        if (dividendTokenAmount_ > 0) {
            // update the amount of dividends per token
            profitPerShare = SafeMath.add(profitPerShare, (dividends_ * magnitude) / dividendTokenAmount_);
        }
        
        // lambo delivery service
        _customerAddress.transfer(taxedEthereum_);

        // fire event
        emit S3DEvents.onTokenArbitrage(_customerAddress, _amountOfTokens, taxedEthereum_);
        return taxedEthereum_;
    }
}
