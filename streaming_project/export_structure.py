import os
from pathlib import Path


def generate_structure(start_path, output_file="project_structure.txt"):
    ignore = {
        'venv', '__pycache__', 'migrations', '.idea',
        'Lib', 'lib', 'Scripts', 'Include',  # Игнорируем папки виртуального окружения
        '.git', '.vscode', 'staticfiles', 'media'  # Доп. игнорируемые папки
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(start_path):
            # Фильтруем игнорируемые папки
            dirs[:] = [d for d in dirs if d not in ignore and not d.startswith('.')]

            level = root.replace(str(start_path), '').count(os.sep)
            indent = '│   ' * level
            f.write(f"{indent}├─ {os.path.basename(root)}\n")

            for file in files:
                if not file.endswith(('.pyc', '.tmp')):  # Игнорируем бинарные/временные файлы
                    f.write(f"{indent}│   ├─ {file}\n")


if __name__ == '__main__':
    generate_structure(Path(__file__).parent)