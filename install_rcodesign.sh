#!/bin/bash
set -e

REPO="indygreg/apple-platform-rs"
BINARY_NAME="rcodesign"

# Проверяем, установлен ли jq, если нет — устанавливаем
if ! command -v jq &> /dev/null; then
    echo "Устанавливаем jq для парсинга JSON..."
    sudo apt update && sudo apt install -y jq
fi

echo "🔍 Получение последнего релиза..."
LATEST_TAG_FULL=$(curl -s https://api.github.com/repos/$REPO/releases/latest | jq -r '.tag_name')

echo "Полученный tag_name: $LATEST_TAG_FULL"

# Извлекаем версию из строки (например, из apple-codesign/0.29.0 -> 0.29.0)
LATEST_VERSION=$(echo "$LATEST_TAG_FULL" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

echo "👉 Последняя версия: $LATEST_VERSION"

ARCHIVE_NAME="apple-codesign-${LATEST_VERSION}-x86_64-unknown-linux-musl.tar.gz"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/$LATEST_TAG_FULL/$ARCHIVE_NAME"

echo "⬇️ Скачивание: $DOWNLOAD_URL"
curl -L -o "$ARCHIVE_NAME" "$DOWNLOAD_URL"

echo "📦 Распаковка..."
tar -xf "$ARCHIVE_NAME"
cd "apple-codesign-${LATEST_VERSION}-x86_64-unknown-linux-musl"

echo "🚀 Установка..."
sudo install $BINARY_NAME /usr/local/bin/

echo "✅ Установлено:"
rcodesign --version
