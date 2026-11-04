import { CodeEditor, CodeEditorControl, Language } from '@patternfly/react-code-editor';
import RedoIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  clearCode: {
    id: 'widgetLayout.codeEditor.clearCode',
    description: 'Clear code control aria label and tooltip',
    defaultMessage: 'Clear code',
  },
});

interface CodeEditorImportProps {
  value: string;
  onChange?: (value: string) => void;
}

export const CodeEditorImport: React.FunctionComponent<CodeEditorImportProps> = ({ value, onChange }) => {
  const intl = useIntl();
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
      aria-label={intl.formatMessage(messages.clearCode)}
      tooltipProps={{ content: intl.formatMessage(messages.clearCode) }}
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
