#!/bin/bash

echo "=== Iniciando configuración de Enerflux ==="

# Configurar nginx con archivo personalizado
if [ -f /home/site/wwwroot/.platform/nginx/default.conf ]; then
    echo "Aplicando configuración personalizada de nginx..."
    cp /home/site/wwwroot/.platform/nginx/default.conf /etc/nginx/sites-enabled/default
    
    # Verificar sintaxis
    nginx -t
    if [ $? -eq 0 ]; then
        echo "✓ Configuración de nginx válida"
        service nginx reload
        echo "✓ Nginx recargado correctamente"
    else
        echo "✗ Error en configuración de nginx, restaurando default"
        # No hacer nada, dejar el default de Azure
    fi
else
    echo "⚠ No se encontró configuración personalizada en .platform/nginx/default.conf"
fi

# Iniciar PHP-FPM
echo "Iniciando PHP-FPM..."
php-fpm -D

echo "=== Startup completado ==="
