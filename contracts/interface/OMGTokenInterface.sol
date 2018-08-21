pragma solidity ^0.4.24;

interface OMGTokenInterface{
  function transfer(address _to, uint _value) external;

  function transferFrom(address _from, address _to, uint _value) external;

  function balanceOf(address who) external constant returns (uint);
}