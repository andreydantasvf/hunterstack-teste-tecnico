#!/bin/bash

# Script para executar testes de integração
set -e

echo "🚀 Iniciando testes de integração..."

# Função para limpeza
cleanup() {
    echo "🧹 Limpando ambiente..."
    docker compose -f docker-compose.test.yml down -v > /dev/null 2>&1 || true
}

# Configurar limpeza automática
trap cleanup EXIT

# Subir banco de teste
echo "📦 Subindo banco de teste..."
docker compose -f docker-compose.test.yml up -d

sleep 1

# Executar migrations do Prisma
npm run test:db:migrate

sleep 1

# Executar os testes
npm run test

