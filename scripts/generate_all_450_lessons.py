import json
from datetime import date
from pathlib import Path

OUTPUT = Path(__file__).resolve().parent.parent / 'data' / 'all_450_microlessons.json'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

LEVEL_BREAKDOWN = {
    'Seconde': 120,
    'Première': 150,
    'Terminale': 180
}

SUBJECTS = ['Mathématiques', 'Physique', 'Chimie']

def pad(n):
    return str(n).zfill(2)

def build_id(subject_index: int, level_index: int, seq: int) -> str:
    prefix = ['M', 'P', 'C'][subject_index]
    lvl = ['2', '1', 'T'][level_index]
    return f"{prefix}{lvl}-{pad(seq)}"

def build_lesson(subject_index: int, level: str, level_index: int, seq: int) -> dict:
    subject = SUBJECTS[subject_index]
    return {
        'id': build_id(subject_index, level_index, seq),
        'level': level,
        'subject': subject,
        'chapter': 'Chapitre générique',
        'title': f"Micro-leçon {seq} - {subject}",
        'duration_min': 8 + (seq % 5),
        'objectives': [
            'Comprendre la notion clé',
            'Savoir appliquer la méthode',
            'Identifier les erreurs fréquentes'
        ],
        'prerequisites': [
            'Notions de base du chapitre'
        ],
        'content_types': ['video', 'animation', 'quiz', 'exercises'],
        'difficulty': 1 + (seq % 5),
        'xp_reward': 50 + (seq % 3) * 25,
        'tags': ['général', subject.lower()]
    }

def generate_lessons():
    lessons = []
    for level_index, (level, total) in enumerate(LEVEL_BREAKDOWN.items()):
        per_subject = total // 3
        extra = total % 3
        counts = [per_subject] * 3
        for i in range(extra):
            counts[i] += 1
        for subject_index in range(3):
            for seq in range(1, counts[subject_index] + 1):
                lessons.append(build_lesson(subject_index, level, level_index, seq))
    return lessons

def main():
    lessons = generate_lessons()
    payload = {
        'metadata': {
            'total_lessons': 450,
            'version': '1.0',
            'generated_date': date.today().isoformat(),
            'breakdown': LEVEL_BREAKDOWN
        },
        'lessons': lessons
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"✅ Fichier généré: {OUTPUT}")

if __name__ == '__main__':
    main()










