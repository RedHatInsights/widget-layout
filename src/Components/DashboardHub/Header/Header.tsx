import { Content, Dropdown, DropdownItem, DropdownList, Flex, FlexItem, MenuToggle, MenuToggleElement, PageSection } from '@patternfly/react-core';
import React, { useState } from 'react';
import CopyIcon from '@patternfly/react-icons/dist/dynamic/icons/copy-icon';
import CodeIcon from '@patternfly/react-icons/dist/dynamic/icons/code-icon';
import ThIcon from '@patternfly/react-icons/dist/dynamic/icons/th-icon';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/dynamic/icons/external-link-alt-icon';
import { ImportModal } from '../ImportModal/ImportModal';

export const DropdownBasic: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    // eslint-disable-next-line no-console
    console.log('selected', value);
    setIsOpen(false);
  };

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleImportModalClose = () => {
    setIsImportModalOpen(false);
  };

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} variant="primary">
            Create dashboard
          </MenuToggle>
        )}
        ouiaId="BasicDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          <DropdownItem value={0} isDisabled key="disabled action">
            <ThIcon /> Create from blank
          </DropdownItem>
          <DropdownItem value={1} key="import" onClick={handleImportClick}>
            <CodeIcon /> Import from config string
          </DropdownItem>
          <DropdownItem value={2} isDisabled key="disabled action">
            <CopyIcon /> Duplicate existing
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <ImportModal isOpen={isImportModalOpen} onClose={handleImportModalClose} />
    </>
  );
};

const Header = () => {
  return (
    <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--header pf-v6-u-p-lg pf-v6-u-p-r-0-on-sm">
      <Flex className="widg-l-flex--header" direction={{ default: 'column', lg: 'row' }}>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <Content>
            <Content component="h1">Dashboard Hub</Content>
            <Content component="dd" className="pf-v6-u-mt-0">
              Page description
            </Content>
            <Content component="a" className="pf-v6-u-mt-0">
              Learn more about dashboards <ExternalLinkAltIcon />
            </Content>
          </Content>
        </FlexItem>

        <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
          <DropdownBasic />
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default Header;
