<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class HbrModel extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string|null
     */
    protected $connection = 'hbr_db';
}
