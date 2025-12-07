#!/bin/bash
set -e

echo "=== Iniciando configuración de Enerflux ==="

# Esperar a que nginx esté disponible
sleep 2

# Configurar nginx con archivo personalizado
if [ -f /home/site/wwwroot/default ]; then
    echo "Aplicando configuración personalizada de nginx..."
    
    # Backup del original
    cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup 2>/dev/null || true
    
    # Copiar nuestra configuración
    cp /home/site/wwwroot/default /etc/nginx/sites-enabled/default
    
    # Verificar sintaxis
    if nginx -t 2>&1; then
        echo "✓ Configuración de nginx válida"
        service nginx reload
        echo "✓ Nginx recargado correctamente"
    else
        echo "✗ Error en configuración de nginx, restaurando backup"
        cp /etc/nginx/sites-enabled/default.backup /etc/nginx/sites-enabled/default 2>/dev/null || true
        service nginx reload
    fi
else
    echo "⚠ No se encontró archivo 'default' en /home/site/wwwroot"
fi

echo "=== Startup completado ==="
