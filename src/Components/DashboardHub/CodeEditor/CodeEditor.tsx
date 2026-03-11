import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import React from 'react';

interface CodeEditorImportProps {
  value: string;
  onChange?: (value: string) => void;
}

export const CodeEditorImport: React.FunctionComponent<CodeEditorImportProps> = ({ value, onChange }) => {
  const onEditorDidMount = (
    editor: { layout: () => void; focus: () => void },
    monaco: { editor: { getModels: () => { updateOptions: (arg0: { tabSize: number }) => void }[] } }
  ) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };

  const onRefreshCode = () => {
    onChange?.('');
  };

  const customControl = (
    <CodeEditorControl
      icon={<RedoIcon />}
      aria-label="Clear code"
      tooltipProps={{ content: 'Clear code' }}
      onClick={onRefreshCode}
      isVisible={value !== ''}
    />
  );

  return (
    <CodeEditor
      isCopyEnabled
      isLanguageLabelVisible
      isLineNumbersVisible={false}
      code={value}
      customControls={customControl}
      onChange={(val) => onChange?.(val)}
      language={Language.json}
      onEditorDidMount={onEditorDidMount}
      height="200px"
    />
  );
};
