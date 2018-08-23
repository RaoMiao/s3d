pragma solidity ^0.4.24;

contract S3DEvents {
    event onTokenPurchase(
        address indexed customerAddress,
        uint256 incomingTokens,
        uint256 s3dMinted,
        address indexed referredBy
    );
    
    event onTokenSell(
        address indexed customerAddress,
        uint256 s3dBurned,
        uint256 tokenEarned
    );

    event onReinvestment(
        address indexed customerAddress,
        uint256 tokenReinvested,
        uint256 s3dMinted
    );
    
    event onWithdraw(
        address indexed customerAddress,
        uint256 tokenWithdrawn
    );

    event onTokenEscape(
        address indexed customerAddress,
        uint256 s3dEscaped
    );

    event onTokenArbitrage(
        address indexed customerAddress,
        uint256 s3dBurned,
        uint256 tokenEarned
    );

}