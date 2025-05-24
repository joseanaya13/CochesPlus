<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    protected $fillable = ['nombre'];

    public $timestamps = true;

    public function coches()
    {
        return $this->hasMany(Coche::class);
    }
}
