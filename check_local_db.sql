-- Check if there are any local databases
SELECT datname FROM pg_database WHERE datistemplate = false;
