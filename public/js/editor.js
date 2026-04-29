CodeMirror.defineMode('markdown-enhanced', config =>
  CodeMirror.overlayMode(
    CodeMirror.getMode(config, 'markdown'),
    {
      token(stream) {
        if (stream.sol() && stream.match(/^\s*(?:[-*+]|\d+\.)\s/))
          return 'list-marker';
        stream.skipToEnd();
        return null;
      },
    }
  )
);

export function createEditor(container, { value, dark, onChange, onSave, onToggleEdit }) {
  const cm = CodeMirror(container, {
    value,
    mode:           'markdown-enhanced',
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
      'Cmd-I':  () => onToggleEdit?.(),
      'Ctrl-I': () => onToggleEdit?.(),
    },
  });
  cm.on('change', instance => onChange?.(instance.getValue()));
  return cm;
}
