---
title: Sicherheit
description: Was discord-mcp mit deinem Discord-Konto darf, wo Zugangsdaten liegen und wie du den Endpunkt absicherst.
order: 50
slug: sicherheit
section: Referenz
---

## Nutzungsbedingungen

> [!WARNING]
> discord-mcp steuert ein normales Benutzerkonto. Das gilt bei Discord als „Self-Bot" und verstößt gegen die [Nutzungsbedingungen](https://discord.com/terms). Discord kann das Konto sperren. Nutze am besten ein eigenes Konto dafür und rechne damit, dass es irgendwann auffällt.

Um das Risiko klein zu halten, verhält sich der Server möglichst wie die Web-App: gleiche API, Browser-User-Agent, gespeicherte Session statt ständig neuer Logins und eine kurze Pause zwischen den Teilen langer Nachrichten.

## Standard: nur lesen

Ohne weitere Einstellungen bietet der Server nur `get_servers`, `get_channels`, `get_direct_messages` und `read_messages` an. Claude kann dann alles lesen, was dein Konto sieht, aber nichts schicken.

Auch lesend ist das viel: private Server, Direktnachrichten und Gruppen-DMs. Überleg dir, ob Claude das alles sehen soll.

## Schreibender Modus

Mit `DISCORD_MCP_READ_ONLY=false` kann Claude per `send_message` in jeden Kanal und jede DM schreiben, in die dein Konto schreiben darf, und zwar in deinem Namen.

> [!CAUTION]
> Andere sehen nicht, dass Claude die Nachricht geschrieben hat. Stell in Claude ein, dass vor `send_message` immer nachgefragt wird.

Löschen, Bearbeiten, Reaktionen, Beitreten oder Verlassen von Servern gibt es bewusst nicht.

## Zugangsdaten

- E-Mail, Passwort und TOTP-Secret werden nur für den Browser-Login auf `discord.com` genutzt und nie an Claude geschickt.
- Das Session-Token liegt im Datenverzeichnis in der Datei `token` mit Rechten `600`. Daneben liegt die Browser-Session in `storage-state.json`.
- Wer das Datenvolume lesen kann, kann sich als du anmelden. Behandle es wie ein Passwort und lass es aus Backups raus, die andere lesen können.
- Abmelden aller Sitzungen in Discord oder ein neues Passwort machen das Token ungültig.

## Endpunkt absichern

Wer `/mcp` erreicht, kann deine Nachrichten lesen und, im Schreibmodus, in deinem Namen schreiben. Lass den Endpunkt deshalb nie offen im Netz stehen.

| Variante                                | Geeignet für                  | Umsetzung                                                    |
|-----------------------------------------|-------------------------------|--------------------------------------------------------------|
| IP-Allowlist am Reverse Proxy           | Claude (Web, Desktop, Mobile) | Nur die [IPs von Anthropic](https://docs.claude.com/en/api/ip-addresses) und dein eigenes Netz zulassen. |
| Bearer-Token (`DISCORD_MCP_AUTH_TOKEN`) | Claude Code, eigene Clients   | Langen Zufallswert setzen, z. B. `openssl rand -hex 32`.     |
| Nur intern                              | Clients im selben Netz        | Port nur an `127.0.0.1` oder ein internes Netz binden.        |

`/healthz` ist absichtlich ohne Authentifizierung erreichbar und verrät nichts über das Konto.

## Container

- Das Image läuft als Benutzer `node`, nicht als `root`.
- Beschreibbar sein muss nur `/var/www/data`.
- Chromium startet nur für den Login und wird danach wieder geschlossen.
- Secrets gehören in eine `.env` oder einen Secret Store, nicht in die `compose.yaml` im Git-Repository.
