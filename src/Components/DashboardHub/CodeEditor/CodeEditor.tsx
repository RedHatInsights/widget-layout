import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import React, { useState } from 'react';

interface CodeEditorImportProps {
  onChange?: (value: string) => void;
}

export const CodeEditorImport: React.FunctionComponent<CodeEditorImportProps> = ({ onChange: onChangeFromParent }) => {
  const [code, setCode] = useState('');

  const onEditorDidMount = (
    editor: { layout: () => void; focus: () => void },
    monaco: { editor: { getModels: () => { updateOptions: (arg0: { tabSize: number }) => void }[] } }
  ) => {
    editor.layout();
    editor.focus();
    monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  };

  const onChange = (value: string) => {
    setCode(value);
    onChangeFromParent?.(value);
  };

  const onRefreshCode = () => {
    setCode('');
    onChangeFromParent?.('');
  };

  const customControl = (
    <CodeEditorControl
      icon={<RedoIcon />}
      aria-label="Clear code"
      tooltipProps={{ content: 'Clear code' }}
      onClick={onRefreshCode}
      isVisible={code !== ''}
    />
  );

  return (
    <>
      <CodeEditor
        isCopyEnabled
        isLanguageLabelVisible
        isLineNumbersVisible={false}
        code={code}
        customControls={customControl}
        onChange={onChange}
        language={Language.json}
        onEditorDidMount={onEditorDidMount}
        height="200px"
      />
    </>
  );
};
