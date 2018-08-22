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
    string public name = "Eth-S3D";
    string public symbol = "Eth-S3D";


    // ambassador program
    mapping(address => bool) internal ambassadors_;
    uint256 constant internal ambassadorMaxPurchase_ = 1 ether;
    uint256 constant internal ambassadorQuota_ = 20 ether;
    

    address public seeleDividendsToEthContractAddress = 0x47879ac781938CFfd879392Cd2164b9F7306188a;

    /*=======================================
    =            PUBLIC FUNCTIONS            =
    =======================================*/
    /*
    * -- APPLICATION ENTRY POINTS --  
    */
    function EthDealer()
        public
    {
        tokenPriceInitial_ = 0.0000001 ether;
        tokenPriceIncremental_ = 0.00000001 ether;

        // add the ambassadors here.
        // mantso - lead solidity dev & lead web dev. 
        ambassadors_[0xCd16575A90eD9506BCf44C78845d93F1b647F48C] = true;
    }
    
    function setSeeleDividendsToEthContractAddress(address dividendsAddress)
        public 
        onlyOwner()
    {
        seeleDividendsToEthContractAddress = dividendsAddress;
    }

    /**
     * Converts all incoming ethereum to tokens for the caller, and passes down the referral addy (if any)
     */
    function buy(address buyer, uint amountTokens, address _referredBy)
        public
        payable
        onlyIfWhitelisted(msg.sender)
        returns(uint256)
    {
        purchaseTokens(buyer, msg.value, _referredBy);
    }
    
    /**
     * Fallback function to handle ethereum that was send straight to the contract
     * Unfortunately we cannot use a referral address this way.
     */
    function()
        payable
        public
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
            // retrieve ref. bonus
            payoutsTo_[buyer] +=  (int256) (_dividends * magnitude);
            referralBalance_[buyer] = SafeMath.sub(referralBalance_[buyer], buyAmount - _dividends);
        }
                
        // dispatch a buy order with the virtualized "withdrawn dividends"
        uint256 _tokens = purchaseTokens(buyer, buyAmount, 0x0);
        
        // fire event
        emit S3DEvents.onReinvestment(buyer, buyAmount, _tokens);
    }

    
    /**
     * Alias of sell() and withdraw().
    */
    //卖出所有的token 并且提出所有的币
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
        _customerAddress.transfer(_dividends);
        
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
        buyer.transfer(withdrawAmount);
        
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
        uint256 _ethereum = s3dToBuyTokens_(_tokens);
        uint256 _dividends = SafeMath.div(_ethereum, dividendFee_);
        uint256 _taxedEthereum = SafeMath.sub(_ethereum, _dividends);
        
        // burn the sold tokens
        tokenSupply_ = SafeMath.sub(tokenSupply_, _tokens);
        tokenBalanceLedger_[_customerAddress] = SafeMath.sub(tokenBalanceLedger_[_customerAddress], _tokens);
        
        // update dividends tracker
        int256 _updatedPayouts = (int256) (profitPerShare_ * _tokens + (_taxedEthereum * magnitude));
        payoutsTo_[_customerAddress] -= _updatedPayouts;       

        //SeeleDividendsToEth(seeleDividendsToEthContractAddress).updatePayouts(_customerAddress, _tokens);

        // dividing by zero is a bad idea
        uint256 dividendTokenAmount_ =  getDividendTokenAmount();
        if (dividendTokenAmount_ > 0) {
            // update the amount of dividends per token
            profitPerShare_ = SafeMath.add(profitPerShare_, (_dividends * magnitude) / dividendTokenAmount_);
        }
        
        // fire event
        emit S3DEvents.onTokenSell(_customerAddress, _tokens, _taxedEthereum);
    }

    
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
    function purchaseTokens(address buyer, uint256 _incomingEthereum, address _referredBy)
        antiEarlyWhale(buyer, _incomingEthereum)
        internal
        returns(uint256)
    {
        // data setup
        //address _customerAddress = buyer;
        uint256 _undividedDividends = SafeMath.div(_incomingEthereum, dividendFee_);
        uint256 _referralBonus = SafeMath.div(_undividedDividends, 3);
        uint256 _dividends = SafeMath.sub(_undividedDividends, _referralBonus);
        uint256 _taxedEthereum = SafeMath.sub(_incomingEthereum, _undividedDividends);
        uint256 _amountOfTokens = buyTokensToS3d_(_taxedEthereum);
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
        emit S3DEvents.onTokenPurchase(buyer, _incomingEthereum, _amountOfTokens, _referredBy);
        
        return _amountOfTokens;
    }

    //NEW FUNCTION        
    function escapeTokens(address sellerAddress, uint256 _amountOfTokens) 
            onlyBagholders(sellerAddress) 
            onlyIfWhitelisted(msg.sender)
            public returns(uint256)
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

        //SeeleDividendsToEth(seeleDividendsToEthContractAddress).updatePayouts(_customerAddress, _tokens);

        // fire event
        emit S3DEvents.onTokenEscape(_customerAddress, _tokens);
        return _tokens;
    }

    function arbitrageTokens(address sellerAddress, uint256 _amountOfTokens) 
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
        uint256 _ethereum = s3dToBuyTokens_(_amountOfTokens);
        require(_ethereum <= totalBalance());

        uint256 _dividends = SafeMath.div(_ethereum, dividendFee_);
        uint256 _taxedEthereum = SafeMath.sub(_ethereum, _dividends);
        
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
        _customerAddress.transfer(_taxedEthereum);

        // fire event
        emit S3DEvents.onTokenArbitrage(_customerAddress, _amountOfTokens, _taxedEthereum);
        return _taxedEthereum;
    }
}
