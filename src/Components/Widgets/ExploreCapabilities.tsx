import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionToggle, Button, Flex, FlexItem, Title } from '@patternfly/react-core';

const ExploreCapabilities: React.FunctionComponent = () => {
  const [isExpanded, setIsExpanded] = React.useState('ex-toggle1');
  const onToggle = (id: string) => {
    if (id === isExpanded) {
      setIsExpanded('');
    } else {
      setIsExpanded(id);
    }
  };

  return (
    <Accordion isBordered asDefinitionList={false}>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle1');
          }}
          isExpanded={isExpanded === 'ex-toggle1'}
          id="ex-toggle1"
        >
          Get started with the Hybrid Cloud Console
        </AccordionToggle>
        <AccordionContent id="ex-expand1" isHidden={isExpanded !== 'ex-toggle1'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_Get-started.svg" />
            </FlexItem>
          </Flex>
          <Title headingLevel="h4" className="pf-v5-u-mb-sm">
            Take a tour of the Console
          </Title>{' '}
          <p className="pf-v5-u-mb-sm">
            There&apos;s a lot to explore in the Hybrid Cloud Console, and understanding its capabilities will increase your efficiency.
          </p>
          {/* button is disabled until we have a link for the guided tour */}
          <Button isDisabled variant="danger" href="" target="_blank" className="pf-v5-u-mb-sm">
            Start the guided tour
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle2');
          }}
          isExpanded={isExpanded === 'ex-toggle2'}
          id="ex-toggle2"
        >
          Try OpenShift on AWS
        </AccordionToggle>
        <AccordionContent id="ex-expand2" isHidden={isExpanded !== 'ex-toggle2'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_ROSA.svg" />
            </FlexItem>
          </Flex>
          <Title headingLevel="h4" className="pf-v5-u-mb-sm">
            Get started with Red Hat OpenShift on AWS (ROSA)
          </Title>
          <p className="pf-v5-u-mb-sm">Quickly build, deploy, and scale applications with out fully-managed turnkey application platform.</p>
          <Button variant="danger" href="https://console.redhat.com/openshift/overview/rosa" target="_blank" className="pf-v5-u-mb-sm">
            Try ROSA
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle3');
          }}
          isExpanded={isExpanded === 'ex-toggle3'}
          id="ex-toggle3"
        >
          Develop in the OpenShift Sandbox
        </AccordionToggle>
        <AccordionContent id="ex-expand3" isHidden={isExpanded !== 'ex-toggle3'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_sandbox.svg" />
            </FlexItem>
          </Flex>
          <Title className="pf-v5-u-mb-sm" headingLevel="h4">
            Develop in the sandbox with Red Hat Developer program
          </Title>
          <p className="pf-v5-u-mb-sm">Try Red Hat&apos;s products and technologies without setup or configuration.</p>
          <Button className="pf-v5-u-mb-sm" variant="danger" href="https://console.redhat.com/openshift/sandbox" target="_blank">
            Explore the sandbox
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle4');
          }}
          isExpanded={isExpanded === 'ex-toggle4'}
          id="ex-toggle4"
        >
          Analyze your environments
        </AccordionToggle>
        <AccordionContent id="ex-expand4" isHidden={isExpanded !== 'ex-toggle4'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_Insights-analyze.svg" />
            </FlexItem>
          </Flex>
          <Title className="pf-v5-u-mb-sm" headingLevel="h4">
            Continuously analyze with Red Hat Insights
          </Title>
          <p className="pf-v5-u-mb-sm">Analyze platforms and applications from the console to better manage your hybrid cloud environments.</p>
          <Button className="pf-v5-u-mb-sm" variant="danger" href="https://console.redhat.com/insights/dashboard#SIDs=&tags=" target="_blank">
            Identify and resolve risks
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle5');
          }}
          isExpanded={isExpanded === 'ex-toggle5'}
          id="ex-toggle5"
        >
          Connect to subscriptions
        </AccordionToggle>
        <AccordionContent id="ex-expand5" isHidden={isExpanded !== 'ex-toggle5'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_subs.svg" />
            </FlexItem>
          </Flex>
          <Title className="pf-v5-u-mb-sm" headingLevel="h4">
            Empower your buying decisions with data
          </Title>
          <p className="pf-v5-u-mb-sm">Subscription Services provides reporting to help you make data-driven subscription choices.</p>
          <Button
            className="pf-v5-u-mb-sm"
            variant="danger"
            href="https://console.redhat.com/insights/subscriptions/inventory#SIDs=&tags="
            target="_blank"
          >
            Explore subscriptions
          </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionToggle
          onClick={() => {
            onToggle('ex-toggle6');
          }}
          isExpanded={isExpanded === 'ex-toggle6'}
          id="ex-toggle6"
        >
          Configure your notifications
        </AccordionToggle>
        <AccordionContent id="ex-expand6" isHidden={isExpanded !== 'ex-toggle6'} className="pf-v5-u-color-100">
          <Flex>
            <FlexItem align={{ default: 'alignRight' }}>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_configure.svg" />
            </FlexItem>
          </Flex>
          <Title className="pf-v5-u-mb-sm" headingLevel="h4">
            Customize your notification settings
          </Title>
          <p className="pf-v5-u-mb-sm">Opt-in and out of receiving notifications for your console services.</p>
          <Button className="pf-v5-u-mb-sm" variant="danger" href="https://console.redhat.com/settings/notifications" target="_blank">
            Configure settings
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ExploreCapabilities;
