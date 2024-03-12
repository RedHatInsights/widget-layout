import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
  Card,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  Split,
  SplitItem,
  Title,
} from '@patternfly/react-core';

export const Explore1: React.FunctionComponent = () => {
  const [isExpanded, setIsExpanded] = React.useState('ex-toggle1');
  const onToggle = (id: string) => {
    if (id === isExpanded) {
      setIsExpanded('');
    } else {
      setIsExpanded(id);
    }
  };

  const panelContent = (
    <>
      <DrawerPanelContent id="ex-toggle1" colorVariant="no-background" widths={{ xl: 'width_75' }}>
        <DrawerHead>
          <Split hasGutter>
            <SplitItem isFilled>
              <Title headingLevel="h2" size="xl">
                Take a tour of the Console{' '}
              </Title>
            </SplitItem>
            <SplitItem>
              <img src="/apps/frontend-assets/console-landing/widget-explore/Explore_Get-started.svg" />
            </SplitItem>
          </Split>
        </DrawerHead>
        <DrawerPanelBody>
          <Flex>
            <FlexItem>
              <p className="pf-v5-u-mb-sm">
                There&apos;s a lot to explore in the Hybrid Cloud Console, and understanding its capabilities will increase your efficiency.
              </p>
            </FlexItem>
            <FlexItem>
              {/* button is disabled until we have a link for the guided tour */}
              <Button isDisabled variant="danger" href="" target="_blank" className="pf-v5-u-mb-sm">
                Start the guided tour
              </Button>
            </FlexItem>
          </Flex>
        </DrawerPanelBody>
      </DrawerPanelContent>
    </>
  );

  return (
    <React.Fragment>
      <Card>
        <Drawer isStatic>
          <DrawerContent panelContent={panelContent}>
            <DrawerContentBody>
              <Accordion isBordered>
                <AccordionItem>
                  <AccordionToggle
                    onClick={() => {
                      onToggle('ex-toggle1');
                    }}
                    isExpanded={isExpanded === 'ex-toggle1'}
                    id="ex-toggle1"
                  >
                    {' '}
                    Get started with the Hybrid Cloud Console
                  </AccordionToggle>
                  <AccordionContent id="ex-expand1" isHidden={isExpanded !== 'ex-toggle1'} className="pf-v5-u-color-100"></AccordionContent>
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
                  <AccordionContent id="ex-expand2" isHidden={isExpanded !== 'ex-toggle2'} className="pf-v5-u-color-100"></AccordionContent>
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
                  <AccordionContent id="ex-expand3" isHidden={isExpanded !== 'ex-toggle3'} className="pf-v5-u-color-100"></AccordionContent>
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
                  <AccordionContent id="ex-expand4" isHidden={isExpanded !== 'ex-toggle4'} className="pf-v5-u-color-100"></AccordionContent>
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
                  <AccordionContent id="ex-expand5" isHidden={isExpanded !== 'ex-toggle5'} className="pf-v5-u-color-100"></AccordionContent>
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
                  <AccordionContent id="ex-expand6" isHidden={isExpanded !== 'ex-toggle6'} className="pf-v5-u-color-100"></AccordionContent>
                </AccordionItem>
              </Accordion>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      </Card>
    </React.Fragment>
  );
};
