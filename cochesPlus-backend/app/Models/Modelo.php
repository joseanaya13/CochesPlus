<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Modelo extends Model
{
    protected $fillable = ['id_marca', 'nombre'];

    public $timestamps = true;

    public function marca()
    {
        return $this->belongsTo(Marca::class, 'id_marca');
    }

    public function coches()
    {
        return $this->hasMany(Coche::class, 'id_modelo');
    }
}
