<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class SbrModel extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string|null
     */
    protected $connection = 'sbr_db';
}
