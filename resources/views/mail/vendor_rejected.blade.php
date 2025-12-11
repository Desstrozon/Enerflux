<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de vendedor rechazada</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:40px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.4);">
                <!-- Encabezado -->
                <tr>
                    <td style="padding:48px 32px 32px; text-align:center; background:linear-gradient(135deg,#475569,#64748b);">
                        <img src="{{ asset('brand/Enerflux.png') }}"
                             alt="Enerflux"
                             width="180"
                             style="display:block; margin:0 auto 16px; max-width:180px; height:auto;">
                        <p style="margin:0; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#f1f5f9; font-weight:600;">
                            Solicitud de vendedor rechazada
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:40px 32px 32px; color:#e5e7eb;">
                        <h2 style="margin:0 0 16px; font-size:28px; font-weight:700; line-height:1.3;">
                            Hola {{ $name }},
                        </h2>

                        <p style="margin:0 0 20px; font-size:16px; line-height:1.6; color:#cbd5e1;">
                            Tras revisar tu solicitud para ser <strong style="color:#e5e7eb;">vendedor en Enerflux</strong>,
                            lamentamos informarte de que en esta ocasión ha sido <strong style="color:#e5e7eb;">rechazada</strong>.
                        </p>

                        @if (!empty($reason))
                            <div style="margin:24px 0 20px; padding:20px; border-radius:12px; background-color:#1e1b4b; border-left:4px solid #ef4444;">
                                <p style="margin:0 0 8px; font-size:14px; color:#e5e7eb; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                                    ⚠️ Motivo indicado por el administrador
                                </p>
                                <p style="margin:0; font-size:15px; line-height:1.6; color:#cbd5e1;">
                                    {{ $reason }}
                                </p>
                            </div>
                        @endif

                        <p style="margin:20px 0 24px; font-size:15px; line-height:1.6; color:#94a3b8;">
                            Esto no impide que puedas <strong style="color:#cbd5e1;">volver a solicitar el alta</strong> más adelante,
                            por favor contacta con nosotros a través de nuestro apartado de Contacto en la página en la parte superior.
                        </p>

                        <p style="margin:24px 0 0; font-size:14px; line-height:1.6; color:#64748b;">
                            Si crees que se trata de un error o necesitas más detalles, puedes responder a este correo
                            o escribirnos a
                            <a href="mailto:{{ config('mail.from.address') }}"
                               style="color:#a855f7; text-decoration:none; font-weight:500;">
                                {{ config('mail.from.address') }}
                            </a>.
                        </p>
                    </td>
                </tr>

                <!-- Pie -->
                <tr>
                    <td style="padding:24px 32px 28px; border-top:1px solid #1e293b; text-align:center; color:#64748b; font-size:12px; line-height:1.5;">
                        <p style="margin:0 0 8px; font-weight:500;">
                            © {{ date('Y') }} Enerflux. Todos los derechos reservados.
                        </p>
                        <p style="margin:0; color:#475569;">
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
