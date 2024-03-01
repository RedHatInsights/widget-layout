import { Button, Card, CardHeader, CardTitle, Gallery, GalleryItem, Icon, Split, SplitItem, Title, Tooltip } from '@patternfly/react-core';
import { useAtom, useSetAtom } from 'jotai';
import React from 'react';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { CloseIcon, GripVerticalIcon } from '@patternfly/react-icons';
import { WidgetTypes } from '../Widgets/widgetTypes';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import widgetMapper from '../Widgets/widgetMapper';
import { widgetDefaultTitles } from '../Widgets/widgetDefaults';

export type AddWidgetDrawerProps = React.PropsWithChildren<{
  dismissible?: boolean;
}>;

const WidgetWrapper = ({ title, widgetType }: React.PropsWithChildren<{ title: string; widgetType: WidgetTypes }>) => {
  const setDropInItem = useSetAtom(currentDropInItemAtom);
  const headerActions = (
    <Tooltip content={<p>Move widget</p>}>
      <Icon>
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
    >
      <CardHeader actions={{ actions: headerActions }}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
    </Card>
  );
};

const AddWidgetDrawer = ({ children }: AddWidgetDrawerProps) => {
  const [isOpen, toggleOpen] = useAtom(drawerExpandedAtom);

  const panelContent = (
    <div
      style={{
        backgroundColor: '#E7F1FA',
      }}
    >
      <Split className="widg-c-split--add-widget pf-v5-u-p-lg">
        <SplitItem isFilled>
          <Title headingLevel="h2" size="md">
            Add new and previously removed widgets by clicking the <GripVerticalIcon /> icon, then drag and drop to a new location. Drag the corners
            of the cards to resize widgets.
          </Title>
        </SplitItem>
        <SplitItem>
          <Button
            variant="plain"
            className="pf-v5-u-pt-0"
            onClick={() => {
              toggleOpen((prev) => !prev);
            }}
            icon={<CloseIcon />}
          />
        </SplitItem>
      </Split>
      <Gallery hasGutter className="pf-v5-u-p-lg pf-v5-u-pt-0">
        <GalleryItem>
          <WidgetWrapper widgetType={WidgetTypes.LargeWidget} title="Large widget">
            <LargeWidget />
          </WidgetWrapper>
        </GalleryItem>
        <GalleryItem>
          <WidgetWrapper widgetType={WidgetTypes.MediumWidget} title="Medium widget">
            <MediumWidget />
          </WidgetWrapper>
        </GalleryItem>
        <GalleryItem>
          <WidgetWrapper widgetType={WidgetTypes.SmallWidget} title="Small widget">
            <SmallWidget />
          </WidgetWrapper>
        </GalleryItem>
      </Gallery>
    </div>
  );
  return (
    <>
      {isOpen ? <div>{panelContent}</div> : null}
      {children}
    </>
  );
};

export default AddWidgetDrawer;
