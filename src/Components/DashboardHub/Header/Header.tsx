import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import { ImportModal } from '../ImportModal/ImportModal';
import { CreateModal } from '../../CreateModal/CreateModal';
import { DuplicateModal } from '../../DuplicateModal/DuplicateModal';
import { CodeIcon, CopyIcon, ExternalLinkAltIcon, ThIcon } from '@patternfly/react-icons';

const messages = defineMessages({
  createDashboard: {
    id: 'widgetLayout.dashboardHub.createDashboard',
    description: 'Create dashboard dropdown toggle label',
    defaultMessage: 'Create dashboard',
  },
  createFromBlank: {
    id: 'widgetLayout.dashboardHub.createFromBlank',
    description: 'Menu item to create a dashboard from blank',
    defaultMessage: 'Create from blank',
  },
  importFromConfigString: {
    id: 'widgetLayout.dashboardHub.importFromConfigString',
    description: 'Menu item to import a dashboard from a config string',
    defaultMessage: 'Import from config string',
  },
  duplicateExisting: {
    id: 'widgetLayout.dashboardHub.duplicateExisting',
    description: 'Menu item to duplicate an existing dashboard',
    defaultMessage: 'Duplicate existing',
  },
  title: {
    id: 'widgetLayout.dashboardHub.title',
    description: 'Dashboard Hub page title',
    defaultMessage: 'Dashboard Hub',
  },
  description: {
    id: 'widgetLayout.dashboardHub.description',
    description: 'Dashboard Hub page description',
    defaultMessage:
      'Manage, customize, and organize your dashboards to keep the most relevant insights front and center across your Hybrid Cloud Console.',
  },
  learnMore: {
    id: 'widgetLayout.dashboardHub.learnMore',
    description: 'Learn more about dashboards link',
    defaultMessage: 'Learn more about dashboards',
  },
  breadcrumbHome: {
    id: 'widgetLayout.dashboardHub.breadcrumbHome',
    description: 'Home breadcrumb item',
    defaultMessage: 'Home',
  },
});

interface CreateDashboardDropdownProps {
  onRefetchDashboards: () => void;
}

const CreateDashboardDropdown: React.FunctionComponent<CreateDashboardDropdownProps> = ({ onRefetchDashboards }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  return (
    <>
      <Dropdown
        isOpen={isOpen}
        onSelect={() => setIsOpen(false)}
        onOpenChange={setIsOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen} variant="primary">
            <FormattedMessage {...messages.createDashboard} />
          </MenuToggle>
        )}
        ouiaId="CreateDashboardDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          <DropdownItem key="create-blank" onClick={() => setIsCreateModalOpen(true)}>
            <ThIcon /> <FormattedMessage {...messages.createFromBlank} />
          </DropdownItem>
          <DropdownItem key="import" onClick={() => setIsImportModalOpen(true)}>
            <CodeIcon /> <FormattedMessage {...messages.importFromConfigString} />
          </DropdownItem>
          <DropdownItem key="duplicate" onClick={() => setIsDuplicateModalOpen(true)}>
            <CopyIcon /> <FormattedMessage {...messages.duplicateExisting} />
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={onRefetchDashboards} />
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} onSuccess={onRefetchDashboards} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSuccess={onRefetchDashboards} />
    </>
  );
};

interface HeaderProps {
  onRefetchDashboards: () => void;
}

const Header: React.FunctionComponent<HeaderProps> = ({ onRefetchDashboards }) => {
  const intl = useIntl();
  const isLearnMoreLink = useFlag('platform.widget-layout.learn-more-link');
  return (
    <>
      <PageSection className="pf-v6-u-pb-0">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to="/">{intl.formatMessage(messages.breadcrumbHome)}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{intl.formatMessage(messages.title)}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--header pf-v6-u-p-lg pf-v6-u-p-r-0-on-sm">
        <Flex direction={{ default: 'column', lg: 'row' }}>
          <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
            <Content>
              <Content component="h1">
                <FormattedMessage {...messages.title} />
              </Content>
              <Content component="dd" className="pf-v6-u-mt-0">
                <FormattedMessage {...messages.description} />
              </Content>
              {isLearnMoreLink && (
                <Content component="a" className="pf-v6-u-mt-0">
                  <FormattedMessage {...messages.learnMore} /> <ExternalLinkAltIcon />
                </Content>
              )}
            </Content>
          </FlexItem>

          <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
            <CreateDashboardDropdown onRefetchDashboards={onRefetchDashboards} />
          </FlexItem>
        </Flex>
      </PageSection>
    </>
  );
};

export default Header;
