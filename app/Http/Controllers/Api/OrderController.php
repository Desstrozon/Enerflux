<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrderController extends Controller
{
    use AuthorizesRequests;

    // GET /api/orders/mine
    public function index(Request $req)
    {
        $orders = Order::query()
            ->where('user_id', $req->user()->id)
            ->orderByDesc('id')
            ->select(['id', 'user_id', 'stripe_session_id', 'status', 'currency', 'amount', 'created_at'])
            ->get()
            ->map(function ($o) {
                return [
                    'id'                 => (int) $o->id,
                    'stripe_session_id'  => (string) $o->stripe_session_id,
                    'status'             => (string) $o->status,
                    'currency'           => (string) ($o->currency ?? 'EUR'),
                    'amount'             => (float) $o->amount,
                    'created_at'         => $o->created_at?->toISOString(),
                ];
            });

        return response()->json($orders);
    }

    // GET /api/orders/{order} (detalle JSON)
    public function show(Request $req, Order $order)
    {

        $this->authorize('view', $order);

        $order->load(['items:id,order_id,producto_id,name,image,unit_price,quantity,line_total']);

        return response()->json($order);
    }

    // GET /api/orders/by-session/{session}
    public function showBySession(Request $req, string $session)
    {
        $user = $req->user();

        $order = Order::with('items')
            ->where('stripe_session_id', $session)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'status'  => 'processing',
                'message' => 'Aún estamos confirmando tu pago. Vuelve a intentar en breve.',
            ], 202);
        }

        $order->amount     = (float) $order->amount;
        $order->created_at = $order->created_at?->toISOString();
        $order->items->transform(function ($it) {
            $it->unit_price = (float) $it->unit_price;
            $it->quantity   = (int)   $it->quantity;
            $it->line_total = (float) $it->line_total;
            return $it;
        });

        return response()->json($order);
    }


    public function invoiceHtml(Request $req, Order $order, \App\Services\InvoiceService $invoices)
    {
        $this->authorize('view', $order);
        $html = $invoices->renderHtml($order);
        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }

    public function invoicePdf(Request $req, Order $order, \App\Services\InvoiceService $invoices)
    {
        $this->authorize('downloadInvoice', $order);
        $pdf = $invoices->renderPdf($order);
        $filename = 'Factura-' . $order->id . '.pdf';

        return response($pdf, 200, [
            'Content-Type'                => 'application/pdf',
            'Content-Disposition'         => 'attachment; filename="' . $filename . '"',
            'Cache-Control'               => 'private, max-age=0, must-revalidate',
            'Pragma'                      => 'public',
            // útil para que el front vea el nombre del archivo
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
