// Kanıt Motoru için örnek sorular (Sprint 14).
// `src/ai/examples.ts` (Sprint 7, 50+ gerçek saha sorusu) TEK kaynaktır
// — burada tekrar YAZILMAZ, yalnızca ilk N'i seçilir (AI ekranındaki
// "Kanıtlar" bölümü ve Evidence Debug ekranı bunu kullanır).
import { EXAMPLE_QUESTIONS } from '../ai/examples.ts';

export const EVIDENCE_EXAMPLE_LIMIT = 10;

export const EVIDENCE_EXAMPLE_QUESTIONS: readonly string[] = EXAMPLE_QUESTIONS.slice(0, EVIDENCE_EXAMPLE_LIMIT);
