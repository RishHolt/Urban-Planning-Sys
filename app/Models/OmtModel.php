<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

abstract class OmtModel extends Model
{
    /**
     * The connection name for the model.
     *
     * @var string|null
     */
    protected $connection = 'omt_db';
}
