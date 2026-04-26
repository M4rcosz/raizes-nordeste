#!/bin/sh

echo "Waiting database..."
echo "Running migrations..."
npx prisma migrate deploy

echo "Running seed..."
npx prisma db seed

echo "Initializing application..."
exec node dist/src/main.js