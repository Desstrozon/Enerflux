<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Solicitud de estudio personalizado</title>
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; padding:24px 0;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background:#0b1020; border-radius:16px; overflow:hidden; box-shadow:0 20px 45px rgba(0,0,0,0.35);">
                <!-- Encabezado -->
                <tr>
                    <td style="padding:20px 24px 12px; text-align:center; background:linear-gradient(135deg,#6d28d9,#a855f7);">
                        <img src="{{ rtrim(config('app.url'), '/') }}/public/brand/Enerflux.png"
                             alt="Enerflux"
                             width="120"
                             style="display:block; margin:0 auto 8px; max-width:120px; height:auto;">
                        <p style="margin:0; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:#e5e7eb;">
                            Estudio personalizado
                        </p>
                    </td>
                </tr>

                <!-- Contenido -->
                <tr>
                    <td style="padding:24px 24px 16px; color:#e5e7eb;">
                        <h2 style="margin:0 0 8px; font-size:22px; font-weight:600;">
                            Hola {{ $user->name }},
                        </h2>

                        <p style="margin:0 0 12px; font-size:14px; color:#9ca3af;">
                            Hemos recibido tu solicitud de <strong>estudio personalizado de autoconsumo</strong> en Enerflux.
                        </p>

                        <p style="margin:0 0 12px; font-size:14px; color:#9ca3af;">
                            Un miembro de nuestro equipo se pondrá en contacto contigo para hacerte algunas preguntas
                            sobre tu consumo y las características de tu vivienda antes de cerrar una propuesta definitiva.
                        </p>

                        <!-- Propuesta orientativa -->
                        <div style="margin:16px 0 12px; padding:14px; border-radius:10px; background-color:#020617; border:1px solid #1f2937;">
                            <p style="margin:0 0 8px; font-size:14px; color:#e5e7eb; font-weight:600;">
                                Propuesta orientativa
                            </p>
                            <p style="margin:0 0 8px; font-size:13px; color:#9ca3af;">
                                Mientras tanto, te dejamos una orientación de kit típico para una vivienda unifamiliar:
                            </p>
                            <ul style="margin:0; padding-left:20px; font-size:13px; color:#9ca3af; line-height:1.6;">
                                <li>✔ 8 paneles solares de 450 W (3,6 kWp)</li>
                                <li>✔ Inversor híbrido de 3 kW</li>
                                <li>✔ Batería de 5 kWh para acumular excedentes</li>
                            </ul>
                        </div>

                        <p style="margin:12px 0 8px; font-size:14px; color:#9ca3af;">
                            Puedes consultar productos similares en la sección <strong>Productos</strong> de nuestra web
                            y comparar paneles, inversores y baterías disponibles.
                        </p>

                        <!-- Botón -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 8px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ rtrim(config('app.url'), '/') }}/frontend"
                                       style="display:inline-block; padding:12px 28px; border-radius:8px;
                                              background:linear-gradient(135deg,#8b5cf6,#6366f1);
                                              color:#ffffff; text-decoration:none; font-size:14px; font-weight:600;">
                                        Ver productos en la web
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:14px 0 0; font-size:13px; color:#6b7280;">
                            Gracias por confiar en Enerflux.<br>
                            El equipo de Enerflux
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
                            Este es un mensaje automático. Por favor, no respondas si no necesitas ayuda.
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
