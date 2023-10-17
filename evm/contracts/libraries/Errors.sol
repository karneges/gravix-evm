// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;


library Errors {
    // ERRORS
    // COMMON
    uint16 constant NOT_OWNER = 1000;
    uint16 constant NOT_ACTIVE = 1001;
    uint16 constant NOT_EMERGENCY = 1002;
    uint16 constant WRONG_PUBKEY = 1003;
    uint16 constant LOW_MSG_VALUE = 1004;
    uint16 constant BAD_INPUT = 1005;
    uint16 constant NOT_TOKEN_WALLET = 1006;
    uint16 constant BAD_SENDER = 1007;
    uint16 constant EMERGENCY = 1008;
    uint16 constant NOT_TOKEN_ROOT = 1009;
    uint16 constant NOT_LIMIT_BOT = 1010;

    // VAULT
    uint16 constant NOT_GRAVIX_ACCOUNT = 2000;
    uint16 constant ALREADY_INITIALIZED = 2001;

    uint16 constant MARKET_POSITIONS_LIMIT_REACHED = 2002;
    uint16 constant PLATFORM_POSITIONS_LIMIT_REACHED = 2003;
    uint16 constant MARKET_CLOSED = 2004;
    uint16 constant NOT_ORACLE_PROXY = 2005;
    uint16 constant LOW_INSURANCE_FUND = 2006;
    uint16 constant ZERO_ADDRESS = 2007;

    // ACCOUNT
    uint16 constant NOT_VAULT = 3000;
    uint16 constant POSITION_NOT_FOUND = 3001;
    // Account revert reasons
    uint constant NOT_LATEST_ACCOUNT_VERSION = 3101;
    uint constant HIGH_STORAGE_FEE = 3102;
    uint constant LOW_VALUE_FOR_RETRIEVE_REFERRERS = 3103;
    uint constant ORDER_NOT_EXISTS = 3104;
    uint constant LOW_COLLATERAL = 3105;
    uint constant HIGH_SLIPPAGE = 3106;
    uint constant INVALID_TRIGGER_PRICE = 3107;
    uint constant INVALID_OPEN_LIMIT_ORDER_PRICE = 3108;
    uint constant LOW_VALUE_FOR_CREATING_FIRST_POSITION_TRIGGER = 3109;
    uint constant POSITION_NOT_EXISTS = 3110;
    uint constant POSITION_NOT_READY_TO_CLOSE = 3111;
    uint constant POSITION_NOT_READY_TO_LIQUIDATE = 3112;
    uint constant NOT_ENOUGH_COLLATERAL = 3113;
    uint constant LEVERAGE_MORE_THAN_MAX = 3114;
    uint constant LOW_VALUE_FOR_CONTINUE_OPEN_MARKET_ORDER = 3115;
    uint constant LOW_VALUE_FOR_CONTINUE_OPEN_LIMIT_ORDER = 3116;

    // ORACLE PROXY
    uint16 constant BAD_DEX_ORACLE_PATH = 4000;

    // PRICE NODE
    uint16 constant STALE_PRICE = 5000;
    uint16 constant BAD_SIGNATURE = 5001;
    uint16 constant NO_REQUESTS = 5002;
    uint16 constant MAX_REQUESTS = 5003;

    // LIMIT BOT VAULT
    uint16 constant NOT_OWNER_OR_GRAVIX_VAULT = 6000;
}
