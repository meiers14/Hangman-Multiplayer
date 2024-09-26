# Hangman Multiplayer Game Projekt an der DHBW

## Teilnehmer
- Sascha Meier
- Jonas Graczikowski

## Kurzbeschreibung
Dieses Projekt umfasst die Konzeption und Entwicklung eines webbasierten Multiplayer-Hangman-Spiels, bei dem zwei Spieler in Echtzeit gegeneinander oder miteinander spielen können. Das Spiel bietet drei verschiedene Modi:

- **Hangman Duell Royale**: Zwei Spieler treten in mehreren Runden gegeneinander an und sammeln mit begrenzten Leben Punkte.
- **Hangman Challenge Arena**: Die Spieler wählen schwierige Wörter für ihre Gegner aus und spielen unabhängig voneinander, um eine hohe Zielpunktzahl zu erreichen.
- **Hangman Kooperationsmission**: In diesem Modus arbeiten beide Spieler zusammen, teilen sich eine bestimmte Anzahl an Leben und sammeln gemeinsam Punkte.

Das System ermöglicht es den Spielern, eigene Lobbys zu erstellen, in denen sie einem Spiel beitreten können. In der Lobby sind die Anzahl der Runden und die Wortschwierigkeit individuell einstellbar.

## Hosting der Anwendung
Um die Anwendung zu hosten, sind folgende Schritte notwendig:

1. Klone das Repository.
2. Stelle sicher, dass Docker und Docker Compose installiert sind.
3. Passe die Umgebungsvariablen in der `.env`-Datei an, um die Datenbankverbindungen korrekt einzustellen.
4. Passe gegebenfalls die URL im Code an, falls die Anwendung nicht unter http://localhost gehostet wird.
5. Starte die Anwendung mit folgendem Befehl:
   
   ```bash
   docker compose up --build
   ```

## Erforderliche .env Variablen

Stelle sicher, dass die folgende Umgebungsvariablen in der `.env`-Datei konfiguriert sind, bevor du die Anwendung startest:

```.env
# Datenbank Konfiguration
HANGMAN_DB=
HANGMAN_DB_USER=
HANGMAN_DB_PASSWORD=
HANGMAN_DB_ROOT_PASSWORD=
```

Diese Datei befindet sich nicht im Repository, muss also manuell im Rootverzeichnis angelegt werden.

## Erforderliche Änderungen an Konfigurationsdateien, wenn die Anwendung nicht auf http://localhost (Port 80) gehostet wird

Falls die Anwendung nicht lokal oder auf einem anderen Port als 80 ausgeführt wird, sind in den folgenden Dateien Anpassungen erforderlich:

### 1. NGINX Konfiguration

In der Datei `nginx/nginx.conf` (Zeile 20):

```nginx
server_name localhost; # Change here if not localhost
```

Ändere localhost entsprechend der IP-Adresse oder Domain, auf der die Anwendung läuft.
Beispiel für eine Änderung:

```nginx
server_name http://example.com:8080;
```

### 2. Environment Konfiguration

In der Datei `angular-frontend/src/environments/environment.ts`:

```typescript
// Change here if not localhost
export const environment = {
  apiUrl: 'http://localhost/api',
  wsUrl: 'ws://localhost/game'
};
```

Ändere localhost in beiden URLs (apiUrl und wsUrl) entsprechend der IP-Adresse oder Domain des Servers. 
Beispiel für eine Änderung:

```typescript
export const environment = {
  apiUrl: 'http://example.com:8080/api',
  wsUrl: 'ws://example.com:8080/game'
};
```

### 3. Docker Compose Port Konfiguration

Falls die Anwendung nicht auf Port 80 laufen soll, muss die Port-Konfiguration in der Datei docker-compose.yaml (Zeile 96) angepasst werden:

```yaml
    - "80:80" # Change here if not port 80
```

Ändere den ersten Portwert (links) entsprechend dem gewünschten Port. 
Beispiel für eine Änderung:

```yaml
    - "8080:80"
```

















