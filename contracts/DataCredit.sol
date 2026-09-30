// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DataCredit
 * @notice ERC20 utility token enabling satellite operators to purchase access
 * to proprietary or high-precision orbital ephemeris records.
 */
contract DataCredit is ERC20, Ownable {
    constructor() ERC20("Orbit Data Credit", "ODC") Ownable(msg.sender) {
        // Mint 1,000,000 ODC (with 18 decimals) to the deployer for consortium allocation
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    /**
     * @notice Allows the contract owner to allocate additional tokens for demonstration purposes
     * @param to Recipient address
     * @param amount Token amount in wei units
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
