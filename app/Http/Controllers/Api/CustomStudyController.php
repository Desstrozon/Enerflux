<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\CustomStudyRequestMail;
use App\Mail\CustomStudyResultMail;

class CustomStudyController extends Controller
{
    public function requestStudy(Request $request)
    {
        $user = $request->user(); // viene de auth:sanctum

        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // 1) Mail de confirmación 
        //  Mail::to($user->email)->send(new CustomStudyRequestMail($user));

        // 2) Tres "perfiles" de estudio prefabricados
        $studies = [
            'vivienda' => [
                'title'   => 'Estudio para vivienda conectada a red',
                'summary' => 'Hemos analizado tu hogar como vivienda habitual conectada a la red eléctrica y ahora te presentamos el estudio personalizado de EnerFlux: un informe exclusivo que te dice exactamente cuánta energía solar puedes generar, cuánto reducirás tu factura y en qué tiempo recuperas tu inversión.
                No es un cálculo genérico. Es tu potencial solar, en números reales.
                ¿Listo para convertir tu techo en tu mayor ahorro?',
                'details' => "Para un hogar tipo de 3–4 personas proponemos una instalación de aproximadamente 3,6 kWp con inversor de 3 kW. Esto te permite cubrir buena parte del consumo diurno, incluso en días nublados, y reducir la factura hasta un 50–60 % según tus hábitos.",
                'products' => [
                    'Kit solar 3,6 kWp Enerflux',
                    'Inversor híbrido 3 kW',
                    'Opción de batería de 5 kWh para aumentar el autoconsumo nocturno',
                ],
                'image' => 'monitorizacion.png', 
            ],

            'aislada' => [
                'title'   => 'Estudio para instalación aislada',
                'summary' => 'Te medimos tu producción solar en tiempo real… con nuestra propia placa de 12V y nuestro módulo EnerFlux.',
                'details' => "No te damos estimaciones. Te mostramos lo que realmente produce tu techo: con nuestro módulo EnerFlux —un dispositivo de Arduino con sensores de radiación y potencia— conectamos una pequeña placa solar a tu instalación y medimos exactamente cuánta energía generas, en cada hora, bajo el sol real. Con esos datos, te recomendamos un sistema de 5 kWp + 10 kWh de baterías, ajustado a tu consumo real, no a un promedio teórico. Así, tu instalación aislada no se queda sin luz… nunca.",
                'products' => [
                    'Kit aislada 5 kWp Enerflux',
                    'Inversor híbrido 8 kW Enerflux',
                    'Baterías AGM o litio 10 kWh',
                    'Estructura coplanar o a suelo según el tipo de cubierta',
                ],
                'image' => 'monitorizacion.png',
            ],

            'bombeo' => [
                'title'   => 'Estudio para bombeo solar agrícola',
                'summary' => '¿Cuánta energía real genera tu sol? Lo medimos con EnerFlux… antes de instalar tu bombeo.',
                'details' => "En lugar de adivinar cuánto riego puedes hacer con el sol, colocamos nuestro módulo EnerFlux (Arduino + sensores) en tu campo. Con una placa solar de 12V como referencia, medimos la radiación real, la producción diaria y cómo varía según la hora y la estación. Con esos datos reales, diseñamos un sistema de bombeo de 3 CV que funciona al 100% con sol, sin diésel, sin red, sin sorpresas. Tu riego ahora es inteligente, económico y 100% solar.",
                'products' => [
                    'Kit de bombeo solar 3 CV Enerflux',
                    'Cuadro de control específico para bombeo solar',
                    'Depósito de acumulación adaptado a las necesidades de riego',
                    'Estructura fija optimizada para la inclinación de verano',
                ],
                'image' => 'monitorizacion2.png',
            ],
        ];


        // 3) Elección aleatoria
        $keys      = array_keys($studies);
        $randomKey = $keys[array_rand($keys)];
        $study     = $studies[$randomKey];

        // 4) Mail con el estudio "resultado"
        Mail::to($user->email)->send(new CustomStudyResultMail($user, $study));

        return response()->json([
            'message' => 'Solicitud de estudio enviada. Revisa tu correo.',
            'profile' => $randomKey, // solo info si quieres ver qué perfil ha tocado
        ]);
    }
}
