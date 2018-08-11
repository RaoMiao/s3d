pragma solidity ^0.4.24;

import "zeppelin-solidity/contracts/ownership/Claimable.sol";
import "./library/AddressUtil.sol";

contract TokenRegistryImpl is Claimable {
    event TokenRegistered(
        address indexed addr,
        string          symbol
    );

    event TokenUnregistered(
        address indexed addr,
        string          symbol
    );

    using AddressUtil for address;
    address[] public addresses;
    mapping (address => TokenInfo) addressMap;
    mapping (string => address) symbolMap;
    struct TokenInfo {
        uint   pos;      // 0 mens unregistered; if > 0, pos + 1 is the
                         // token's position in `addresses`.
        string symbol;   // Symbol of the token
    }
    /// @dev Disable default function.
    function ()
        payable
        public
    {
        revert();
    }
    function registerToken(
        address addr,
        string  symbol
        )
        external
        onlyOwner
    {
        registerTokenInternal(addr, symbol);
    }
    function unregisterToken(
        address addr,
        string  symbol
        )
        external
        onlyOwner
    {
        require(addr != 0x0);
        require(symbolMap[symbol] == addr);
        delete symbolMap[symbol];
        uint pos = addressMap[addr].pos;
        require(pos != 0);
        delete addressMap[addr];
        // We will replace the token we need to unregister with the last token
        // Only the pos of the last token will need to be updated
        address lastToken = addresses[addresses.length - 1];
        // Don't do anything if the last token is the one we want to delete
        if (addr != lastToken) {
            // Swap with the last token and update the pos
            addresses[pos - 1] = lastToken;
            addressMap[lastToken].pos = pos;
        }
        addresses.length--;
        emit TokenUnregistered(addr, symbol);
    }

    function getAddressBySymbol(
        string symbol
        )
        external
        view
        returns (address)
    {
        return symbolMap[symbol];
    }
    function isTokenRegisteredBySymbol(
        string symbol
        )
        public
        view
        returns (bool)
    {
        return symbolMap[symbol] != 0x0;
    }
    function isTokenRegistered(
        address addr
        )
        public
        view
        returns (bool)
    {
        return addressMap[addr].pos != 0;
    }
    function getTokens(
        uint start,
        uint count
        )
        public
        view
        returns (address[] addressList)
    {
        uint num = addresses.length;
        if (start >= num) {
            return;
        }
        uint end = start + count;
        if (end > num) {
            end = num;
        }
        addressList = new address[](end - start);
        for (uint i = start; i < end; i++) {
            addressList[i - start] = addresses[i];
        }
    }
    function registerTokenInternal(
        address addr,
        string  symbol
        )
        internal
    {
        require(0x0 != addr);
        require(bytes(symbol).length > 0);
        require(0x0 == symbolMap[symbol]);
        require(0 == addressMap[addr].pos);
        addresses.push(addr);
        symbolMap[symbol] = addr;
        addressMap[addr] = TokenInfo(addresses.length, symbol);
        emit TokenRegistered(addr, symbol);
    }
}