<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // permitir siempre
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:120'],
            'email'     => ['required', 'email', 'max:190', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8'],
            'rol'       => ['required', Rule::in(['cliente', 'vendedor'])],
            'telefono' => 'nullable|string|max:30',

            'zona'      => ['required_if:rol,vendedor', 'string', 'max:120'],
            'direccion' => ['nullable', 'string', 'max:255'],
            //  CAMPOS EXTRA DEL VENDEDOR 
            'vendor_brand'   => ['nullable', 'string', 'max:150'],
            'vendor_company' => ['nullable', 'string', 'max:150'],
            'vendor_website' => ['nullable', 'string', 'max:200'],
            'vendor_message' => ['nullable', 'string', 'max:1000'],

        ];
    }

    public function messages(): array
    {
        return [
            'zona.required_if'      => 'La zona es obligatoria para los vendedores.',
            'direccion.required_if' => 'La dirección es obligatoria para los clientes.',
        ];
    }
}
