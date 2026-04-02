import { Content, Dropdown, DropdownItem, DropdownList, Flex, FlexItem, MenuToggle, MenuToggleElement, PageSection } from '@patternfly/react-core';
import React, { useState } from 'react';
import { ImportModal } from '../ImportModal/ImportModal';
import { CreateModal } from '../../CreateModal/CreateModal';
import { CodeIcon, CopyIcon, ExternalLinkAltIcon, ThIcon } from '@patternfly/react-icons';

interface CreateDashboardDropdownProps {
  onRefetchDashboards: () => void;
}

const CreateDashboardDropdown: React.FunctionComponent<CreateDashboardDropdownProps> = ({ onRefetchDashboards }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onSelect={() => setIsOpen(false)}
        onOpenChange={setIsOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen} variant="primary">
            Create dashboard
          </MenuToggle>
        )}
        ouiaId="CreateDashboardDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          <DropdownItem key="create-blank" onClick={() => setIsCreateModalOpen(true)}>
            <ThIcon /> Create from blank
          </DropdownItem>
          <DropdownItem key="import" onClick={() => setIsImportModalOpen(true)}>
            <CodeIcon /> Import from config string
          </DropdownItem>
          <DropdownItem isDisabled key="duplicate">
            <CopyIcon /> Duplicate existing
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={onRefetchDashboards} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={onRefetchDashboards} />
    </>
  );
};

interface HeaderProps {
  onRefetchDashboards: () => void;
}

const Header: React.FunctionComponent<HeaderProps> = ({ onRefetchDashboards }) => {
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
          <CreateDashboardDropdown onRefetchDashboards={onRefetchDashboards} />
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default Header;
