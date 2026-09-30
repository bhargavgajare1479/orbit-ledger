// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IAlertCertificate {
    function mintCertificate(
        address to,
        uint256 obj1,
        uint256 obj2,
        uint256 epoch,
        uint256 missDistance,
        uint256 threshold
    ) external returns (uint256);
}

/**
 * @title AlertCertificate
 * @notice ERC721 non-fungible certificate minted exclusively upon verified orbital
 * conjunction events that fall within a defined screening threshold.
 */
contract AlertCertificate is ERC721Enumerable, Ownable, IAlertCertificate {
    struct Certificate {
        uint256 object1Id;
        uint256 object2Id;
        uint256 epoch;
        uint256 missDistanceMetres;
        uint256 thresholdMetres;
        address reportingOperator;
        uint256 timestamp;
    }

    uint256 private _nextTokenId = 1;
    address public conjunctionMonitorContract;

    mapping(uint256 => Certificate) public certificates;

    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 indexed object1Id,
        uint256 object2Id,
        uint256 missDistanceMetres,
        uint256 thresholdMetres,
        uint256 epoch
    );
    event MonitorContractUpdated(address indexed newMonitor);

    error OnlyConjunctionMonitorAllowed();
    error ZeroAddress();

    modifier onlyMonitor() {
        if (msg.sender != conjunctionMonitorContract) {
            revert OnlyConjunctionMonitorAllowed();
        }
        _;
    }

    constructor() ERC721("Orbit Conjunction Certificate", "OCC") Ownable(msg.sender) {}

    /**
     * @notice Designates the authorized ConjunctionMonitor contract permitted to mint certificates
     * @param monitor Address of the deployed ConjunctionMonitor contract
     */
    function setMonitorContract(address monitor) external onlyOwner {
        if (monitor == address(0)) revert ZeroAddress();
        conjunctionMonitorContract = monitor;
        emit MonitorContractUpdated(monitor);
    }

    /**
     * @notice Mints a new AlertCertificate to the reporting operator
     */
    function mintCertificate(
        address to,
        uint256 obj1,
        uint256 obj2,
        uint256 epoch,
        uint256 missDistance,
        uint256 threshold
    ) external onlyMonitor returns (uint256) {
        if (to == address(0)) revert ZeroAddress();
        uint256 tokenId = _nextTokenId++;

        certificates[tokenId] = Certificate({
            object1Id: obj1,
            object2Id: obj2,
            epoch: epoch,
            missDistanceMetres: missDistance,
            thresholdMetres: threshold,
            reportingOperator: to,
            timestamp: block.timestamp
        });

        _safeMint(to, tokenId);

        emit CertificateMinted(tokenId, to, obj1, obj2, missDistance, threshold, epoch);
        return tokenId;
    }

    /**
     * @notice Returns orbital metadata for a certificate token
     */
    function getCertificate(uint256 tokenId) external view returns (Certificate memory) {
        _requireOwned(tokenId);
        return certificates[tokenId];
    }
}
