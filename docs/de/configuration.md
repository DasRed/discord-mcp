---
title: Konfiguration
description: Alle Umgebungsvariablen von discord-mcp mit Standardwerten, dazu der Login per Passwort, Zwei-Faktor (TOTP) oder Session-Token und was bei Captcha hilft.
order: 20
slug: konfiguration
section: Einrichtung
---

## Umgebungsvariablen

discord-mcp wird komplett über Umgebungsvariablen konfiguriert. Alle Variablen beginnen mit `DISCORD_MCP_`. Eine Vorlage findest du in [`.env.example`](https://github.com/DasRed/discord-mcp/blob/main/.env.example).

| Name                                | Standard                     | Beschreibung                                                                                  |
|-------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| `DISCORD_MCP_SERVER_HOST`           | `0.0.0.0`                    | Adresse, auf der der Server lauscht.                                                          |
| `DISCORD_MCP_SERVER_PORT`           | `3000`                       | Port des Servers.                                                                             |
| `DISCORD_MCP_SERVER_LOG_LEVEL`      | `info`                       | Log-Level: `fatal`, `error`, `warn`, `info`, `debug`, `trace` oder `silent`.                  |
| `DISCORD_MCP_PATH`                  | `/mcp`                       | Pfad des MCP-Endpunkts.                                                                       |
| `DISCORD_MCP_READ_ONLY`             | `true`                       | Nur lesende Tools anbieten. Mit `false` kommt `send_message` dazu.                            |
| `DISCORD_MCP_AUTH_TOKEN`            | –                            | Wenn gesetzt, verlangt `/mcp` den Header `Authorization: Bearer <token>`.                     |
| `DISCORD_MCP_DISCORD_EMAIL`         | –                            | E-Mail des Discord-Kontos für den Browser-Login.                                              |
| `DISCORD_MCP_DISCORD_PASSWORD`      | –                            | Passwort des Discord-Kontos.                                                                  |
| `DISCORD_MCP_DISCORD_TOTP_SECRET`   | –                            | Base32-Secret der Authenticator-App, nötig bei Zwei-Faktor-Login.                             |
| `DISCORD_MCP_DISCORD_TOKEN`         | –                            | Session-Token. Wenn gesetzt, startet kein Browser.                                            |
| `DISCORD_MCP_DISCORD_DATA_DIR`      | `./data`                     | Verzeichnis für Session und Token. Im Image `/var/www/data`.                                  |
| `DISCORD_MCP_DISCORD_HEADLESS`      | `true`                       | Chromium ohne Fenster starten. Lokal auf `false` setzen, um ein Captcha zu lösen.             |
| `DISCORD_MCP_DISCORD_LOGIN_TIMEOUT` | `120000`                     | Maximale Dauer eines Browser-Logins in Millisekunden.                                         |
| `DISCORD_MCP_DISCORD_API_URL`       | `https://discord.com/api/v9` | Basis-URL der Discord-API.                                                                    |

## Login

Der Server holt sich das Session-Token in dieser Reihenfolge:

1. **`DISCORD_MCP_DISCORD_TOKEN`**, wenn gesetzt.
2. **Gespeichertes Token** aus dem Datenverzeichnis (Datei `token`).
3. **Browser-Login** mit E-Mail, Passwort und gegebenenfalls TOTP. Danach landen Token und Browser-Session im Datenverzeichnis.

Antwortet Discord mit `401`, verwirft der Server das Token und meldet sich neu an. Dafür braucht er E-Mail und Passwort. Mit einem reinen Token ohne Zugangsdaten musst du nach Ablauf selbst ein neues eintragen.

### Zwei-Faktor-Login

Hast du 2FA aktiv, braucht der Server das Secret deiner Authenticator-App, nicht einen einzelnen Code.

1. In Discord **Einstellungen** → **Mein Account** → **Authentifizierungs-App aktivieren** (oder neu einrichten).
2. Beim QR-Code den Schlüssel als Text anzeigen lassen.
3. Den Schlüssel als `DISCORD_MCP_DISCORD_TOTP_SECRET` eintragen und gleichzeitig in deiner Authenticator-App hinterlegen.

### Session-Token selbst auslesen

Statt Passwort kannst du das Token aus deinem eigenen Browser nehmen:

1. Discord im Browser öffnen und anmelden.
2. Entwicklertools öffnen, Tab **Netzwerk**.
3. Eine beliebige Anfrage an `discord.com/api/` auswählen.
4. Den Wert des Request-Headers `Authorization` kopieren und als `DISCORD_MCP_DISCORD_TOKEN` setzen.

> [!CAUTION]
> Das Token ist so viel wert wie dein Passwort. Wer es hat, ist in deinem Namen angemeldet. Abmelden in Discord macht es ungültig.

### Captcha oder neuer Standort

Ein Login von einer unbekannten IP (z. B. einem Server) beantwortet Discord manchmal mit einem Captcha oder einer Bestätigung per E-Mail. Dann meldest du dich einmal lokal mit sichtbarem Browser an und kopierst die Session auf den Server:

```sh
DISCORD_MCP_DISCORD_HEADLESS=false npm run dev
```

1. Im Browserfenster das Captcha lösen.
2. Ein beliebiges Tool einmal aufrufen.
3. `./data/storage-state.json` und `./data/token` in das Datenvolume des Containers kopieren.

Oder du setzt einfach `DISCORD_MCP_DISCORD_TOKEN`.

## Beispiel

```sh
DISCORD_MCP_DISCORD_EMAIL=ich@example.com
DISCORD_MCP_DISCORD_PASSWORD=dein-passwort
DISCORD_MCP_DISCORD_TOTP_SECRET=JBSWY3DPEHPK3PXP
DISCORD_MCP_READ_ONLY=true
```
