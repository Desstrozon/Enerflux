<?php
return [
  'paths' => ['api/*', 'storage/*', 'sanctum/csrf-cookie'],
  'allowed_methods' => ['*'],

  // lee de FRONTEND_ORIGINS (coma-separado) -> lo de tu .env
  'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_ORIGINS', '')))),

  // patrones válidos para cualquier IP de tu red (y localhost)
  'allowed_origins_patterns' => [
    '#^https?://localhost(:\d+)?$#',
    '#^https?://127\.0\.0\.1(:\d+)?$#',
    '#^https?://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
    '#^https?://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$#',
    '#^https?://172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?$#',
  ],

  'allowed_headers' => ['*'],
  'exposed_headers' => ['Content-Disposition'],
  'max_age' => 0,

  // MUY IMPORTANTE: Bearer => false (si pones true, no puedes usar '*')
  'supports_credentials' => env('CORS_SUPPORTS_CREDENTIALS', false),
];
