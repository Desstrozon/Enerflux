@php
$c = $order->billing_snapshot['customer'] ?? [];
$s = $order->billing_snapshot['shipping'] ?? [];
@endphp
<!doctype html>
<html>

<head>
  <meta charset="utf-8">
  <title>Factura #{{ $order->id }}</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      background: #fff;
      color: #111;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      padding: 24px;
    }

    .flex {
      display: flex;
    }

    .between {
      justify-content: space-between;
      align-items: flex-start;
    }

    .muted {
      color: #555;
    }

    h1 {
      font-size: 22px;
      margin: 0 0 8px;
    }

    h2 {
      font-size: 14px;
      margin: 0 0 6px;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
    }

    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .mt8 {
      margin-top: 8px;
    }

    .mt12 {
      margin-top: 12px;
    }

    .mt16 {
      margin-top: 16px;
    }

    .logo {
      height: 42px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }

    th,
    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 8px;
      text-align: left;
    }

    th {
      background: #f8fafc;
      font-weight: 600;
    }

    .right {
      text-align: right;
    }

    .total {
      font-weight: 700;
    }

    small {
      color: #6b7280;
    }
  </style>
</head>

<body>

  <div class="flex between">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
      @if(!empty($logoData))
      <img src="{{ $logoData }}" alt="Enerflux" style="height:48px;">
      @else
      <strong style="font-size:20px;">{{ $seller['name'] }}</strong>
       @endif
       </div>
      <div class="muted mt8">
        {{ $seller['address'] ?? '' }}<br>
        {{ $seller['email'] ?? '' }} · {{ $seller['phone'] ?? '' }}<br>
        CIF/NIF: {{ $seller['vat'] ?? '' }}
      </div>
    </div>
    <div class="card" style="min-width:220px;">
      <h2>Factura</h2>
      <div><strong>#{{ $order->id }}</strong></div>
      <div class="muted">Fecha: {{ $order->created_at->format('d/m/Y H:i') }}</div>
      <div class="muted">Estado: {{ ucfirst($order->status) }}</div>
      <div class="muted">Moneda: {{ strtoupper($order->currency) }}</div>
      @if(!empty($order->stripe_payment_intent_id))
      <div class="muted">PI: {{ $order->stripe_payment_intent_id }}</div>
      @endif
    </div>
  </div>

  <div class="grid2 mt16">
    <div class="card">
      <h2>Cliente</h2>
      <div>{{ $c['name'] ?? '—' }}</div>
      <div class="muted">{{ $c['email'] ?? '' }} {{ !empty($c['phone']) ? ' · '.$c['phone'] : '' }}</div>
      @if(!empty($c['address']))
      <div class="muted mt8">
        {{ $c['address']['line1'] ?? '' }} {{ $c['address']['line2'] ?? '' }}<br>
        {{ $c['address']['postal_code'] ?? '' }} {{ $c['address']['city'] ?? '' }}<br>
        {{ $c['address']['country'] ?? '' }}
      </div>
      @endif
    </div>
    <div class="card">
      <h2>Envío</h2>
      <div>{{ $s['name'] ?? '—' }}</div>
      <div class="muted">{{ $s['phone'] ?? '' }}</div>
      @if(!empty($s['address']))
      <div class="muted mt8">
        {{ $s['address']['line1'] ?? '' }} {{ $s['address']['line2'] ?? '' }}<br>
        {{ $s['address']['postal_code'] ?? '' }} {{ $s['address']['city'] ?? '' }}<br>
        {{ $s['address']['country'] ?? '' }}
      </div>
      @endif
    </div>
  </div>

  <div class="mt16">
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th class="right">Ud.</th>
          <th class="right">Precio</th>
          <th class="right">Importe</th>
        </tr>
      </thead>
      <tbody>
        @foreach($order->items as $it)
        <tr>
          <td>{{ $it->name }}</td>
          <td class="right">{{ $it->quantity }}</td>
          <td class="right">{{ number_format((float)$it->unit_price, 2, ',', '.') }} {{ strtoupper($order->currency) }}</td>
          <td class="right">{{ number_format((float)$it->line_total, 2, ',', '.') }} {{ strtoupper($order->currency) }}</td>
        </tr>
        @endforeach
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="right total">Total</td>
          <td class="right total">{{ number_format((float)$order->amount, 2, ',', '.') }} {{ strtoupper($order->currency) }}</td>
        </tr>
      </tfoot>
    </table>
    <div class="mt12">
      <small>Documento generado automáticamente. Este PDF no sustituye la factura fiscal si tu TFG no lo requiere.</small>
    </div>
  </div>

</body>

</html>