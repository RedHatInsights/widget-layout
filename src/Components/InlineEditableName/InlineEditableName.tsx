import React, { useState } from 'react';
import { Button, Content, Flex, FlexItem, TextInput } from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon, TimesIcon } from '@patternfly/react-icons';

interface InlineEditableNameProps {
  name: string;
  onNameChange?: (name: string) => Promise<void> | void;
}

const InlineEditableName = ({ name, onNameChange }: InlineEditableNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleConfirm = async () => {
    if (editedName.trim() && onNameChange) {
      await onNameChange(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      {isEditing ? (
        <>
          <FlexItem>
            <TextInput
              value={editedName}
              onChange={(_event, value) => setEditedName(value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleConfirm();
                if (event.key === 'Escape') handleCancel();
              }}
              aria-label="Dashboard name"
              autoFocus
            />
          </FlexItem>
          <FlexItem>
            <Button variant="plain" aria-label="Confirm name" onClick={handleConfirm} icon={<CheckIcon />} />
          </FlexItem>
          <FlexItem>
            <Button variant="plain" aria-label="Cancel editing" onClick={handleCancel} icon={<TimesIcon />} />
          </FlexItem>
        </>
      ) : (
        <>
          <FlexItem>
            <Content component="h2">{name}</Content>
          </FlexItem>
          {onNameChange && (
            <FlexItem>
              <Button
                variant="plain"
                aria-label="Edit dashboard name"
                onClick={() => {
                  setEditedName(name);
                  setIsEditing(true);
                }}
                icon={<PencilAltIcon />}
              />
            </FlexItem>
          )}
        </>
      )}
    </Flex>
  );
};

export default InlineEditableName;
