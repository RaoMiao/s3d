import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "zeppelin-solidity/contracts/access/Whitelist.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../contracts/interface/TokenDealerInterface.sol";

contract SeeleDividendsToEth is Claimable, Whitelist{
    mapping(address => int256) internal payoutsTo_;
    uint256 internal profitPerShare_;

    address public seeleTokenAddress = 0x47879ac781938CFfd879392Cd2164b9F7306188a;
    address public ethDealerAddress = 0x47879ac781938CFfd879392Cd2164b9F7306188a;
    uint256 constant internal magnitude = 2**64;

    event onWithdraw(
        address indexed customerAddress,
        uint256 seeleWithdrawn
    );

    // only people with profits
    modifier onlyStronghands(address myAddress) {
        require(dividendsOf(myAddress) > 0);
        _;
    }

    function SeeleDividendsToEth(address tokenAddress)
        public
    {
        seeleTokenAddress = tokenAddress;   
    }

    function setEthDealerAddress(address ethAddress)
        public
        onlyOwner()
    {
        ethDealerAddress = ethAddress;
    }


    function AddDividends(uint256 seeleAmount) 
        public
       // onlyIfWhitelisted(msg.sender)
    {
        TokenDealerInterface ethDealerContract = TokenDealerInterface(ethDealerAddress);
        require(ethDealerContract != address(0));

        uint256 dividendTokenAmount_ =  ethDealerContract.totalSupply();
        if (dividendTokenAmount_ > 0) {
            // update the amount of dividends per token
            profitPerShare_ = SafeMath.add(profitPerShare_, (seeleAmount * magnitude) / dividendTokenAmount_);
        }
    }

    function updatePayouts(address userAddress, uint tokens)
        public 
        //onlyIfWhitelisted(msg.sender)       
    {
        int256 _updatedPayouts = (int256) (profitPerShare_ * tokens);
        payoutsTo_[userAddress] -= _updatedPayouts;       
    }

    function dividendsOf(address userAddress)
        public
        view
        returns (uint256)
    {
        TokenDealerInterface ethDealerContract = TokenDealerInterface(ethDealerAddress);
        require(ethDealerContract != address(0));

        uint256 tokenBalance = ethDealerContract.balanceOf(userAddress);
        return (uint256) ((int256)(profitPerShare_ * tokenBalance) - payoutsTo_[userAddress]) / magnitude;        
    }

    function withdraw(address userAddress)
        onlyStronghands(userAddress)
        //onlyIfWhitelisted(msg.sender)
        public
    {
        // setup data
        address _customerAddress = userAddress;
        uint256 _dividends = dividendsOf(_customerAddress); // get ref. bonus later in the code
        
        // update dividend tracker
        payoutsTo_[_customerAddress] +=  (int256) (_dividends * magnitude);
        
        
        // lambo delivery service
        //_customerAddress.transfer(_dividends);
        ERC20(seeleTokenAddress).transfer(_customerAddress, _dividends);
        
        // fire event
        emit onWithdraw(_customerAddress, _dividends);
    }
}