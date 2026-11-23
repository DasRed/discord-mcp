---
title: Tools
description: Referenz aller Tools von discord-mcp, um Server, Kanäle und Direktnachrichten zu lesen und Nachrichten zu senden, mit Parametern, Rückgabe und Beispielen.
order: 40
slug: tools
section: Referenz
---

## Übersicht

| Tool                  | Art          | Zweck                                         |
|-----------------------|--------------|-----------------------------------------------|
| `get_servers`         | 📖 Lesen     | Server (Guilds) des Kontos auflisten          |
| `get_channels`        | 📖 Lesen     | Kanäle eines Servers auflisten                |
| `get_direct_messages` | 📖 Lesen     | Direktnachrichten und Gruppen-DMs auflisten   |
| `read_messages`       | 📖 Lesen     | Nachrichten eines Kanals oder einer DM lesen  |
| `send_message`        | ✏️ Schreiben | Nachricht schicken                            |

Im Standardmodus (`DISCORD_MCP_READ_ONLY=true`) ist `send_message` nicht verfügbar. Alle IDs sind Discord-Snowflakes, also Zahlen als String.

Der übliche Weg zu einer Nachricht: `get_servers` → `get_channels` → `read_messages`, oder für Direktnachrichten `get_direct_messages` → `read_messages`.

## `get_servers`

Listet alle Server, auf denen das Konto Mitglied ist.

Parameter: keine.

Rückgabe pro Server:

| Feld      | Beschreibung                             |
|-----------|------------------------------------------|
| `id`      | ID des Servers                           |
| `name`    | Name                                     |
| `owner`   | `true`, wenn dir der Server gehört       |
| `iconURL` | URL des Server-Icons oder `null`         |

## `get_channels`

Listet die Kanäle eines Servers, sortiert nach Position. Enthalten sind auch Kategorien, Sprachkanäle und Threads.

| Parameter   | Pflicht | Beschreibung                       |
|-------------|---------|------------------------------------|
| `server_id` | ja      | ID des Servers, siehe `get_servers` |

Rückgabe pro Kanal: `id`, `name`, `type`, `topic`, `position`, `parentId` (Kategorie oder Elternkanal eines Threads) und `guildId`.

Mögliche Werte für `type`: `text`, `voice`, `category`, `announcement`, `announcement_thread`, `public_thread`, `private_thread`, `stage_voice`, `directory`, `forum`, `media`, `unknown`.

## `get_direct_messages`

Listet Direktnachrichten und Gruppen-DMs, die mit der jüngsten Aktivität zuerst.

Parameter: keine.

Rückgabe pro Kanal: `id`, `name` (bei DMs ohne Namen die Namen der Teilnehmer), `type` (`dm` oder `group_dm`), `recipients` und `lastMessageAt`.

Die `id` funktioniert direkt mit `read_messages` und `send_message`.

## `read_messages`

Liest die neuesten Nachrichten eines Kanals oder einer Direktnachricht, die neueste zuerst.

| Parameter      | Pflicht | Beschreibung                                                     |
|----------------|---------|------------------------------------------------------------------|
| `channel_id`   | ja      | ID des Kanals oder der DM                                        |
| `max_messages` | ja      | Maximale Anzahl, 1 bis 500                                       |
| `hours_back`   | nein    | Nur Nachrichten der letzten Stunden, auch Kommazahlen wie `0.5`  |

Rückgabe pro Nachricht: `id`, `channelId`, `authorId`, `authorName`, `content`, `timestamp`, `editedAt` und `attachments` (URLs der Anhänge).

Intern lädt der Server in Seiten zu je 100 Nachrichten und hört auf, sobald `max_messages` erreicht ist oder die Nachrichten älter als `hours_back` sind.

## `send_message`

Schickt eine Nachricht in deinem Namen. Nur verfügbar mit `DISCORD_MCP_READ_ONLY=false`.

| Parameter    | Pflicht | Beschreibung                                   |
|--------------|---------|------------------------------------------------|
| `channel_id` | ja      | ID des Kanals oder der DM                      |
| `content`    | ja      | Text der Nachricht, Discord-Markdown geht      |

Nachrichten über 2000 Zeichen werden aufgeteilt, bevorzugt an Absätzen, dann an Zeilenumbrüchen, dann an Leerzeichen. Zwischen den Teilen wartet der Server eine halbe Sekunde.

Rückgabe: `channelId` und `messageIds` (eine ID pro gesendetem Teil).

## Beispiele

Nachrichten der letzten zwei Stunden lesen:

```json
{
    "name": "read_messages",
    "arguments": {
        "channel_id": "123456789012345678",
        "max_messages": 100,
        "hours_back": 2
    }
}
```

Nachricht schicken:

```json
{
    "name": "send_message",
    "arguments": {
        "channel_id": "123456789012345678",
        "content": "Training am Samstag fällt aus."
    }
}
```

Direkt per `curl` testen:

```sh
curl -X POST http://localhost:3000/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_servers", "arguments": {}}}'
```
