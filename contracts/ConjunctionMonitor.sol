// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AlertCertificate.sol";

/**
 * @title ConjunctionMonitor
 * @notice Receives propagated 3D Cartesian coordinates (in integer metres) from off-chain
 * astrodynamics oracles, calculates squared Euclidean distance, validates against a screening
 * threshold, logs conjunction alerts, and mints ERC721 safety certificates.
 */
contract ConjunctionMonitor is Ownable {
    struct ConjunctionAlert {
        uint256 object1Id;
        uint256 object2Id;
        uint256 epoch;
        uint256 missDistanceMetres;
        uint256 thresholdMetres;
        uint256 timestamp;
        address reportedBy;
        uint256 certificateTokenId;
    }

    uint256 public squaredThresholdMetres;
    IAlertCertificate public certificateContract;

    mapping(address => bool) public authorizedOracles;
    // alertId = keccak256(min(obj1, obj2), max(obj1, obj2), epoch) => Alert
    mapping(bytes32 => ConjunctionAlert) public alerts;

    event ConjunctionDetected(
        bytes32 indexed alertId,
        uint256 indexed object1Id,
        uint256 indexed object2Id,
        uint256 missDistanceMetres,
        uint256 certificateTokenId,
        uint256 epoch
    );
    event OracleUpdated(address indexed oracle, bool authorized);
    event ThresholdUpdated(uint256 newThresholdMetres, uint256 newSquaredThreshold);
    event CertificateContractUpdated(address indexed newCertificateContract);

    error UnauthorizedOracle();
    error ConjunctionAlreadyReported(bytes32 alertId);
    error DistanceExceedsThreshold(uint256 distanceSquared, uint256 thresholdSquared);
    error ZeroAddress();

    modifier onlyOracle() {
        if (!authorizedOracles[msg.sender] && msg.sender != owner()) {
            revert UnauthorizedOracle();
        }
        _;
    }

    constructor(address _certificateContract, uint256 _initialThresholdMetres) Ownable(msg.sender) {
        if (_certificateContract != address(0)) {
            certificateContract = IAlertCertificate(_certificateContract);
        }
        squaredThresholdMetres = _initialThresholdMetres * _initialThresholdMetres;
        authorizedOracles[msg.sender] = true;
    }

    /**
     * @notice Grants or revokes oracle reporting permissions
     */
    function setOracle(address oracle, bool authorized) external onlyOwner {
        if (oracle == address(0)) revert ZeroAddress();
        authorizedOracles[oracle] = authorized;
        emit OracleUpdated(oracle, authorized);
    }

    /**
     * @notice Updates the AlertCertificate contract instance
     */
    function setCertificateContract(address certContract) external onlyOwner {
        if (certContract == address(0)) revert ZeroAddress();
        certificateContract = IAlertCertificate(certContract);
        emit CertificateContractUpdated(certContract);
    }

    /**
     * @notice Updates the screening distance threshold in metres
     * @param thresholdMetres Maximum allowable miss distance for alert certification
     */
    function setThreshold(uint256 thresholdMetres) external onlyOwner {
        squaredThresholdMetres = thresholdMetres * thresholdMetres;
        emit ThresholdUpdated(thresholdMetres, squaredThresholdMetres);
    }

    /**
     * @notice Returns current threshold in metres
     */
    function getThresholdMetres() external view returns (uint256) {
        return sqrt(squaredThresholdMetres);
    }

    /**
     * @notice Submits candidate conjunction data derived from SGP4 propagation.
     * Computes integer squared Euclidean distance and mints certificate if within threshold.
     * Rejects duplicate submissions for identical object pairs at identical epochs.
     * @param obj1 NORAD catalog ID of first object
     * @param obj2 NORAD catalog ID of second object
     * @param epoch Conjunction timestamp (Unix epoch in seconds)
     * @param pos1 3D Cartesian coordinates [X, Y, Z] in integer metres
     * @param pos2 3D Cartesian coordinates [X, Y, Z] in integer metres
     */
    function reportConjunction(
        uint256 obj1,
        uint256 obj2,
        uint256 epoch,
        int64[3] calldata pos1,
        int64[3] calldata pos2
    ) external onlyOracle returns (bytes32 alertId, uint256 tokenId) {
        alertId = keccak256(abi.encodePacked(
            obj1 < obj2 ? obj1 : obj2,
            obj1 < obj2 ? obj2 : obj1,
            epoch
        ));
        if (alerts[alertId].timestamp != 0) {
            revert ConjunctionAlreadyReported(alertId);
        }

        (uint256 distSquared, uint256 missDistance) = computeDistance(pos1, pos2);
        if (distSquared > squaredThresholdMetres) {
            revert DistanceExceedsThreshold(distSquared, squaredThresholdMetres);
        }

        uint256 thresholdMetres = sqrt(squaredThresholdMetres);

        if (address(certificateContract) != address(0)) {
            tokenId = certificateContract.mintCertificate(
                msg.sender,
                obj1,
                obj2,
                epoch,
                missDistance,
                thresholdMetres
            );
        }

        alerts[alertId] = ConjunctionAlert({
            object1Id: obj1,
            object2Id: obj2,
            epoch: epoch,
            missDistanceMetres: missDistance,
            thresholdMetres: thresholdMetres,
            timestamp: block.timestamp,
            reportedBy: msg.sender,
            certificateTokenId: tokenId
        });

        emit ConjunctionDetected(alertId, obj1, obj2, missDistance, tokenId, epoch);
        return (alertId, tokenId);
    }

    /**
     * @notice Computes squared Euclidean distance and integer root
     */
    function computeDistance(
        int64[3] calldata p1,
        int64[3] calldata p2
    ) internal pure returns (uint256 distSquared, uint256 missDistance) {
        int256 dx = int256(p1[0]) - int256(p2[0]);
        int256 dy = int256(p1[1]) - int256(p2[1]);
        int256 dz = int256(p1[2]) - int256(p2[2]);
        distSquared = uint256(dx * dx + dy * dy + dz * dz);
        missDistance = sqrt(distSquared);
    }

    /**
     * @notice Computes integer square root using the Babylonian method
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
