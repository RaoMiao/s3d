pragma solidity ^0.4.24;

contract S3DEvents {
    event onTokenPurchase(
        address indexed customerAddress,
        uint256 incomingEthereum,
        uint256 tokensMinted,
        address indexed referredBy
    );
    
    event onTokenSell(
        address indexed customerAddress,
        uint256 tokensBurned,
        uint256 ethereumEarned
    );

    event onReinvestment(
        address indexed customerAddress,
        uint256 ethereumReinvested,
        uint256 tokensMinted
    );
    
    event onWithdraw(
        address indexed customerAddress,
        uint256 ethereumWithdrawn
    );

    event onTokenEscape(
        address indexed customerAddress,
        uint256 tokensEscaped
    );

    event onTokenArbitrage(
        address indexed customerAddress,
        uint256 tokensBurned,
        uint256 ethereumEarned
    );

}