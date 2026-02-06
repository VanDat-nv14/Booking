# Backend Configuration

This application requires the following environment variables to be set.

## Database
- `DB_URL`: JDBC URL (e.g., jdbc:sqlserver://localhost:1433;databaseName=khach_san;encrypt=true;trustServerCertificate=true)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

## Security
- `JWT_SECRET`: 256-bit Hex-encoded secret key for JWT signing.

## OAuth2 (Optional)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`

## Email (Optional)
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

You can set these in your IDE (IntelliJ/Eclipse) run configuration or in your OS environment variables.
