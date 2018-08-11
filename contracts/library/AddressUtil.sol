pragma solidity 0.4.24;
/// @title Utility Functions for address
/// @author Daniel Wang - <daniel@loopring.org>
library AddressUtil {
    function isContract(
        address addr
        )
        internal
        view
        returns (bool)
    {
        if (addr == 0x0) {
            return false;
        } else {
            uint size;
            assembly { size := extcodesize(addr) }
            return size > 0;
        }
    }
}