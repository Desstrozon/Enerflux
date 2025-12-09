<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Estudio personalizado Enerflux</title>
</head>
<body style="font-family: Arial, sans-serif; color:#111827; background:#f3f4f6; padding:24px;">
    <div style="max-width: 640px; margin:0 auto; background:white; border-radius:12px; padding:24px;">
        <h2 style="margin-top:0; margin-bottom:16px;">
            Hola, {{ $user->name }} 👋
        </h2>

        <p style="margin-bottom:12px;">
            Te enviamos un <strong>estudio orientativo</strong> según el perfil de instalación seleccionado.
        </p>

        <h3 style="margin-top:24px; margin-bottom:8px;">
            {{ $study['title'] }}
        </h3>

        <p style="margin-bottom:8px;">
            {{ $study['summary'] }}
        </p>

        <p style="margin-bottom:16px;">
            {{ $study['details'] }}
        </p>

        @if(!empty($study['products']))
            <h4 style="margin-top:20px; margin-bottom:8px;">Recomendaciones de equipo:</h4>
            <ul style="margin-top:0; padding-left:20px;">
                @foreach($study['products'] as $prod)
                    <li>{{ $prod }}</li>
                @endforeach
            </ul>
        @endif

        <p style="margin-top:24px; margin-bottom:8px;">
            A continuación puedes ver un ejemplo de la monitorización de este tipo de instalación:
        </p>
        <p style="margin:0;">
            <img
                src="{{ $message->embed(public_path('img/' . $study['image'])) }}"
                alt="Monitorización Enerflux"
                style="max-width:100%; border-radius:8px;"
            >
        </p>

        <p style="margin-top:24px; font-size:13px; color:#4b5563;">
            Este estudio es orientativo y no supone una oferta comercial vinculante.
            Si quieres que un técnico revise tu caso en detalle, puedes contactarnos.
        </p>

        <!-- Botón -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 16px;">
            <tr>
                <td align="center">
                    <a href="{{ rtrim(config('app.url'), '/') }}/frontend/contacto"
                       style="display:inline-block; padding:12px 28px; border-radius:8px;
                              background:linear-gradient(135deg,#8b5cf6,#6366f1);
                              color:#ffffff; text-decoration:none; font-size:14px; font-weight:600;">
                        Contactar con un técnico
                    </a>
                </td>
            </tr>
        </table>

        <p style="margin-top:16px;">
            Un saludo,<br>
            <strong>Equipo Enerflux</strong>
        </p>
    </div>
</body>
</html>
