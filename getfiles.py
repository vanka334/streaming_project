import os
from tabulate import tabulate

# Указываем директорию проекта
root_dir = "."

# Папки, которые нужно игнорировать
ignored_dirs = {'.venv', '.idea', 'node_modules', '__pycache__', 'dist', 'build', 'migrations'}

# Список файлов с их размерами
files_info = []

for dirpath, dirnames, filenames in os.walk(root_dir):
    # Удаляем игнорируемые директории из обхода
    dirnames[:] = [d for d in dirnames if d not in ignored_dirs and not d.startswith('.')]

    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        try:
            size = os.path.getsize(filepath)
            # Приводим путь к более читаемому виду (относительно корня)
            relative_path = os.path.relpath(filepath, root_dir)
            files_info.append([relative_path, f"{size / 1024:.2f} KB"])
        except OSError:
            continue

# Вывод таблицы
print(tabulate(files_info, headers=["Название", "Размер файла"], tablefmt="github"))
