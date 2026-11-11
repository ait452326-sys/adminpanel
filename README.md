# AdminFlow — Full-Stack Admin Panel

A responsive starter admin panel built with HTML, CSS, Vanilla JavaScript, Node.js, Express and MySQL.

## Requirements
- Windows 10/11
- Node.js 18 or newer
- MySQL Server 8.x (or compatible MySQL server)
- VS Code (optional, for viewing/editing files)

## 1. Install and prepare
1. Install Node.js from https://nodejs.org/ (choose the LTS version).
2. Install MySQL Community Server from https://dev.mysql.com/downloads/mysql/.
3. During MySQL setup, remember the password you choose for the `root` user.
4. Open Command Prompt (CMD) and check:
   ```cmd
   node -v
   npm -v
   mysql --version
   ```
   If `mysql` is not recognized, add the MySQL Server `bin` folder to Windows PATH, or use MySQL Workbench to run the SQL file.

## 2. Create the database
Open CMD in this project folder. Example:
```cmd
cd path\to\admin-panel
mysql -u root -p < database\schema.sql
```
Enter your MySQL root password when asked. This creates `admin_panel_db` and its `users` table.
If you use MySQL Workbench instead, open `database/schema.sql` and execute the full script.

## 3. Configure environment variables
In the project folder, copy `.env.example` and name the copy `.env`.
Open `.env` in VS Code and set your actual MySQL password:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_REAL_MYSQL_PASSWORD
DB_NAME=admin_panel_db
SESSION_SECRET=replace_this_with_a_long_random_secret_at_least_32_characters
```
Replace `DB_PASSWORD`. Replace `SESSION_SECRET` with a long random secret (at least 32 characters). Do not share your `.env` file or upload it publicly.

## 4. Install packages and start
In CMD, from the `admin-panel` folder:
```cmd
npm install
npm start
```
When you see `MySQL database connected.` and `Admin Panel running at http://localhost:3000`, open:
- Login: http://localhost:3000/login
- Create account: http://localhost:3000/signup

Keep the CMD window open while using the website. Press `CTRL+C` in CMD to stop the server.

## 5. First account / roles
The **first account registered in an empty database becomes the administrator**. This is necessary so you can access the Users page. Later signups receive the regular `user` role. The dashboard is available to every signed-in account; the Users directory is administrator-only.

## 6. What is included
- MySQL-backed registration and login
- bcrypt password hashing
- Server-side sessions stored in MySQL (the `express-mysql-session` package creates its sessions table automatically)
- Protected dashboard page and API
- Admin-only users directory
- Login/signup validation, password visibility toggle, remember-me option
- Responsive desktop, tablet and mobile layout
- Placeholder Profile, Settings and Help pages

## 7. Important notes
- The “Forgot password?” link explains that password recovery is not configured. A real reset flow needs email delivery and expiring reset tokens.
- This is a learning/starter application, not a production deployment. Before public hosting, use HTTPS, set `NODE_ENV=production`, use a strong unique session secret, configure trusted proxy settings if behind a proxy, add CSRF protection and rate limiting, and review your deployment/security setup.
- Google Fonts are loaded from Google when internet access is available; the application still works if the font request is unavailable.
- If the server reports a database connection error, check that the MySQL service is running and the `.env` values match your local MySQL setup.
