# SPIT Student Portal

Student portal built with HTML, CSS, JavaScript, PHP, and MySQL.

## Run locally (XAMPP)

1. Copy the `spit-portal` folder into `C:\xampp\htdocs\`.
2. Create the MySQL database and tables using `sql/setup.sql` if you have not already set them up. Back up any existing data before running setup scripts.
3. Copy `api/config.local.php.example` to `api/config.local.php`.
4. Edit `api/config.local.php` and enter your local MySQL password. This file is excluded by `.gitignore` and must not be uploaded to GitHub.
5. Start Apache in XAMPP and ensure your MySQL Server is running on the configured port.
6. Open `http://localhost/spit-portal/`.

## Database configuration

`api/config.php` contains no hard-coded database password. It loads the ignored local file `api/config.local.php` when present; otherwise it reads the `SPIT_DB_HOST`, `SPIT_DB_PORT`, `SPIT_DB_USER`, `SPIT_DB_PASS`, and `SPIT_DB_NAME` environment variables.

Do not commit passwords, API keys, private database dumps, or real student records.
