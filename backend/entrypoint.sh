#!/bin/bash

# Wait until the database is ready
echo "Waiting for database to be ready..."
sleep 10

# Clear the cache
php artisan config:clear
php artisan cache:clear

# Run migrations (tables are created automatically)
echo "Running migrations..."
php artisan migrate --force

# Optimize the cache again
php artisan config:cache
php artisan route:cache

# Start Nginx and PHP-FPM
echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
