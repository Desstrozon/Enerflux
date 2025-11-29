<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nuevo mensaje de contacto</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:24px 0;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:16px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.35);">
                <!-- Encabezado -->
                <tr>
                    <td style="padding:20px 24px 12px; text-align:center; background:linear-gradient(135deg,#4b5563,#9ca3af);">
                        <img src="{{ config('app.url') }}/brand/Enerflux.png"
                             alt="Enerflux"
                             width="120"
                             style="display:block; margin:0 auto 8px; max-width:120px; height:auto;">
                        <p style="margin:0; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#e5e7eb;">
                            Nuevo mensaje de contacto
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:24px 24px 16px; color:#e5e7eb;">
                        <h2 style="margin:0 0 8px; font-size:22px; font-weight:600;">
                            Hola equipo Enerflux,
                        </h2>

                        <p style="margin:0 0 12px; font-size:14px; color:#9ca3af;">
                            Has recibido un nuevo mensaje a través del formulario de <strong>Contacto</strong> de la web.
                        </p>

                        <!-- Datos del remitente -->
                        <div style="margin:16px 0 12px; padding:12px 14px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                            <p style="margin:0 0 6px; font-size:13px; color:#e5e7eb; font-weight:600;">
                                Datos del remitente
                            </p>

                            <p style="margin:0; font-size:13px; color:#9ca3af;">
                                <strong>Nombre:</strong> {{ $name }}<br>
                                <strong>Email:</strong>
                                <a href="mailto:{{ $email }}" style="color:#a855f7; text-decoration:none;">
                                    {{ $email }}
                                </a><br>
                                @if (!empty($phone))
                                    <strong>Teléfono:</strong> {{ $phone }}<br>
                                @endif
                                @if (!empty($subject))
                                    <strong>Asunto:</strong> {{ $subject }}
                                @endif
                            </p>
                        </div>

                        <!-- Mensaje -->
                        <div style="margin:16px 0 8px; padding:14px 14px 12px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                            <p style="margin:0 0 6px; font-size:13px; color:#e5e7eb; font-weight:600;">
                                Mensaje
                            </p>
                            <p style="margin:0; font-size:13px; color:#9ca3af; line-height:1.5;">
                                {!! nl2br(e($body)) !!}
                            </p>
                        </div>

                        <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">
                            Puedes responder directamente a este correo para ponerte en contacto con el remitente.
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
                            Este mensaje ha sido generado automáticamente desde el formulario de contacto de la web.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
