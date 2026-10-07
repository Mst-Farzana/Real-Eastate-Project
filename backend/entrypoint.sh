#!/bin/bash
set -euo pipefail

# Use a local SQLite database for the free portfolio deployment unless a
# different connection has explicitly been configured in Render.
export DB_CONNECTION="${DB_CONNECTION:-sqlite}"

if [ "$DB_CONNECTION" = "sqlite" ]; then
    export DB_DATABASE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"

    if [ "$DB_DATABASE" != ":memory:" ]; then
        mkdir -p "$(dirname "$DB_DATABASE")"
        touch "$DB_DATABASE"
        chown www-data:www-data "$(dirname "$DB_DATABASE")" "$DB_DATABASE"
    fi
fi

# Wait until the database is ready
echo "Waiting for database to be ready..."
sleep 10

# Clear the cache
php artisan config:clear
php artisan cache:clear

# Run migrations (tables are created automatically)
echo "Running migrations..."
php artisan migrate --force

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
    echo "Seeding portfolio demo data..."
    php artisan db:seed --force
fi

# Optimize the cache again
php artisan config:cache
php artisan route:cache

# Start Nginx and PHP-FPM
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
