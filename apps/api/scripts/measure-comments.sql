-- Run in psql. The temporary table is private to this session.
CREATE TEMP TABLE comment_sample (LIKE comments INCLUDING DEFAULTS);
INSERT INTO comment_sample (bear_id, author, text, created_at)
SELECT 'bear-' || (n % 8), 'Demo', 'Comment ' || n,
       timestamptz '2026-01-01' + n * interval '1 second'
FROM generate_series(1, 100000) AS n;
ANALYZE comment_sample;
PREPARE comment_page AS
SELECT *, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_time
FROM comment_sample
WHERE bear_id = 'bear-0'
ORDER BY created_at DESC, id DESC LIMIT 21;
EXPLAIN (ANALYZE, BUFFERS) EXECUTE comment_page;
CREATE INDEX sample_bear_created_idx ON comment_sample (bear_id, created_at, id);
EXPLAIN (ANALYZE, BUFFERS) EXECUTE comment_page;
