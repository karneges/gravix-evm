// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./GravixMarketPositions.sol";
import "./GravixStorage.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

abstract contract GravixBase is GravixStorage {
    using ECDSA for bytes32;

    modifier checkSign(uint _assetPrice, uint _timestamp, uint _marketIdx, bytes memory _signature) {
        require(_checkSign(_assetPrice, _timestamp, _marketIdx, _signature), "Invalid signature");
        _;
    }

    function _checkSign(
        uint _price,
        uint _timestamp,
        uint _marketIdx,
        bytes memory _signature
    ) internal view returns(bool) {

        return keccak256(
            abi.encodePacked(_price, _timestamp, _marketIdx)
        ).toEthSignedMessageHash().recover(_signature) == priceNode;
    }
    function getDetails() public view returns (Details memory)  {
        return Details({
            priceNode: priceNode,
            usdt: address(usdt),
            stgUsdt: address(stgUsdt),
            treasuries: treasuries,
            poolAssets: poolAssets,
            insuranceFunds: insuranceFund,
            insuranceFundOverflowDistributionSchema:insuranceFundOverflowDistributionSchema,
            collateralReserve: collateralReserve,
            totalNOI: totalNOI,
            totalNOILimitEnabled:totalNOILimitEnabled,
            maxPoolUtilRatio: maxPoolUtilRatio,
            maxPnlRate: maxPnlRate,
            minPositionCollateral: minPositionCollateral,
            paused: paused,
            liquidation: liquidationParams,
            openFeeDistributionSchema: openFeeDistributionSchema,
            closeFeeDistributionSchema: closeFeeDistributionSchema,
            marketCount: marketCount
        });
    }
}
