# Локальный Telegram-бот для заявок

## Что уже настроено
- Сайт отправляет заявку в локальный relay: `http://127.0.0.1:8787/lead`.
- Relay берёт токен и chat id из файла `local-private/telegram-config.json`.
- Папка `local-private/` исключена из git (`.gitignore`), чтобы секреты не попали в репозиторий.

## Как запускать
1. Убедитесь, что установлен Node.js 18+.
2. В корне проекта запустите:
   - `node local-bot-relay.mjs`
3. Оставьте этот процесс запущенным.

После этого заявки с формы будут приходить в Telegram-бота.

## Автозапуск в Windows
1. Выполните в PowerShell (из корня проекта):
   - `powershell -ExecutionPolicy Bypass -File .\setup-relay-autostart.ps1`
2. Будет создана задача `PermanentMaikapTelegramRelay`, которая запускает relay при входе в Windows.
3. Скрипт запуска: `start-relay.ps1`.
