<?php
$sessionId = $_GET['session_id'] ?? '';
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redirigiendo...</title>
    <script>
        // Redirigir usando JavaScript para que React Router lo maneje
        window.location.href = '/frontend/#/checkout/success?session_id=<?php echo htmlspecialchars($sessionId); ?>';
    </script>
</head>
<body>
    <p>Redirigiendo a tu pedido...</p>
</body>
</html>
