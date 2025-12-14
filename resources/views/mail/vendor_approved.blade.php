<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cuenta de vendedor aprobada</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:40px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:20px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.4);">
                <!-- Encabezado -->
                <tr>
                    <td style="padding:48px 32px 32px; text-align:center; background:linear-gradient(135deg,#6d28d9,#a855f7);">
                        <img src="{{ asset('brand/Enerflux.png') }}"
                             alt="Enerflux"
                             width="180"
                             style="display:block; margin:0 auto 16px; max-width:180px; height:auto;">
                        <p style="margin:0; font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#f3e8ff; font-weight:600;">
                            Cuenta de vendedor aprobada
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:40px 32px 32px; color:#e5e7eb;">
                        <h2 style="margin:0 0 16px; font-size:28px; font-weight:700; line-height:1.3;">
                            ¡Enhorabuena, {{ $name }}!
                        </h2>

                        <p style="margin:0 0 20px; font-size:16px; line-height:1.6; color:#cbd5e1;">
                            Tu cuenta de <strong style="color:#e5e7eb;">vendedor en Enerflux</strong> ha sido aprobada correctamente.
                            A partir de ahora podrás acceder con tu usuario y comenzar a publicar y gestionar tus productos.
                        </p>

                        @if (!empty($note))
                            <div style="margin:24px 0 20px; padding:20px; border-radius:12px; background-color:#1e1b4b; border-left:4px solid #8b5cf6;">
                                <p style="margin:0 0 8px; font-size:14px; color:#e5e7eb; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                                    📝 Nota del administrador
                                </p>
                                <p style="margin:0; font-size:15px; line-height:1.6; color:#cbd5e1;">
                                    {{ $note }}
                                </p>
                            </div>
                        @endif

                        <p style="margin:20px 0 24px; font-size:15px; line-height:1.6; color:#94a3b8;">
                            Te recomendamos revisar tu perfil de vendedor y completar toda la información de contacto
                            antes de publicar tu primer producto.
                        </p>

                        <!-- Botón -->
                        @php
                            $frontendUrl = trim(config('app.frontend_url', config('app.url')));
                            $frontendUrl = rtrim($frontendUrl, '/');
                            $loginUrl = $frontendUrl . '/login';
                        @endphp
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
                            <tr>
                                <td align="center">
                                    <a href="{{ $loginUrl }}"
                                       style="display:inline-block; padding:16px 40px; border-radius:999px;
                                              background:linear-gradient(135deg,#8b5cf6,#6366f1);
                                              color:#ffffff; text-decoration:none; font-size:16px; font-weight:600;
                                              box-shadow:0 10px 25px rgba(139,92,246,0.3);">
                                        Iniciar sesión como vendedor
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:24px 0 0; font-size:14px; line-height:1.6; color:#64748b;">
                            Si tienes cualquier duda sobre cómo empezar a vender en Enerflux, puedes responder a este correo
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
