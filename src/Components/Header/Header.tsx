import './Header.scss';

import {
  Button,
  ButtonType,
  ButtonVariant,
  ClipboardCopy,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  PageSectionVariants,
  Radio,
  Stack,
  StackItem,
  Text,
  TextArea,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { CheckIcon, ExclamationCircleIcon, PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useAtom, useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { activeItemAtom, initialLayout, isDefaultLayout, layoutAtom, layoutVariantAtom } from '../../state/layoutAtom';
import useCurrentUser from '../../hooks/useCurrentUser';
import { DashboardTemplate, decodeCustomLayout, encodeCustomLayout, mapTemplateConfigToExtendedTemplateConfig } from '../../api/dashboard-templates';
import { templateAtom, templateIdAtom } from '../../state/templateAtom';

import { resetDashboardTemplate } from '../../api/dashboard-templates';
import { WarningModal } from '@patternfly/react-component-groups';

const Controls = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCustomMenuOpen, setIsCustomMenuOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState('');
  const [customValueValidationError, setCustomValueValidationError] = React.useState('');
  const toggleOpen = useSetAtom(drawerExpandedAtom);
  const [layout, setLayout] = useAtom(layoutAtom);
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const CONSOLE_DEFAULT = 'console-default';
  const CUSTOM = 'custom';
  const [checked, setChecked] = React.useState(isDefaultLayout(layout) ? CONSOLE_DEFAULT : CUSTOM);
  const [template, setTemplate] = useAtom(templateAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const [activeItem, setActiveItem] = useAtom(activeItemAtom);
  const { currentToken } = useCurrentUser();

  const onToggleClick = () => {
    setIsCustomMenuOpen(!isCustomMenuOpen);
  };

  const encodeLayout = async () => {
    console.log(layout);
    console.log(templateId);
    const encodedString = await encodeCustomLayout(templateId, currentToken).then((encodedLayout) => {
      console.log(encodedLayout);
      if (!encodedLayout) {
        throw new Error('Error encoding string');
      }
      return encodedLayout;
    });
    return encodedString;
  };

  const decodeLayout = async (encodedString: string) => {
    const decodedLayout = await decodeCustomLayout(encodedString, currentToken).then((layout) => {
      if (!layout) {
        throw new Error('Error decoding layout string');
      }
      console.log(layout);
      return layout;
    });
    return decodedLayout;
  };

  const onCustomConfigSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!customValue) {
      setCustomValueValidationError('Input value is required.');
      return;
    }
    try {
      const newLayout = await decodeLayout(customValue);
      const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(newLayout.templateConfig);
      setTemplate(extendedTemplateConfig);
      setLayout(extendedTemplateConfig[layoutVariant]);
      setIsCustomMenuOpen(false);
      if (isDefaultLayout(layout)) {
        setChecked(CONSOLE_DEFAULT);
      }
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
    setIsCustomMenuOpen(false);
    setCustomValue('');
  };

  const onCopyEncodedString = async () => {
    const encodedString = await encodeLayout();
    navigator.clipboard.writeText(encodedString);
  };

  return (
    <>
      <WarningModal
        withCheckbox
        isOpen={isOpen}
        title="Reset layout?"
        checkboxLabel="I understand that this action cannot be undone"
        confirmButtonLabel="Reset layout"
        confirmButtonVariant={ButtonVariant.danger}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          setIsOpen(false);
          resetDashboardTemplate('landingPage', currentToken).then(() => {
            setTemplateId(NaN);
          });
        }}
      >
        All your widget customizations will be discarded.
      </WarningModal>
      <ToolbarGroup className="pf-v5-u-flex-direction-column-reverse pf-v5-u-flex-direction-row-reverse-on-md pf-v5-u-flex-direction-row-on-lg">
        <ToolbarItem>
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            variant={ButtonVariant.link}
          >
            Reset to default
          </Button>
        </ToolbarItem>
        <ToolbarItem className="pf-v5-u-pr-sm pf-v5-u-pr-0-on-lg pf-v5-u-pb-xs pf-v5-u-pb-0-on-lg">
          <Button
            onClick={() => {
              toggleOpen((prev) => !prev);
            }}
            variant="secondary"
            icon={<PlusCircleIcon />}
          >
            Add widgets
          </Button>
        </ToolbarItem>
        <ToolbarItem spacer={{ default: 'spacerNone' }}>
          <ClipboardCopy
            isCode
            hoverTip="Copy current configuration string"
            position="left"
            clickTip="Configuration string copied to clipboard"
            onCopy={onCopyEncodedString}
          >
            {JSON.stringify(layout)}
          </ClipboardCopy>
        </ToolbarItem>
        <ToolbarItem spacer={{ default: 'spacerSm' }}>
          <Stack>
            <StackItem>
              <Dropdown
                isOpen={isCustomMenuOpen}
                activeItemId={0}
                onOpenChange={(isOpen: boolean) => {
                  setIsCustomMenuOpen(isOpen);
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
                  <DropdownList className="pf-v5-u-pb-0">
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
                            className="pf-v5-u-mt-sm"
                            rows={1}
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
                                setIsCustomMenuOpen(false);
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
      </ToolbarGroup>
    </>
  );
};

const Header = () => {
  const { currentUser } = useCurrentUser();
  const userName = currentUser?.first_name && currentUser?.last_name ? ` ${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username;
  return (
    <PageSection className="widg-c-page__main-section--header pf-v5-u-p-lg pf-v5-u-p-r-0-on-sm" variant={PageSectionVariants.light}>
      <Flex className="widg-l-flex--header" direction={{ default: 'column', lg: 'row' }}>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <TextContent>
            <Text component="h1">Hi{userName ? `, ${userName}` : '!'}</Text>
            <Text component="h2" className="pf-v5-u-mt-0">
              Welcome to your Hybrid Cloud Console.
            </Text>
          </TextContent>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
          <Toolbar>
            <ToolbarContent>
              <Controls />
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default Header;
