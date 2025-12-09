<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nueva solicitud de vendedor</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:24px 0;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:16px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.35);">
                <!-- Encabezado -->
                <tr>
                    <td style="padding:20px 24px 12px; text-align:center; background:linear-gradient(135deg,#f59e0b,#f97316);">
                        <img src="{{ rtrim(config('app.url'), '/') }}/public/brand/Enerflux.png"
                             alt="Enerflux"
                             width="120"
                             style="display:block; margin:0 auto 8px; max-width:120px; height:auto;">
                        <p style="margin:0; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#e5e7eb;">
                            Nueva solicitud de vendedor
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:24px 24px 16px; color:#e5e7eb;">
                        <h2 style="margin:0 0 8px; font-size:22px; font-weight:600;">
                            Hola Admin,
                        </h2>

                        <p style="margin:0 0 12px; font-size:14px; color:#9ca3af;">
                            Has recibido una nueva <strong>solicitud de cuenta de vendedor</strong> en Enerflux.
                        </p>

                        <!-- Datos del solicitante -->
                        <div style="margin:16px 0 12px; padding:12px 14px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                            <p style="margin:0 0 6px; font-size:13px; color:#e5e7eb; font-weight:600;">
                                Datos del solicitante
                            </p>

                            <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.8;">
                                <strong>Nombre:</strong> {{ $user->name }}<br>
                                <strong>Email:</strong>
                                <a href="mailto:{{ $user->email }}" style="color:#a855f7; text-decoration:none;">
                                    {{ $user->email }}
                                </a><br>
                                <strong>ID Usuario:</strong> #{{ $user->id }}<br>
                                <strong>Teléfono:</strong> {{ $telefono }}<br>
                                <strong>Zona:</strong> {{ $zona }}<br>
                                <strong>Marca:</strong> {{ $brand }}<br>
                                <strong>Empresa:</strong> {{ $company }}<br>
                                <strong>Web:</strong> {{ $website }}<br>
                                <strong>Fecha solicitud:</strong> {{ now()->format('d/m/Y H:i') }}
                            </p>
                        </div>

                        @if (!empty($message))
                            <div style="margin:16px 0 12px; padding:12px 14px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                                <p style="margin:0 0 6px; font-size:13px; color:#e5e7eb; font-weight:600;">
                                    Mensaje del solicitante
                                </p>
                                <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.5;">
                                    {!! nl2br(e($message)) !!}
                                </p>
                            </div>
                        @endif

                        <p style="margin:12px 0 8px; font-size:14px; color:#9ca3af;">
                            Puedes revisar la solicitud y aprobarla o rechazarla desde el panel de administración.
                        </p>

                        <!-- Botón -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 8px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ rtrim(config('app.url'), '/') }}/frontend/vendors/requests"
                                       style="display:inline-block; padding:12px 28px; border-radius:8px;
                                              background:linear-gradient(135deg,#f59e0b,#f97316);
                                              color:#ffffff; text-decoration:none; font-size:14px; font-weight:600;">
                                        Revisar solicitudes pendientes
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:14px 0 0; font-size:13px; color:#6b7280;">
                            Este es un mensaje automático del sistema de gestión de vendedores de Enerflux.
                        </p>
                    </td>
                </tr>

                <!-- Pie -->
                <tr>
                    <td style="padding:16px 24px 20px; border-top:1px solid #1f2937; text-align:center; color:#6b7280; font-size:11px;">
                        <p style="margin:0 0 4px;">
                            © {{ date('Y') }} Enerflux. Todos los derechos reservados.
                        </p>
                        <p style="margin:0;">
                            Este mensaje ha sido generado automáticamente por el sistema.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
