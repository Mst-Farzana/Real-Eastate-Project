#!/bin/bash
set -euo pipefail

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 5

# Clear caches
php artisan config:clear
php artisan cache:clear

# Run migrations
php artisan migrate --force

# Cache configuration and routes
php artisan config:cache
php artisan route:cache

# Start supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
