<?php

namespace App\Exports;

use App\Models\TradeJournal;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TradeJournalsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    use Exportable;

    public function __construct(protected Collection $journals) {}

    public function collection(): Collection
    {
        return $this->journals;
    }

    public function headings(): array
    {
        return [
            'Date', 'Day', 'Pair', 'Session',
            'Direction', 'HFT Trend', 'MFT Trend',
            'Risk:Reward', 'Lot Size', 'Result', 'P/L Amount',
            'Red News Time', 'Tags', 'Trade Comment',
        ];
    }

    public function map($journal): array
    {
        return [
            $journal->trade_date,
            $journal->day,
            $journal->pair,
            $journal->session,
            strtoupper($journal->direction),
            $journal->hft_market_trend,
            $journal->mft_market_trend,
            $journal->risk_reward ?? '',
            $journal->lot_size ?? '',
            $journal->result ? strtoupper($journal->result) : '',
            $journal->profit_loss_amount !== null
                ? ($journal->result === 'profit' ? '+' : '-') . number_format(abs($journal->profit_loss_amount), 2)
                : '',
            $journal->red_news_time ?? '',
            is_array($journal->tags) ? implode(', ', $journal->tags) : '',
            $journal->trade_comment ?? '',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
