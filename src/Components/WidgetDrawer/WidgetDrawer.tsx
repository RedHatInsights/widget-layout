import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Flex,
  Gallery,
  GalleryItem,
  Icon,
  PageSection,
  Split,
  SplitItem,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { CloseIcon, GripVerticalIcon } from '@patternfly/react-icons';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { getWidget } from '../Widgets/widgetDefaults';
import HeaderIcon from '../Icons/HeaderIcon';
import { WidgetConfiguration } from '../../api/dashboard-templates';

export type AddWidgetDrawerProps = React.PropsWithChildren<{
  dismissible?: boolean;
}>;

const WidgetWrapper = ({ widgetType, config }: React.PropsWithChildren<{ widgetType: string; config?: WidgetConfiguration }>) => {
  const setDropInItem = useSetAtom(currentDropInItemAtom);
  const headerActions = (
    <Tooltip content={<p>Move widget</p>}>
      <Icon className="pf-v5-u-pt-md">
        <GripVerticalIcon style={{ fill: '#6a6e73' }} />
      </Icon>
    </Tooltip>
  );
  return (
    <Card
      onDragStart={(e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const nodeRect = e.target.getBoundingClientRect();
        e.dataTransfer.setDragImage(
          e.target as HTMLDivElement,
          // mess with this to set the drag image and proper mouse position
          e.clientX - nodeRect.left,
          e.clientY - nodeRect.top
        );
        e.dataTransfer.setData('text', widgetType);
        setDropInItem(widgetType);
      }}
      onDragEnd={() => setDropInItem(undefined)}
      // eslint-disable-next-line react/no-unknown-property
      unselectable="on"
      draggable={true}
      className="grid-tile"
    >
      <CardHeader className="pf-v5-u-py-md" actions={{ actions: headerActions }}>
        <Flex className="pf-v5-u-flex-direction-row pf-v5-u-flex-nowrap">
          <Icon status="custom" className="pf-v5-u-mr-sm">
            <HeaderIcon icon={config?.icon} />
          </Icon>
          <CardTitle>{config?.title || widgetType}</CardTitle>
        </Flex>
      </CardHeader>
    </Card>
  );
};

const AddWidgetDrawer = ({ children }: AddWidgetDrawerProps) => {
  const [isOpen, toggleOpen] = useAtom(drawerExpandedAtom);
  const widgetMapping = useAtomValue(widgetMappingAtom);

  const panelContent = (
    <PageSection
      className="pf-v5-u-p-md pf-v5-u-p-lg-on-sm"
      style={{
        backgroundColor: '#E7F1FA',
      }}
    >
      <Split className="widg-l-split--add-widget">
        <SplitItem isFilled>
          <Title headingLevel="h2" size="md">
            Add new and previously removed widgets by clicking the <GripVerticalIcon /> icon, then drag and drop to a new location. Drag the corners
            of the cards to resize widgets.
          </Title>
        </SplitItem>
        <SplitItem>
          <Button
            variant="plain"
            className="pf-v5-u-pt-0 pf-v5-u-pr-0"
            onClick={() => {
              toggleOpen((prev) => !prev);
            }}
            icon={<CloseIcon />}
          />
        </SplitItem>
      </Split>
      <Gallery className="widg-l-gallery pf-v5-u-pt-sm" hasGutter>
        {Object.entries(widgetMapping).map(([type, { config }], i) => {
          return (
            <GalleryItem key={i}>
              <WidgetWrapper widgetType={type} config={config}>
                {getWidget(widgetMapping, type)}
              </WidgetWrapper>
            </GalleryItem>
          );
        })}
      </Gallery>
    </PageSection>
  );
  return (
    <>
      {isOpen ? <div>{panelContent}</div> : null}
      {children}
    </>
  );
};

export default AddWidgetDrawer;
