import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionToggle, Button, Title } from '@patternfly/react-core';

const ExploreCapabilities: React.FunctionComponent = () => {
  const [isExpanded, setIsExpanded] = React.useState('ex-toggle1');
  const onToggle = (id: string) => {
    if (id === isExpanded) {
      setIsExpanded('');
    } else {
      setIsExpanded(id);
    }
  };

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
      body: 'Quickly build, deploy, and scale applications with out fully-managed turnkey application platform.',
      buttonName: 'Try ROSA',
      url: 'https://console.redhat.com/openshift/overview/rosa',
    },
    {
      id: 'ex-toggle3',
      name: 'Develop on the OpenShift Sandbox',
      img: '/apps/frontend-assets/console-landing/widget-explore/Explore_sandbox.svg',
      title: 'Develop in the sandbox with the Red Hat Developer program',
      body: 'Try Red Hat&apos;s products and technologies without setup or configuration.',
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

  return (
    <>
      {drawerData.map((data) => (
        <Accordion key={data.id} isBordered asDefinitionList={false}>
          <AccordionItem>
            <AccordionToggle
              onClick={() => {
                onToggle(data.id);
              }}
              isExpanded={isExpanded === data.id}
              id={data.id}
            >
              {data.name}{' '}
            </AccordionToggle>
            <AccordionContent id={data.id} isHidden={isExpanded !== data.id} className="pf-v5-u-color-100">
              <img className="pf-v5-u-float-right" src={data.img} />
              <Title headingLevel="h4" className="pf-v5-u-mb-sm">
                {data.title}
              </Title>
              <p className="pf-v5-u-mb-sm">{data.body} </p>
              <Button variant="danger" href={data.url} target="_blank" size="lg" className="pf-v5-u-mb-sm">
                {data.buttonName}{' '}
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </>
  );
};

export default ExploreCapabilities;
