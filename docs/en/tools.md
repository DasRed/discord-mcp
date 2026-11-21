---
title: Tools
description: Reference of all discord-mcp tools with parameters, return values and examples.
order: 40
slug: tools
section: Reference
---

## Overview

| Tool                  | Kind      | Purpose                                       |
|-----------------------|-----------|-----------------------------------------------|
| `get_servers`         | 📖 Read   | List the account's servers (guilds)           |
| `get_channels`        | 📖 Read   | List the channels of a server                 |
| `get_direct_messages` | 📖 Read   | List direct messages and group DMs            |
| `read_messages`       | 📖 Read   | Read messages of a channel or DM              |
| `send_message`        | ✏️ Write  | Send a message                                |

In the default mode (`DISCORD_MCP_READ_ONLY=true`) `send_message` is not available. All IDs are Discord snowflakes, i.e. numbers as strings.

The usual path to a message: `get_servers` → `get_channels` → `read_messages`, or for direct messages `get_direct_messages` → `read_messages`.

## `get_servers`

Lists all servers the account is a member of.

Parameters: none.

Returned per server:

| Field     | Description                          |
|-----------|--------------------------------------|
| `id`      | ID of the server                     |
| `name`    | Name                                 |
| `owner`   | `true` if you own the server         |
| `iconURL` | URL of the server icon or `null`     |

## `get_channels`

Lists the channels of a server, sorted by position. Categories, voice channels and threads are included.

| Parameter   | Required | Description                          |
|-------------|----------|--------------------------------------|
| `server_id` | yes      | ID of the server, see `get_servers`  |

Returned per channel: `id`, `name`, `type`, `topic`, `position`, `parentId` (category or parent channel of a thread) and `guildId`.

Possible values of `type`: `text`, `voice`, `category`, `announcement`, `announcement_thread`, `public_thread`, `private_thread`, `stage_voice`, `directory`, `forum`, `media`, `unknown`.

## `get_direct_messages`

Lists direct messages and group DMs, most recent activity first.

Parameters: none.

Returned per channel: `id`, `name` (for unnamed DMs the names of the participants), `type` (`dm` or `group_dm`), `recipients` and `lastMessageAt`.

The `id` works directly with `read_messages` and `send_message`.

## `read_messages`

Reads the newest messages of a channel or direct message, newest first.

| Parameter      | Required | Description                                                  |
|----------------|----------|--------------------------------------------------------------|
| `channel_id`   | yes      | ID of the channel or DM                                      |
| `max_messages` | yes      | Maximum number, 1 to 500                                     |
| `hours_back`   | no       | Only messages of the last hours, decimals like `0.5` work    |

Returned per message: `id`, `channelId`, `authorId`, `authorName`, `content`, `timestamp`, `editedAt` and `attachments` (URLs of the attachments).

Internally the server loads pages of 100 messages and stops once `max_messages` is reached or messages are older than `hours_back`.

## `send_message`

Sends a message on your behalf. Only available with `DISCORD_MCP_READ_ONLY=false`.

| Parameter    | Required | Description                                |
|--------------|----------|--------------------------------------------|
| `channel_id` | yes      | ID of the channel or DM                    |
| `content`    | yes      | Message text, Discord markdown works       |

Messages longer than 2000 characters are split, preferably at paragraphs, then at line breaks, then at spaces. The server waits half a second between parts.

Returns: `channelId` and `messageIds` (one ID per part sent).

## Examples

Read the messages of the last two hours:

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

Send a message:

```json
{
    "name": "send_message",
    "arguments": {
        "channel_id": "123456789012345678",
        "content": "Saturday's training is cancelled."
    }
}
```

Test directly with `curl`:

```sh
curl -X POST http://localhost:3000/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_servers", "arguments": {}}}'
```
