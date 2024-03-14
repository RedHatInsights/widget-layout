import React from 'react';
import {
  Button,
  Card,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  SimpleList,
  SimpleListItem,
  Title,
} from '@patternfly/react-core';

export const Explore1: React.FunctionComponent = () => {
  const [activeItem, setActiveItem] = React.useState(0);

  const drawerData = [
    {
      id: 'ex-toggle1',
      name: 'Get started with the Hybrid Cloud Console',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_Get-started.svg',
      title: 'Take a tour of the Console',
      body: "There's a lot to explore in the Hybrid Cloud Console, and understanding its capabilities will increase your efficiency.",
      buttonName: 'Start the guided tour',
      url: '',
    },
    {
      id: 'ex-toggle2',
      name: 'Try OpenShift on AWS',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_ROSA.svg',
      title: 'Get started with Red Hat OpenShift Service on AWS (ROSA)',
      body: 'Quickly build, deploy, and scale applications with our fully-managed turnkey application platform.',
      buttonName: 'Try ROSA',
      url: 'https://console.redhat.com/openshift/overview/rosa',
    },
    {
      id: 'ex-toggle3',
      name: 'Develop on the OpenShift Sandbox',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_sandbox.svg',
      title: 'Develop in the sandbox with the Red Hat Developer program',
      body: "Try Red Hat's products and technologies without setup or configuration.",
      buttonName: 'Explore the sandbox',
      url: 'https://console.redhat.com/openshift/sandbox',
    },
    {
      id: 'ex-toggle4',
      name: 'Analyze your envionments',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_Insights-analyze.svg',
      title: 'Continuously analyze with Red Hat Insights',
      body: 'Analyze platforms and applications from the console to better manage your hybrid cloud environments.',
      buttonName: 'Identify and resolve risks',
      url: 'https://console.redhat.com/insights/dashboard#SIDs=&tags=',
    },
    {
      id: 'ex-toggle5',
      name: 'Connect to subscriptions',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_subs.svg',
      title: 'Empower your buying decisions with data',
      body: 'Subscription Services provides reporting to help you make data-driven subscription choices.',
      buttonName: 'Explore subscriptions',
      url: 'https://console.redhat.com/insights/subscriptions/inventory#SIDs=&tags=',
    },
    {
      id: 'ex-toggle6',
      name: 'Configure your console',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_configure.svg',
      title: 'Customize your notification settings',
      body: 'Opt-in and out of receiving notifications for your console services.',
      buttonName: 'Configure settings',
      url: 'https://console.redhat.com/settings/notifications',
    },
  ];

  const panelContent = (
    <>
      <DrawerPanelContent key={drawerData[activeItem].id} colorVariant="no-background" widths={{ xl: 'width_75' }}>
        <DrawerPanelBody>
          <img className="pf-v5-u-float-right" src={drawerData[activeItem].img} />
          <Title className="pf-v5-u-mb-sm" headingLevel="h2" size="xl">
            {drawerData[activeItem].title}
          </Title>
          <Flex>
            <FlexItem>
              <p className="pf-v5-u-mb-sm">{drawerData[activeItem].body}</p>
            </FlexItem>
            <FlexItem>
              <Button variant="danger" size="lg" component="a" href={drawerData[activeItem].url} target="_blank" className="pf-v5-u-mb-sm">
                {drawerData[activeItem].buttonName}
              </Button>
            </FlexItem>
          </Flex>
        </DrawerPanelBody>
      </DrawerPanelContent>
    </>
  );

  const drawerContent = (
    <SimpleList>
      <SimpleListItem isActive onClick={() => setActiveItem(0)}>
        Get started with the Hybrid Cloud Console
      </SimpleListItem>
      <SimpleListItem onClick={() => setActiveItem(1)}>Try OpenShift with AWS</SimpleListItem>
      <SimpleListItem onClick={() => setActiveItem(2)}>Develop on the OpenShift Sandbox</SimpleListItem>
      <SimpleListItem onClick={() => setActiveItem(3)}>Analyze your environments</SimpleListItem>
      <SimpleListItem onClick={() => setActiveItem(4)}>Connect to your subscriptions</SimpleListItem>
      <SimpleListItem onClick={() => setActiveItem(5)}>Configure your console</SimpleListItem>
    </SimpleList>
  );

  return (
    <React.Fragment>
      <Card>
        <Drawer isStatic>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>{drawerContent}</DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </Card>
    </React.Fragment>
  );
};
