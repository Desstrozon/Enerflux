<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estudio personalizado</title>
</head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f7; padding:24px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px;">
        <h1 style="font-size:20px;margin-bottom:16px;color:#111827;">
            Hola {{ $user->name }},
        </h1>

        <p style="margin-bottom:12px;color:#374151;">
            Hemos recibido tu solicitud de <strong>estudio personalizado de autoconsumo</strong> en Enerflux.
        </p>

        <p style="margin-bottom:12px;color:#374151;">
            Un miembro de nuestro equipo se pondrá en contacto contigo para hacerte algunas preguntas
            sobre tu consumo y las características de tu vivienda antes de cerrar una propuesta definitiva.
        </p>

        <p style="margin-top:20px;margin-bottom:8px;color:#111827;font-weight:600;">
            Propuesta orientativa
        </p>

        <p style="margin-bottom:12px;color:#374151;">
            Mientras tanto, te dejamos una orientación de kit típico para una vivienda unifamiliar:
        </p>

        <ul style="margin-bottom:16px;color:#374151;">
            <li>✔ 8 paneles solares de 450&nbsp;W (3,6&nbsp;kWp)</li>
            <li>✔ Inversor híbrido de 3&nbsp;kW</li>
            <li>✔ Batería de 5&nbsp;kWh para acumular excedentes</li>
        </ul>

        <p style="margin-bottom:12px;color:#374151;">
            Puedes consultar productos similares en la sección <strong>Productos</strong> de nuestra web
            y comparar paneles, inversores y baterías disponibles.
        </p>

        <!-- Botón -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 16px;">
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

        <p style="margin-top:24px;color:#6b7280;font-size:13px;">
            Gracias por confiar en Enerflux.
            <br>
            El equipo de Enerflux
        </p>
    </div>
</body>
</html>
