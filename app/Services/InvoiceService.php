<?php

namespace App\Services;

use App\Models\Order;
use Dompdf\Dompdf;
use Dompdf\Options;

class InvoiceService
{
    public function buildSeller(): array
    {
        return [
            'name'    => env('INVOICE_SELLER_NAME', 'ENERFLUX'),
            'vat'     => env('INVOICE_SELLER_VAT', 'ESX12345678'),
            'address' => env('INVOICE_SELLER_ADDRESS', 'C/ Renovable, 123 · 04001 Almería'),
            'email'   => env('INVOICE_SELLER_EMAIL', 'info@enerflux.local'),
            'phone'   => env('INVOICE_SELLER_PHONE', '+34 600 000 000'),
        ];
    }

    public function logoData(): ?string
    {
        $path = public_path('brand/enerflux-logo.png'); // asegúrate de que exista
        if (!is_file($path)) return null;
        return 'data:image/png;base64,' . base64_encode(file_get_contents($path));
    }

    public function renderHtml(Order $order): string
    {
        $order->load('items');

        return view('invoices.show', [
            'order'    => $order,
            'seller'   => $this->buildSeller(),
            'customer' => $order->billing_snapshot['customer'] ?? [],
            'shipping' => $order->billing_snapshot['shipping'] ?? [],
            'logoData' => $this->logoData(),
        ])->render();
    }

    public function renderPdf(Order $order): string
    {
        $html = $this->renderHtml($order);

        $opts = new Options();
        $opts->set('isRemoteEnabled', true);
        $opts->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($opts);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }
}
