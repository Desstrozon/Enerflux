<?php

return [
  'paths' => ['api/*', 'sanctum/csrf-cookie'],

  'allowed_methods' => ['*'],

  //  NUNCA '*' si supports_credentials = true
  'allowed_origins' => [
      'http://localhost:8080',
      'http://127.0.0.1:8080',
  ],

  // Patrón para tu red local (192.168.x.x:puerto)
  'allowed_origins_patterns' => ['#^http://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#'],

  'allowed_headers' => ['*'],

  // expón cabeceras útiles (p.ej. para descargar PDF con nombre de archivo)
  'exposed_headers' => ['Content-Disposition'],

  'max_age' => 0,

  'supports_credentials' => true,
  

];
