pragma solidity ^0.4.21;


import "zeppelin-solidity/contracts/ownership/Claimable.sol";


contract S3DProtocol is Ownable, Console{

    mapping(string => address) tokenDealerMap;

    function addDealer(string symbol, address dealerAddress) public onlyOwner{
        tokenDealerMap[symbol] = dealerAddress;
    }

    function sellTo(string fromSymbol, uint amountOfToken, string sellSymbol) public onlyOwner{
        address _customerAddress = msg.sender;
        TokenDealerInterface fromDealer = TokenDealerInterface(tokenDealerMap[fromSymbol]);
        TokenDealerInterface toDealer = TokenDealerInterface(tokenDealerMap[sellSymbol]);

        s3dAmount = fromDealer.freeTokens(msg.sender, amountOfToken);

        
    }
}