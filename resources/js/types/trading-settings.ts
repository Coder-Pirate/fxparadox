export type TradingPair = {
    id: number;
    user_id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export type TradingSession = {
    id: number;
    user_id: number;
    name: string;
    created_at: string;
    updated_at: string;
};

export type AccountBalance = {
    id: number;
    user_id: number;
    account_name: string;
    balance: number;
    created_at: string;
    updated_at: string;
};
