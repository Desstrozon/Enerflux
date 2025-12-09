<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmación de pedido #{{ $order->id }}</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:16px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.35);">
          <!-- Encabezado con logo -->
          <tr>
            <td style="padding:20px 24px 12px; text-align:center; background:linear-gradient(135deg,#6d28d9,#a855f7);">
              <img src="{{ rtrim(config('app.url'), '/') }}/public/brand/Enerflux.png" alt="Enerflux" width="120" style="display:block; margin:0 auto 8px; max-width:120px; height:auto;">
              <p style="margin:0; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#e5e7eb;">Confirmación de pedido</p>
            </td>
          </tr>
          <!-- Contenido principal -->
          <tr>
            <td style="padding:24px 24px 8px; color:#e5e7eb;">
              <h2 style="margin:0 0 8px; font-size:22px; font-weight:600;">¡Gracias por tu compra, {{ $order->user?->name ?? 'cliente' }}!</h2>
              <p style="margin:0 0 16px; font-size:14px; color:#9ca3af;">Tu pedido <strong>#{{ $order->id }}</strong> ha sido <strong>confirmado</strong> y la factura ha quedado registrada en nuestro sistema.</p>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:8px; background-color:#020617; border-radius:12px; padding:16px;">
                <tr>
                  <td style="font-size:13px; color:#9ca3af; padding-bottom:4px;">Fecha</td>
                  <td style="font-size:13px; color:#e5e7eb; padding-bottom:4px; text-align:right;">{{ optional($order->created_at)->format('d/m/Y H:i') }}</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:#9ca3af; padding-bottom:4px;">Estado</td>
                  <td style="font-size:13px; color:#22c55e; padding-bottom:4px; text-align:right;">{{ strtoupper($order->status ?? 'paid') }}</td>
                </tr>
                <tr>
                  <td style="font-size:13px; color:#9ca3af;">Importe</td>
                  <td style="font-size:15px; color:#e5e7eb; font-weight:600; text-align:right;">{{ $order->amount }} {{ $order->currency ?? '€' }}</td>
                </tr>
              </table>

              <p style="margin:16px 0 12px; font-size:14px; color:#9ca3af;">Si desea ver la factura, vaya al apartado <strong>"Mis pedidos"</strong> en Enerflux y haga clic en el botón <strong>"Ver"</strong> o <strong>"Descargar PDF"</strong> para descargarla.</p>

              <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">Si detectas cualquier error en la información del pedido o la factura, puedes responder directamente a este correo o escribirnos a <a href="mailto:{{ config('mail.from.address') }}" style="color:#a855f7; text-decoration:none;">{{ config('mail.from.address') }}</a>.</p>
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td style="padding:16px 24px 20px; border-top:1px solid #1f2937; text-align:center; color:#6b7280; font-size:11px;">
              <p style="margin:0 0 4px;">© {{ date('Y') }} Enerflux. Todos los derechos reservados.</p>
              <p style="margin:0;">Este es un mensaje automático. Por favor, no respondas si no necesitas ayuda.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
