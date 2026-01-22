<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Database Connection Name
    |--------------------------------------------------------------------------
    |
    | Here you may specify which of the database connections below you wish
    | to use as your default connection for database operations. This is
    | the connection which will be utilized unless another connection
    | is explicitly specified when you execute a query / statement.
    |
    */

    'default' => env('DB_CONNECTION', 'user_db'),

    /*
    |--------------------------------------------------------------------------
    | Database Connections
    |--------------------------------------------------------------------------
    |
    | Below are all of the database connections defined for your application.
    | An example configuration is provided for each database system which
    | is supported by Laravel. You're free to add / remove connections.
    |
    */

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => env('DB_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
            'busy_timeout' => null,
            'journal_mode' => null,
            'synchronous' => null,
            'transaction_mode' => 'DEFERRED',
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'mariadb' => [
            'driver' => 'mariadb',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'unix_socket' => env('DB_SOCKET', ''),
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => env('DB_SSLMODE', 'prefer'),
        ],

        'sqlsrv' => [
            'driver' => 'sqlsrv',
            'url' => env('DB_URL'),
            'host' => env('DB_HOST', 'localhost'),
            'port' => env('DB_PORT', '1433'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => env('DB_CHARSET', 'utf8'),
            'prefix' => '',
            'prefix_indexes' => true,
            // 'encrypt' => env('DB_ENCRYPT', 'yes'),
            // 'trust_server_certificate' => env('DB_TRUST_SERVER_CERTIFICATE', 'false'),
        ],

        'user_db' => [
            'driver' => env('USER_DB_CONNECTION', 'mysql'),
            'url' => env('USER_DB_URL'),
            'host' => env('USER_DB_HOST', '127.0.0.1'),
            'port' => env('USER_DB_PORT', '3306'),
            'database' => env('USER_DB_DATABASE', 'user_db'),
            'username' => env('USER_DB_USERNAME', 'root'),
            'password' => env('USER_DB_PASSWORD', ''),
            'unix_socket' => env('USER_DB_SOCKET', ''),
            'charset' => env('USER_DB_CHARSET', 'utf8mb4'),
            'collation' => env('USER_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('USER_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'zcs_db' => [
            'driver' => env('ZCS_DB_CONNECTION', 'mysql'),
            'url' => env('ZCS_DB_URL'),
            'host' => env('ZCS_DB_HOST', '127.0.0.1'),
            'port' => env('ZCS_DB_PORT', '3306'),
            'database' => env('ZCS_DB_DATABASE', 'zcs_db'),
            'username' => env('ZCS_DB_USERNAME', 'root'),
            'password' => env('ZCS_DB_PASSWORD', ''),
            'unix_socket' => env('ZCS_DB_SOCKET', ''),
            'charset' => env('ZCS_DB_CHARSET', 'utf8mb4'),
            'collation' => env('ZCS_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('ZCS_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'hbr_db' => [
            'driver' => env('HBR_DB_CONNECTION', 'mysql'),
            'url' => env('HBR_DB_URL'),
            'host' => env('HBR_DB_HOST', '127.0.0.1'),
            'port' => env('HBR_DB_PORT', '3306'),
            'database' => env('HBR_DB_DATABASE', 'hbr_db'),
            'username' => env('HBR_DB_USERNAME', 'root'),
            'password' => env('HBR_DB_PASSWORD', ''),
            'unix_socket' => env('HBR_DB_SOCKET', ''),
            'charset' => env('HBR_DB_CHARSET', 'utf8mb4'),
            'collation' => env('HBR_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('HBR_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'omt_db' => [
            'driver' => env('OMT_DB_CONNECTION', 'mysql'),
            'url' => env('OMT_DB_URL'),
            'host' => env('OMT_DB_HOST', '127.0.0.1'),
            'port' => env('OMT_DB_PORT', '3306'),
            'database' => env('OMT_DB_DATABASE', 'omt_db'),
            'username' => env('OMT_DB_USERNAME', 'root'),
            'password' => env('OMT_DB_PASSWORD', ''),
            'unix_socket' => env('OMT_DB_SOCKET', ''),
            'charset' => env('OMT_DB_CHARSET', 'utf8mb4'),
            'collation' => env('OMT_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('OMT_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'sbr_db' => [
            'driver' => env('SBR_DB_CONNECTION', 'mysql'),
            'url' => env('SBR_DB_URL'),
            'host' => env('SBR_DB_HOST', '127.0.0.1'),
            'port' => env('SBR_DB_PORT', '3306'),
            'database' => env('SBR_DB_DATABASE', 'sbr_db'),
            'username' => env('SBR_DB_USERNAME', 'root'),
            'password' => env('SBR_DB_PASSWORD', ''),
            'unix_socket' => env('SBR_DB_SOCKET', ''),
            'charset' => env('SBR_DB_CHARSET', 'utf8mb4'),
            'collation' => env('SBR_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('SBR_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

        'ipc_db' => [
            'driver' => env('IPC_DB_CONNECTION', 'mysql'),
            'url' => env('IPC_DB_URL'),
            'host' => env('IPC_DB_HOST', '127.0.0.1'),
            'port' => env('IPC_DB_PORT', '3306'),
            'database' => env('IPC_DB_DATABASE', 'ipc_db'),
            'username' => env('IPC_DB_USERNAME', 'root'),
            'password' => env('IPC_DB_PASSWORD', ''),
            'unix_socket' => env('IPC_DB_SOCKET', ''),
            'charset' => env('IPC_DB_CHARSET', 'utf8mb4'),
            'collation' => env('IPC_DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => null,
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                (PHP_VERSION_ID >= 80500 ? \Pdo\Mysql::ATTR_SSL_CA : \PDO::MYSQL_ATTR_SSL_CA) => env('IPC_MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Repository Table
    |--------------------------------------------------------------------------
    |
    | This table keeps track of all the migrations that have already run for
    | your application. Using this information, we can determine which of
    | the migrations on disk haven't actually been run on the database.
    |
    */

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Redis Databases
    |--------------------------------------------------------------------------
    |
    | Redis is an open source, fast, and advanced key-value store that also
    | provides a richer body of commands than a typical key-value system
    | such as Memcached. You may define your connection settings here.
    |
    */

    'redis' => [

        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel')).'-database-'),
            'persistent' => env('REDIS_PERSISTENT', false),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
            'max_retries' => env('REDIS_MAX_RETRIES', 3),
            'backoff_algorithm' => env('REDIS_BACKOFF_ALGORITHM', 'decorrelated_jitter'),
            'backoff_base' => env('REDIS_BACKOFF_BASE', 100),
            'backoff_cap' => env('REDIS_BACKOFF_CAP', 1000),
        ],

    ],

];
