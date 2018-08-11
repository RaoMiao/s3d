pragma solidity ^0.4.24;

interface TokenRegistryInterface {
    function registerToken(
        address addr,
        string  symbol
        )
        external;

    function unregisterToken(
        address addr,
        string  symbol
        )
        external;

    function getAddressBySymbol(
        string symbol
        )
        external
        view
        returns (address);

    function isTokenRegisteredBySymbol(
        string symbol
        )
        public
        view
        returns (bool);

    function isTokenRegistered(
        address addr
        )
        public
        view
        returns (bool);
}