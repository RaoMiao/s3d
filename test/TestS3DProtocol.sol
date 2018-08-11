pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/S3DProtocol.sol";

contract TestS3DProtocol{
    // function testEthBuy() {
    //     S3DProtocol protocol = S3DProtocol(DeployedAddresses.S3DProtocol());
            
    //     uint expected = 100;

    //     Assert.equal(protocol.ethBuy("eth", 0), expected, "ethBuy errpr");
    // }

    function tsetSeeleBuy() {
        S3DProtocol protocol = S3DProtocol(DeployedAddresses.S3DProtocol());
            
        uint expected = 200;

        Assert.equal(protocol.tokenBuy("seele", 200, 0), expected, "tokenBuy errpr");
    }
}
