// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DebrisLedger
 * @notice Anchors Layer A block Merkle roots to Ethereum, verifies individual records
 * via on-chain SHA-256 Merkle proofs, and governs tokenized dataset access rights.
 */
contract DebrisLedger is Ownable {
    struct BlockAnchor {
        bytes32 merkleRoot;
        uint256 recordCount;
        uint256 blockTimestamp;
        uint256 anchoredAt;
        address anchoredBy;
    }

    IERC20 public dataCreditToken;
    uint256 public accessFee; // e.g. 100 * 10^18 ODC

    mapping(uint256 => BlockAnchor) public anchors;
    mapping(address => bool) public authorizedOperators;
    // blockIndex => buyer => hasAccess
    mapping(uint256 => mapping(address => bool)) public blockAccess;

    event RootAnchored(
        uint256 indexed blockIndex,
        bytes32 indexed merkleRoot,
        uint256 recordCount,
        uint256 blockTimestamp,
        address indexed anchoredBy
    );
    event OperatorUpdated(address indexed operator, bool authorized);
    event AccessPurchased(uint256 indexed blockIndex, address indexed buyer, address indexed publisher);
    event AccessFeeUpdated(uint256 newFee);
    event DataCreditTokenUpdated(address indexed token);

    error UnauthorizedOperator();
    error BlockAlreadyAnchored(uint256 blockIndex);
    error BlockNotAnchored(uint256 blockIndex);
    error PaymentFailed();
    error ZeroAddress();

    modifier onlyOperator() {
        if (!authorizedOperators[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedOperator();
        }
        _;
    }

    constructor(address _dataCreditToken, uint256 _initialAccessFee) Ownable(msg.sender) {
        if (_dataCreditToken != address(0)) {
            dataCreditToken = IERC20(_dataCreditToken);
        }
        accessFee = _initialAccessFee;
        authorizedOperators[msg.sender] = true;
    }

    /**
     * @notice Grants or revokes operator anchoring permissions
     */
    function setOperator(address operator, bool authorized) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        authorizedOperators[operator] = authorized;
        emit OperatorUpdated(operator, authorized);
    }

    /**
     * @notice Updates the ERC20 token address used for data purchases
     */
    function setDataCreditToken(address token) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        dataCreditToken = IERC20(token);
        emit DataCreditTokenUpdated(token);
    }

    /**
     * @notice Updates the batch dataset access fee
     */
    function setAccessFee(uint256 fee) external onlyOwner {
        accessFee = fee;
        emit AccessFeeUpdated(fee);
    }

    /**
     * @notice Anchors a Layer A block Merkle root on-chain
     * @param blockIndex Height index of the block
     * @param root 32-byte SHA-256 Merkle root
     * @param recordCount Number of records in the block
     * @param blockTimestamp Epoch timestamp of block creation in seconds
     */
    function anchorRoot(
        uint256 blockIndex,
        bytes32 root,
        uint256 recordCount,
        uint256 blockTimestamp
    ) external onlyOperator {
        if (anchors[blockIndex].anchoredAt != 0) {
            revert BlockAlreadyAnchored(blockIndex);
        }

        anchors[blockIndex] = BlockAnchor({
            merkleRoot: root,
            recordCount: recordCount,
            blockTimestamp: blockTimestamp,
            anchoredAt: block.timestamp,
            anchoredBy: msg.sender
        });

        emit RootAnchored(blockIndex, root, recordCount, blockTimestamp, msg.sender);
    }

    /**
     * @notice Verifies an orbital record on-chain using a SHA-256 Merkle sibling proof.
     * Computes running SHA-256 hashes matching Layer A pairing rules via native EVM sha256().
     * This is a view function: zero gas cost when called via eth_call.
     * @param blockIndex Anchored block index to verify against
     * @param leafHash 32-byte SHA-256 hash of the target orbital record
     * @param proof Array of 32-byte sibling hashes
     * @param leafIndex Zero-based index of the leaf in the block
     * @return isValid True if the proof evaluates to the anchored root
     */
    function verifyRecord(
        uint256 blockIndex,
        bytes32 leafHash,
        bytes32[] calldata proof,
        uint256 leafIndex
    ) external view returns (bool isValid) {
        BlockAnchor memory anchor = anchors[blockIndex];
        if (anchor.anchoredAt == 0) {
            revert BlockNotAnchored(blockIndex);
        }

        bytes32 current = leafHash;
        uint256 currentIndex = leafIndex;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 sibling = proof[i];
            if ((currentIndex & 1) == 1) {
                // Current is right child, sibling is left child
                current = sha256(abi.encodePacked(sibling, current));
            } else {
                // Current is left child, sibling is right child
                current = sha256(abi.encodePacked(current, sibling));
            }
            currentIndex >>= 1;
        }

        return current == anchor.merkleRoot;
    }

    /**
     * @notice Allows an operator to purchase access to a proprietary block batch
     * using DataCredit ERC20 tokens via approve/transferFrom.
     * @param blockIndex Target block height
     * @param publisher Address of the publishing operator receiving the access fee
     */
    function buyAccess(uint256 blockIndex, address publisher) external {
        if (anchors[blockIndex].anchoredAt == 0) {
            revert BlockNotAnchored(blockIndex);
        }
        if (publisher == address(0)) revert ZeroAddress();

        bool success = dataCreditToken.transferFrom(msg.sender, publisher, accessFee);
        if (!success) revert PaymentFailed();

        blockAccess[blockIndex][msg.sender] = true;

        emit AccessPurchased(blockIndex, msg.sender, publisher);
    }

    /**
     * @notice Checks if an address has access to a block's proprietary records
     */
    function hasAccess(uint256 blockIndex, address operator) external view returns (bool) {
        return blockAccess[blockIndex][operator] || authorizedOperators[operator] || operator == owner();
    }
}
