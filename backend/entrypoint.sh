#!/bin/bash
set -euo pipefail

echo "========================================="
echo "Testing Nginx configuration..."
echo "========================================="
# এই কমান্ডটি লগে ঠিক কী ভুল আছে তা দেখাবে
nginx -t

echo "========================================="
echo "Waiting for database to be ready..."
echo "========================================="
sleep 5

echo "========================================="
echo "Clearing Laravel caches..."
echo "========================================="
php artisan config:clear
php artisan cache:clear

echo "========================================="
echo "Running migrations..."
echo "========================================="
php artisan migrate --force

echo "========================================="
echo "Caching configuration and routes..."
echo "========================================="
php artisan config:cache
php artisan route:cache

echo "========================================="
echo "Starting Supervisor..."
echo "========================================="
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
