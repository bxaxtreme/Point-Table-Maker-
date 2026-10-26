# OCR integration contract

The current UI validates and previews a screenshot; it does not pretend to extract scores.

A future OCR service should:
1. Accept an authenticated/authorized upload or a short-lived signed object URL.
2. Validate file type, size, and image content.
3. Run OCR (e.g. PaddleOCR or a managed OCR provider).
4. Return structured candidate rows: teamName, placement, kills, confidence, sourceText.
5. Keep OCR output untrusted until the user confirms it.
6. Recalculate points server-side using the tournament's selected scoring rules.
7. Add idempotency and rate limits to prevent duplicate processing.
8. Avoid logging uploaded image contents or secrets.
