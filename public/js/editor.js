export function createEditor(container, { value, dark, onChange, onSave }) {
  const cm = CodeMirror(container, {
    value,
    mode:           'markdown',
    theme:          dark ? 'dracula' : 'default',
    lineNumbers:    false,
    lineWrapping:   true,
    autofocus:      true,
    indentUnit:     2,
    tabSize:        2,
    viewportMargin: Infinity,
    extraKeys: {
      Tab:      cm => cm.replaceSelection('  '),
      'Cmd-S':  () => onSave?.(),
      'Ctrl-S': () => onSave?.(),
    },
  });
  cm.on('change', instance => onChange?.(instance.getValue()));
  return cm;
}
