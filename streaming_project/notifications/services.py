from string import Formatter


def render_template(template: str, context: dict) -> str:
    from string import Formatter

    def get_nested_value(obj, path):
        for part in path.split('.'):
            if isinstance(obj, dict):
                obj = obj.get(part, '')
            else:
                obj = getattr(obj, part, '')
        return obj or ''

    formatter = Formatter()
    parts = []

    for literal_text, field_name, *_ in formatter.parse(template):
        parts.append(literal_text)  # обычный текст из шаблона

        if field_name is not None:  # если {} действительно есть
            try:
                value = str(get_nested_value(context, field_name))
            except Exception:
                value = ''
            parts.append(value)  # безопасная подстановка
        elif field_name is None:
            continue  # безопасно, без мусора

    return ''.join(parts)
