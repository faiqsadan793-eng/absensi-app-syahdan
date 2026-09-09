<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreKetidakhadiranRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'pegawai';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'keterangan' => ['required', 'string', 'in:Izin,Sakit,Cuti'],
            'tanggal' => ['required', 'date'],
            'deskripsi' => ['required', 'string', 'max:225'],
            'file' => ['nullable', 'file', 'max:5120', 'mimes:jpg,jpeg,png,pdf'],
        ];
    }
}
