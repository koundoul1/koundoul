#!/bin/bash
# Script de migration Prisma pour Render

echo "🔄 Exécution des migrations Prisma..."

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

echo "✅ Migrations terminées"


