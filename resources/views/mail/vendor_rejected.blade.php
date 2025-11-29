<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitud de vendedor rechazada</title>
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
                            Solicitud de vendedor rechazada
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:24px 24px 16px; color:#e5e7eb;">
                        <h2 style="margin:0 0 8px; font-size:22px; font-weight:600;">
                            Hola {{ $name }},
                        </h2>

                        <p style="margin:0 0 12px; font-size:14px; color:#9ca3af;">
                            Tras revisar tu solicitud para ser <strong>vendedor en Enerflux</strong>,
                            lamentamos informarte de que en esta ocasión ha sido <strong>rechazada</strong>.
                        </p>

                        @if (!empty($reason))
                            <div style="margin:16px 0 12px; padding:12px 14px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                                <p style="margin:0 0 4px; font-size:13px; color:#e5e7eb; font-weight:600;">
                                    Motivo indicado por el administrador
                                </p>
                                <p style="margin:0; font-size:13px; color:#9ca3af;">
                                    {{ $reason }}
                                </p>
                            </div>
                        @endif

                        <p style="margin:12px 0 8px; font-size:14px; color:#9ca3af;">
                            Esto no impide que puedas <strong>volver a solicitar el alta</strong> más adelante,
                            por favor contacta con nosotros a traves de nuestro aparado de Contacto en la pagina en la parte superior.
                        </p>

                        <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">
                            Si crees que se trata de un error o necesitas más detalles, puedes responder a este correo
                            o escribirnos a
                            <a href="mailto:{{ config('mail.from.address') }}"
                               style="color:#a855f7; text-decoration:none;">
                                {{ config('mail.from.address') }}
                            </a>.
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
                            Este es un mensaje automático. Si no reconoces esta solicitud, contacta con soporte.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
