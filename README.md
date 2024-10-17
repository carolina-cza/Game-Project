# Game-Project

# Datenbankverbindung herstellen
Um die Datenbankstruktur in Visual Studio zu erstellen und zu verwalten, können Sie die integrierten Tools verwenden, die Visual Studio bietet. Hier ist eine Schritt-für-Schritt-Anleitung, wie Sie dies tun können:

### 1. Installieren Sie die erforderlichen Erweiterungen
Stellen Sie sicher, dass Sie die folgenden Erweiterungen installiert haben:
- **SQL Server Data Tools**: Diese Erweiterung ermöglicht es Ihnen, Datenbankprojekte zu erstellen und zu verwalten.
- **MySQL for Visual Studio**: Diese Erweiterung ermöglicht die Integration von MySQL-Datenbanken in Visual Studio.

### 2. Erstellen Sie ein neues Datenbankprojekt
1. Öffnen Sie Visual Studio.
2. Gehen Sie zu **Datei > Neu > Projekt**.
3. Wählen Sie unter **Installiert > Vorlagen > Andere Projekttypen > SQL Server** das **SQL Server-Datenbankprojekt** aus.
4. Geben Sie Ihrem Projekt einen Namen und klicken Sie auf **Erstellen**.

### 3. Verbinden Sie sich mit Ihrer MySQL-Datenbank
1. Öffnen Sie den **Server-Explorer** (Ansicht > Server-Explorer).
2. Klicken Sie mit der rechten Maustaste auf **Datenverbindungen** und wählen Sie **Verbindung hinzufügen**.
3. Wählen Sie **MySQL-Datenbank** als Datenquelle aus.
4. Geben Sie die Verbindungsinformationen für Ihre MySQL-Datenbank ein (Servername, Benutzername, Passwort, Datenbankname) und klicken Sie auf **OK**.

### 4. Erstellen Sie die Datenbankstruktur
1. Klicken Sie mit der rechten Maustaste auf Ihr Datenbankprojekt im **Projektmappen-Explorer** und wählen Sie **Hinzufügen > Neues Element**.
2. Wählen Sie **SQL Server > Tabelle** aus und geben Sie Ihrer Tabelle einen Namen.
3. Definieren Sie die Spalten und Datentypen Ihrer Tabelle im Tabellen-Designer.
4. Wiederholen Sie diesen Schritt für alle Tabellen, die Sie erstellen möchten.

### 5. SQL-Skripte hinzufügen
1. Klicken Sie mit der rechten Maustaste auf Ihr Datenbankprojekt und wählen Sie **Hinzufügen > Neues Element**.
2. Wählen Sie **SQL Server > SQL-Skript** aus und geben Sie Ihrem Skript einen Namen.
3. Fügen Sie die SQL-Befehle für die Erstellung Ihrer Tabellen und anderer Datenbankobjekte hinzu. Zum Beispiel:
   ```sql
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL
   );

   CREATE TABLE game_scores (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT,
       score INT,
       FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

### 6. Bereitstellen der Datenbank
1. Klicken Sie mit der rechten Maustaste auf Ihr Datenbankprojekt und wählen Sie **Bereitstellen**.
2. Wählen Sie die Ziel-Datenbankverbindung aus oder erstellen Sie eine neue Verbindung.
3. Klicken Sie auf **Bereitstellen**, um die Datenbankstruktur auf Ihrem MySQL-Server zu erstellen.

### 7. Verwalten der Datenbank
Sie können den **SQL Server Object Explorer** verwenden, um Ihre Datenbank zu verwalten, Abfragen auszuführen und Daten zu bearbeiten.

Mit diesen Schritten sollten Sie in der Lage sein, die Datenbankstruktur in Visual Studio zu erstellen und zu verwalten. Wenn Sie weitere Fragen haben oder Unterstützung benötigen, lassen Sie es mich wissen!