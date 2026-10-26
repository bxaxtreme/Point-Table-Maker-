# Database schema plan

The initial guest-mode app stores draft state in browser localStorage. For cloud sync,
add PostgreSQL tables with migrations:

- users (optional, future accounts)
- tournaments (id, owner_id nullable for public/guest drafts, game, name, organizer, created_at)
- teams (id, tournament_id, name, logo_url)
- matches (id, tournament_id, name, match_number, played_at)
- scoring_rules (id, tournament_id, kill_point_value, placement_rules JSONB)
- match_results (id, match_id, team_id, placement, kills, created_at)
- uploaded_screenshots (id, tournament_id, object_key, status, created_at)
- ocr_extractions (id, screenshot_id, raw_text, structured_result JSONB, confidence)
- theme_preferences (id, tournament_id, points_theme_id, certificate_theme_id)
- certificates (id, tournament_id, team_id nullable, certificate_code, template_id, issued_at)

Use migrations, foreign keys, unique constraints, indexes, and server-side ownership checks
before enabling cloud persistence.
