export type TradeJournal = {
    id: number;
    user_id: number;
    account_balance_id: number;
    account_balance?: {
        id: number;
        account_name: string;
        balance: number;
    };
    trade_date: string;
    day: string;
    pair: string;
    session: string;
    hft_market_trend: string;
    mft_market_trend: string;
    direction: 'long' | 'short';
    risk_reward: string | null;
    lot_size: number | null;
    result: 'profit' | 'loss' | null;
    profit_loss_amount: number | null;
    trade_comment: string | null;
    hft_entry_image: string | null;
    mft_entry_image: string | null;
    lft_entry_image: string | null;
    red_news_time: string | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};
