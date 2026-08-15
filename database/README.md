# Database and demo dataset

The repository keeps the database structure and reproducible demo dataset as SQL migrations under `backend/migrations`.

For a fresh PostgreSQL database, run the migrations in chronological order. The catalog migrations include the demo fashion catalog, product media references, bilingual catalog content, category hierarchy, order lifecycle support, and the later legacy-brand cleanup migration.

Do **not** commit a raw production `pg_dump` containing customer accounts, password hashes, addresses, orders, tokens, or payment records. If a reviewer needs sample data, use the migration/seed SQL already included in the repository.

Local database backups created by the maintenance scripts are intentionally kept outside Git.
