import './Header.scss';

import {
  Button,
  ButtonType,
  ClipboardCopy,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Level,
  LevelItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  PageSectionVariants,
  Radio,
  Stack,
  StackItem,
  TextArea,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { CheckIcon, ExclamationCircleIcon, PlusIcon, TimesIcon } from '@patternfly/react-icons';
import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { initialLayout, isDefaultLayout, layoutAtom, prevLayoutAtom } from '../../state/layoutAtom';
import useCurrentUser from '../../hooks/useCurrentUser';

const Controls = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const [customValueValidationError, setCustomValueValidationError] = React.useState('');
  const toggleOpen = useSetAtom(drawerExpandedAtom);
  const setPrevLayout = useSetAtom(prevLayoutAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const CONSOLE_DEFAULT = 'console-default';
  const CUSTOM = 'custom';
  const [checked, setChecked] = React.useState(isDefaultLayout(layout) ? CONSOLE_DEFAULT : CUSTOM);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onCustomConfigSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!customValue) {
      setCustomValueValidationError('Input value is required.');
      return;
    }
    try {
      const layout = JSON.parse(customValue);
      if (isDefaultLayout(layout)) {
        setChecked(CONSOLE_DEFAULT);
      }
      setLayout(layout);
      setIsOpen(false);
      setCustomValue('');
    } catch (e) {
      console.error(e);
      setCustomValueValidationError('Invalid input value.');
      return;
    }
  };

  const onDefaultConfigSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setChecked(CONSOLE_DEFAULT);
    setLayout(initialLayout);
    setIsOpen(false);
    setCustomValue('');
  };

  return (
    <ToolbarGroup>
      <ToolbarItem spacer={{ default: 'spacerNone' }}>
        <ClipboardCopy isCode hoverTip="Copy current configuration string" clickTip="Configuration string copied to clipboard">
          {JSON.stringify(layout)}
        </ClipboardCopy>
      </ToolbarItem>
      <ToolbarItem spacer={{ default: 'spacerSm' }}>
        <Stack>
          <StackItem>
            <Dropdown
              isOpen={isOpen}
              activeItemId={0}
              onOpenChange={(isOpen: boolean) => {
                setIsOpen(isOpen);
                setChecked(isDefaultLayout(layout) ? CONSOLE_DEFAULT : CUSTOM);
                setCustomValueValidationError('');
              }}
              toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
                  Config view: {checked}
                </MenuToggle>
              )}
            >
              <DropdownGroup label="Dashboard configuration" labelHeadingLevel="h3">
                <DropdownList>
                  <Form>
                    <FormGroup>
                      <DropdownItem>
                        <Radio
                          name="config"
                          id={CONSOLE_DEFAULT}
                          label={CONSOLE_DEFAULT}
                          value={CONSOLE_DEFAULT}
                          onClick={(e) => {
                            onToggleClick();
                            setCustomValueValidationError('');
                            setChecked(CONSOLE_DEFAULT);
                            onDefaultConfigSubmit(e);
                          }}
                          checked={checked === CONSOLE_DEFAULT}
                        ></Radio>
                      </DropdownItem>
                      <DropdownItem>
                        <Radio
                          name="config"
                          id={CUSTOM}
                          label="Custom configuration"
                          value={CUSTOM}
                          onClick={() => {
                            setChecked(CUSTOM);
                          }}
                          checked={checked === CUSTOM}
                        ></Radio>
                        <TextArea
                          placeholder="Paste custom string"
                          required
                          onClick={() => {
                            setChecked(CUSTOM);
                          }}
                          onChange={(_event, value) => {
                            setCustomValue(value);
                          }}
                        ></TextArea>
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem
                              variant={customValueValidationError ? 'error' : 'default'}
                              {...(customValueValidationError && { icon: <ExclamationCircleIcon /> })}
                            >
                              {customValueValidationError}
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                        <div hidden={checked !== CUSTOM}>
                          <Button variant="plain" type={ButtonType.submit} onClick={onCustomConfigSubmit}>
                            <CheckIcon />
                          </Button>
                          <Button
                            variant="plain"
                            type={ButtonType.reset}
                            onClick={() => {
                              setIsOpen(false);
                              setChecked(isDefaultLayout(layout) ? CONSOLE_DEFAULT : CUSTOM);
                              setCustomValueValidationError('');
                            }}
                          >
                            <TimesIcon />
                          </Button>
                        </div>
                      </DropdownItem>
                    </FormGroup>
                  </Form>
                </DropdownList>
              </DropdownGroup>
            </Dropdown>
          </StackItem>
        </Stack>
      </ToolbarItem>
      <ToolbarItem>
        <Button
          onClick={() => {
            toggleOpen((prev) => !prev);
            setPrevLayout(layout);
          }}
          variant="secondary"
          icon={<PlusIcon />}
        >
          Add widgets
        </Button>
      </ToolbarItem>
    </ToolbarGroup>
  );
};

const Header = () => {
  const { currentUser } = useCurrentUser();
  const userName = currentUser?.first_name && currentUser?.last_name ? ` ${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username;
  return (
    <PageSection variant={PageSectionVariants.light}>
      <Level>
        <LevelItem>
          <Title headingLevel="h1" size="2xl">
            Hi{userName ? `, ${userName}` : '!'}
          </Title>
          <Title headingLevel="h2" size="2xl">
            Welcome to your Hybrid Cloud Console.
          </Title>
        </LevelItem>
        <LevelItem>
          <Toolbar>
            <ToolbarContent>
              <Controls />
            </ToolbarContent>
          </Toolbar>
        </LevelItem>
      </Level>
    </PageSection>
  );
};

export default Header;
