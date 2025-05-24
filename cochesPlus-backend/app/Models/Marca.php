<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marca extends Model
{
    protected $fillable = ['nombre'];

    public $timestamps = true;

    public function modelos()
    {
        return $this->hasMany(Modelo::class, 'id_marca');
    }

    public function coches()
    {
        return $this->hasManyThrough(Coche::class, Modelo::class, 'id_marca', 'id_modelo');
    }
}
