<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Pdo\Mysql;

class CopyToTiDB extends Command
{
    protected $signature = 'db:copy-to-tidb';

    protected $description = 'Copy application data from the local MySQL database to TiDB';

    public function handle(): int
    {
        $tidbUrl = config('database.connections.tidb.url');

        if (! $tidbUrl) {
            $this->error('Set TIDB_URL in the local .env file before running this command.');

            return self::FAILURE;
        }

        $database = ltrim((string) parse_url($tidbUrl, PHP_URL_PATH), '/');

        if ($database === '' || in_array(strtolower($database), [
            'information_schema',
            'mysql',
            'performance_schema',
            'sys',
        ], true)) {
            $this->error('TIDB_URL must point to an application database, not a TiDB system database.');

            return self::FAILURE;
        }

        $targetOptions = config('database.connections.tidb.options', []);
        $caPath = $targetOptions[Mysql::ATTR_SSL_CA] ?? null;

        if (! is_string($caPath) || ! is_file($caPath)) {
            $this->error('Set TIDB_SSL_CA to the downloaded TiDB CA certificate file.');

            return self::FAILURE;
        }

        if (($targetOptions[Mysql::ATTR_SSL_VERIFY_SERVER_CERT] ?? false) !== true) {
            $this->error('Set TIDB_SSL_VERIFY_SERVER_CERT=true before connecting to TiDB.');

            return self::FAILURE;
        }

        $source = DB::connection('mysql');
        $target = DB::connection('tidb');
        $source->getPdo();
        $target->getPdo();

        if ($this->call('migrate', ['--database' => 'tidb', '--force' => true]) !== self::SUCCESS) {
            return self::FAILURE;
        }

        $tables = [
            'users' => ['id'],
            'properties' => ['id'],
            'amenities' => ['id'],
            'property_images' => ['id'],
            'amenity_property' => ['amenity_id', 'property_id'],
            'inquiries' => ['id'],
            'saved_properties' => ['id'],
        ];

        $nonEmptyTables = [];

        foreach ($tables as $table => $orderBy) {
            if ($target->table($table)->count() > 0) {
                $nonEmptyTables[] = $table;
            }
        }

        if ($nonEmptyTables !== []) {
            $this->error(
                'TiDB already contains application rows; nothing was copied. '
                .'Use a new, empty application database before importing.',
            );

            return self::FAILURE;
        }

        $rowCounts = $target->transaction(function () use ($source, $target, $tables): array {
            foreach ($tables as $table => $orderBy) {
                $query = $source->table($table);

                foreach ($orderBy as $column) {
                    $query->orderBy($column);
                }

                $query->chunk(500, function ($rows) use ($target, $table): void {
                    $target->table($table)->insert(
                        $rows->map(fn (object $row): array => (array) $row)->all(),
                    );
                });
            }

            $counts = [];

            foreach ($tables as $table => $orderBy) {
                $sourceCount = $source->table($table)->count();
                $targetCount = $target->table($table)->count();

                if ($sourceCount !== $targetCount) {
                    throw new \RuntimeException("Row-count verification failed for {$table}.");
                }

                $counts[$table] = $targetCount;
            }

            return $counts;
        });

        $this->table(['Table', 'Rows'], collect($rowCounts)
            ->map(fn (int $count, string $table): array => [$table, $count])
            ->values()
            ->all());

        $this->info('Application data copied and row counts verified.');
        $this->line('Sessions, caches, queued jobs, password resets, and API tokens were not copied.');

        return self::SUCCESS;
    }
}
