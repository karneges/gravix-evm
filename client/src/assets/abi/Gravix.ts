export const GravixAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '_usdt',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_stgUsdt',
                type: 'address',
            },
            {
                internalType: 'address',
                name: '_priceNode',
                type: 'address',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'positionKey',
                type: 'uint256',
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'marketIdx',
                                type: 'uint256',
                            },
                            {
                                internalType: 'enum IGravix.PositionType',
                                name: 'positionType',
                                type: 'uint8',
                            },
                            {
                                internalType: 'uint256',
                                name: 'initialCollateral',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openFee',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'markPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'leverage',
                                type: 'uint256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'liquidationThresholdRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'createdAt',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Position',
                        name: 'position',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'positionSizeUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closePrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'borrowFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'fundingFee',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closeFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'liquidationPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'pnl',
                        type: 'int256',
                    },
                    {
                        internalType: 'bool',
                        name: 'liquidate',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'viewTime',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct IGravix.PositionView',
                name: 'positionView',
                type: 'tuple',
            },
        ],
        name: 'ClosePosition',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'debt',
                type: 'uint256',
            },
        ],
        name: 'Debt',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'InsuranceFundDeposit',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'address',
                name: 'liquidator',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'positionKey',
                type: 'uint256',
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'marketIdx',
                                type: 'uint256',
                            },
                            {
                                internalType: 'enum IGravix.PositionType',
                                name: 'positionType',
                                type: 'uint8',
                            },
                            {
                                internalType: 'uint256',
                                name: 'initialCollateral',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openFee',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'markPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'leverage',
                                type: 'uint256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'liquidationThresholdRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'createdAt',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Position',
                        name: 'position',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'positionSizeUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closePrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'borrowFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'fundingFee',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closeFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'liquidationPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'pnl',
                        type: 'int256',
                    },
                    {
                        internalType: 'bool',
                        name: 'liquidate',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'viewTime',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct IGravix.PositionView',
                name: 'positionView',
                type: 'tuple',
            },
        ],
        name: 'LiquidatePosition',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'usdtAmountIn',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'stgUsdtAmountOut',
                type: 'uint256',
            },
        ],
        name: 'LiquidityPoolDeposit',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'fees',
                type: 'uint256',
            },
        ],
        name: 'LiquidityPoolFees',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'usdtAmountOut',
                type: 'uint256',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'stgUsdtAmountIn',
                type: 'uint256',
            },
        ],
        name: 'LiquidityPoolWithdraw',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'marketIdx',
                        type: 'uint256',
                    },
                    {
                        internalType: 'enum IGravix.PositionType',
                        name: 'positionType',
                        type: 'uint8',
                    },
                    {
                        internalType: 'uint256',
                        name: 'initialCollateral',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'openFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'openPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'markPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'leverage',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'accUSDFundingPerShare',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'borrowBaseRatePerHour',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'baseSpreadRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closeFeeRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'liquidationThresholdRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'createdAt',
                        type: 'uint256',
                    },
                ],
                indexed: false,
                internalType: 'struct IGravix.Position',
                name: 'position',
                type: 'tuple',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'positionKey',
                type: 'uint256',
            },
        ],
        name: 'MarketOrderExecution',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'maxLongsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxShortsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'noiWeight',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxLeverage',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depthAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'ticker',
                        type: 'string',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'openFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseDynamicSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'fundingBaseRatePerHour',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Fees',
                        name: 'fees',
                        type: 'tuple',
                    },
                ],
                indexed: false,
                internalType: 'struct IGravix.MarketConfig',
                name: 'market',
                type: 'tuple',
            },
        ],
        name: 'NewMarket',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'maxLongsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxShortsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'noiWeight',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxLeverage',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depthAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'ticker',
                        type: 'string',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'openFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseDynamicSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'fundingBaseRatePerHour',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Fees',
                        name: 'fees',
                        type: 'tuple',
                    },
                ],
                internalType: 'struct IGravix.MarketConfig[]',
                name: 'newMarkets',
                type: 'tuple[]',
            },
        ],
        name: 'addMarkets',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'price',
                type: 'uint256',
            },
            {
                internalType: 'enum IGravix.PositionType',
                name: '_type',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'spread',
                type: 'uint256',
            },
        ],
        name: 'applyOpenSpread',
        outputs: [
            {
                internalType: 'uint256',
                name: 'newPrice',
                type: 'uint256',
            },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'collateral',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'leverage',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'assetPrice',
                type: 'uint256',
            },
        ],
        name: 'calculatePositionAssetSize',
        outputs: [
            {
                internalType: 'uint256',
                name: 'positionSizeAsset',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'marketIdx',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'positionKey',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_assetPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes',
            },
        ],
        name: 'closeMarketPosition',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256',
            },
        ],
        name: 'depositLiquidity',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getAllMarkets',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'marketIdx',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'ticker',
                        type: 'string',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'totalLongsAsset',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'totalShortsAsset',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'maxTotalLongsUSD',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'maxTotalShortsUSD',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'lastNoiUpdatePrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'noiWeight',
                                type: 'uint256',
                            },
                            {
                                components: [
                                    {
                                        internalType: 'int256',
                                        name: 'accLongUSDFundingPerShare',
                                        type: 'int256',
                                    },
                                    {
                                        internalType: 'int256',
                                        name: 'accShortUSDFundingPerShare',
                                        type: 'int256',
                                    },
                                ],
                                internalType: 'struct IGravix.Funding',
                                name: 'funding',
                                type: 'tuple',
                            },
                            {
                                internalType: 'uint256',
                                name: 'lastFundingUpdateTime',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'maxLeverage',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'depthAsset',
                                type: 'uint256',
                            },
                            {
                                components: [
                                    {
                                        internalType: 'uint256',
                                        name: 'openFeeRate',
                                        type: 'uint256',
                                    },
                                    {
                                        internalType: 'uint256',
                                        name: 'closeFeeRate',
                                        type: 'uint256',
                                    },
                                    {
                                        internalType: 'uint256',
                                        name: 'baseSpreadRate',
                                        type: 'uint256',
                                    },
                                    {
                                        internalType: 'uint256',
                                        name: 'baseDynamicSpreadRate',
                                        type: 'uint256',
                                    },
                                    {
                                        internalType: 'uint256',
                                        name: 'borrowBaseRatePerHour',
                                        type: 'uint256',
                                    },
                                    {
                                        internalType: 'uint256',
                                        name: 'fundingBaseRatePerHour',
                                        type: 'uint256',
                                    },
                                ],
                                internalType: 'struct IGravix.Fees',
                                name: 'fees',
                                type: 'tuple',
                            },
                            {
                                internalType: 'bool',
                                name: 'paused',
                                type: 'bool',
                            },
                        ],
                        internalType: 'struct IGravix.Market',
                        name: 'market',
                        type: 'tuple',
                    },
                ],
                internalType: 'struct IGravix.MarketInfo[]',
                name: 'marketInfos',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'getDetails',
        outputs: [
            {
                components: [
                    {
                        internalType: 'address',
                        name: 'priceNode',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'usdt',
                        type: 'address',
                    },
                    {
                        internalType: 'address',
                        name: 'stgUsdt',
                        type: 'address',
                    },
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'treasury',
                                type: 'address',
                            },
                            {
                                internalType: 'address',
                                name: 'projectFund',
                                type: 'address',
                            },
                            {
                                internalType: 'address',
                                name: 'devFund',
                                type: 'address',
                            },
                        ],
                        internalType: 'struct IGravix.Treasuries',
                        name: 'treasuries',
                        type: 'tuple',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'balance',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'stgUsdtSupply',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'targetPrice',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.PoolAssets',
                        name: 'poolAssets',
                        type: 'tuple',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'balance',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'limit',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.InsuranceFund',
                        name: 'insuranceFunds',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256[3]',
                        name: 'insuranceFundOverflowDistributionSchema',
                        type: 'uint256[3]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'collateralReserve',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalNOI',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'totalNOILimitEnabled',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxPoolUtilRatio',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxPnlRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'minPositionCollateral',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bool',
                        name: 'paused',
                        type: 'bool',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'thresholdRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'rewardShare',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.LiquidationParams',
                        name: 'liquidation',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256[2]',
                        name: 'openFeeDistributionSchema',
                        type: 'uint256[2]',
                    },
                    {
                        internalType: 'uint256[2]',
                        name: 'closeFeeDistributionSchema',
                        type: 'uint256[2]',
                    },
                    {
                        internalType: 'uint256',
                        name: 'marketCount',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IGravix.Details',
                name: '',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'positionSizeAsset',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'totalLongsAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'totalShortsAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxTotalLongsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxTotalShortsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastNoiUpdatePrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'noiWeight',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'int256',
                                name: 'accLongUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accShortUSDFundingPerShare',
                                type: 'int256',
                            },
                        ],
                        internalType: 'struct IGravix.Funding',
                        name: 'funding',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'lastFundingUpdateTime',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxLeverage',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depthAsset',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'openFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseDynamicSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'fundingBaseRatePerHour',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Fees',
                        name: 'fees',
                        type: 'tuple',
                    },
                    {
                        internalType: 'bool',
                        name: 'paused',
                        type: 'bool',
                    },
                ],
                internalType: 'struct IGravix.Market',
                name: '_market',
                type: 'tuple',
            },
            {
                internalType: 'enum IGravix.PositionType',
                name: 'positionType',
                type: 'uint8',
            },
        ],
        name: 'getDynamicSpread',
        outputs: [
            {
                internalType: 'uint256',
                name: 'dynamicSpread',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'positionKey',
                        type: 'uint256',
                    },
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assetPrice',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'int256',
                                name: 'accLongUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accShortUSDFundingPerShare',
                                type: 'int256',
                            },
                        ],
                        internalType: 'struct IGravix.Funding',
                        name: 'funding',
                        type: 'tuple',
                    },
                ],
                internalType: 'struct IGravix.ViewInput',
                name: 'input',
                type: 'tuple',
            },
        ],
        name: 'getPositionView',
        outputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'marketIdx',
                                type: 'uint256',
                            },
                            {
                                internalType: 'enum IGravix.PositionType',
                                name: 'positionType',
                                type: 'uint8',
                            },
                            {
                                internalType: 'uint256',
                                name: 'initialCollateral',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openFee',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'markPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'leverage',
                                type: 'uint256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'liquidationThresholdRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'createdAt',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Position',
                        name: 'position',
                        type: 'tuple',
                    },
                    {
                        internalType: 'uint256',
                        name: 'positionSizeUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closePrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'borrowFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'fundingFee',
                        type: 'int256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closeFee',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'liquidationPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'int256',
                        name: 'pnl',
                        type: 'int256',
                    },
                    {
                        internalType: 'bool',
                        name: 'liquidate',
                        type: 'bool',
                    },
                    {
                        internalType: 'uint256',
                        name: 'viewTime',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IGravix.PositionView',
                name: 'positionView',
                type: 'tuple',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'user',
                type: 'address',
            },
        ],
        name: 'getUserPositions',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'positionIdx',
                        type: 'uint256',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'marketIdx',
                                type: 'uint256',
                            },
                            {
                                internalType: 'enum IGravix.PositionType',
                                name: 'positionType',
                                type: 'uint8',
                            },
                            {
                                internalType: 'uint256',
                                name: 'initialCollateral',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openFee',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'openPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'markPrice',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'leverage',
                                type: 'uint256',
                            },
                            {
                                internalType: 'int256',
                                name: 'accUSDFundingPerShare',
                                type: 'int256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'liquidationThresholdRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'createdAt',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Position',
                        name: 'position',
                        type: 'tuple',
                    },
                ],
                internalType: 'struct IGravix.UserPositionInfo[]',
                name: 'userPositionsInfo',
                type: 'tuple[]',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'insuranceFund',
        outputs: [
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'limit',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'marketIdx',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'assetPrice',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256',
                    },
                    {
                        internalType: 'bytes',
                        name: 'signature',
                        type: 'bytes',
                    },
                    {
                        components: [
                            {
                                internalType: 'address',
                                name: 'user',
                                type: 'address',
                            },
                            {
                                internalType: 'uint256',
                                name: 'positionKey',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.PositionIdx[]',
                        name: 'positions',
                        type: 'tuple[]',
                    },
                ],
                internalType: 'struct IGravix.LiquidationConfig[]',
                name: 'liquidationConfig',
                type: 'tuple[]',
            },
        ],
        name: 'liquidatePositions',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'liquidationParams',
        outputs: [
            {
                internalType: 'uint256',
                name: 'thresholdRate',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'rewardShare',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'marketTickers',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'markets',
        outputs: [
            {
                internalType: 'uint256',
                name: 'totalLongsAsset',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'totalShortsAsset',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'maxTotalLongsUSD',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'maxTotalShortsUSD',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'lastNoiUpdatePrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'noiWeight',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'int256',
                        name: 'accLongUSDFundingPerShare',
                        type: 'int256',
                    },
                    {
                        internalType: 'int256',
                        name: 'accShortUSDFundingPerShare',
                        type: 'int256',
                    },
                ],
                internalType: 'struct IGravix.Funding',
                name: 'funding',
                type: 'tuple',
            },
            {
                internalType: 'uint256',
                name: 'lastFundingUpdateTime',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'maxLeverage',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'depthAsset',
                type: 'uint256',
            },
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'openFeeRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'closeFeeRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'baseSpreadRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'baseDynamicSpreadRate',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'borrowBaseRatePerHour',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'fundingBaseRatePerHour',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct IGravix.Fees',
                name: 'fees',
                type: 'tuple',
            },
            {
                internalType: 'bool',
                name: 'paused',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'marketIdx',
                type: 'uint256',
            },
            {
                internalType: 'enum IGravix.PositionType',
                name: 'positionType',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'collateral',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'expectedPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'leverage',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'maxSlippageRate',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: '_assetPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'timestamp',
                type: 'uint256',
            },
            {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes',
            },
        ],
        name: 'openMarketPosition',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'poolAssets',
        outputs: [
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'stgUsdtSupply',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'targetPrice',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'poolDebt',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'positions',
        outputs: [
            {
                internalType: 'uint256',
                name: 'marketIdx',
                type: 'uint256',
            },
            {
                internalType: 'enum IGravix.PositionType',
                name: 'positionType',
                type: 'uint8',
            },
            {
                internalType: 'uint256',
                name: 'initialCollateral',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'openFee',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'openPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'markPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'leverage',
                type: 'uint256',
            },
            {
                internalType: 'int256',
                name: 'accUSDFundingPerShare',
                type: 'int256',
            },
            {
                internalType: 'uint256',
                name: 'borrowBaseRatePerHour',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'baseSpreadRate',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'closeFeeRate',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'liquidationThresholdRate',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'createdAt',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'priceNode',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'requestNonce',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'stgUsdt',
        outputs: [
            {
                internalType: 'contract IERC20Minter',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'stgUsdtPrice',
        outputs: [
            {
                internalType: 'uint256',
                name: 'inPrice',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'outPrice',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'stgAmount',
                type: 'uint256',
            },
        ],
        name: 'stgUsdtToUsdt',
        outputs: [
            {
                internalType: 'uint256',
                name: 'usdtAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'usdt',
        outputs: [
            {
                internalType: 'contract IERC20',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'usdtAmount',
                type: 'uint256',
            },
        ],
        name: 'usdtToStgUsdt',
        outputs: [
            {
                internalType: 'uint256',
                name: 'stgAmount',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'userPositionCount',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'maxLongsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxShortsUSD',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'noiWeight',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'maxLeverage',
                        type: 'uint256',
                    },
                    {
                        internalType: 'uint256',
                        name: 'depthAsset',
                        type: 'uint256',
                    },
                    {
                        internalType: 'string',
                        name: 'ticker',
                        type: 'string',
                    },
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'openFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'closeFeeRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'baseDynamicSpreadRate',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'borrowBaseRatePerHour',
                                type: 'uint256',
                            },
                            {
                                internalType: 'uint256',
                                name: 'fundingBaseRatePerHour',
                                type: 'uint256',
                            },
                        ],
                        internalType: 'struct IGravix.Fees',
                        name: 'fees',
                        type: 'tuple',
                    },
                ],
                internalType: 'struct IGravix.MarketConfig',
                name: 'config',
                type: 'tuple',
            },
        ],
        name: 'validateMarketConfig',
        outputs: [
            {
                internalType: 'bool',
                name: 'correct',
                type: 'bool',
            },
        ],
        stateMutability: 'pure',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'stgUsdtAmount',
                type: 'uint256',
            },
        ],
        name: 'withdrawLiquidity',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const
