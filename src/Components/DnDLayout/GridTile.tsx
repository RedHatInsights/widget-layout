import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  HelperText,
  HelperTextItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from '@patternfly/react-core';
import { CompressIcon, EllipsisVIcon, ExpandIcon, GripVerticalIcon, LockIcon, MinusCircleIcon, UnlockIcon } from '@patternfly/react-icons';
import React, { Fragment, useMemo, useState } from 'react';
import clsx from 'clsx';

import './GridTile.scss';
import { Layout } from 'react-grid-layout';
import { WidgetTypes } from '../Widgets/widgetTypes';
import widgetMapper from '../Widgets/widgetMapper';
import { ExtendedLayoutItem } from '../../api/dashboard-templates';

export type SetWidgetAttribute = <T extends string | number | boolean>(id: string, attributeName: keyof ExtendedLayoutItem, value: T) => void;

export type GridTileProps = React.PropsWithChildren<{
  widgetType: WidgetTypes;
  title: string;
  setIsDragging: (isDragging: boolean) => void;
  isDragging: boolean;
  setWidgetAttribute: SetWidgetAttribute;
  widgetConfig: Layout & {
    colWidth: number;
    locked?: boolean;
  };
  removeWidget: (id: string) => void;
}>;

const GridTile = ({ widgetType, title, isDragging, setIsDragging, setWidgetAttribute, widgetConfig, removeWidget }: GridTileProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const Component = widgetMapper[widgetType] || Fragment;

  const dropdownItems = useMemo(() => {
    const isMaximized = widgetConfig.h === widgetConfig.maxH;
    const isMinimized = widgetConfig.h === widgetConfig.minH;
    return (
      <>
        <DropdownItem
          onClick={() => {
            setIsOpen(false);
            setWidgetAttribute(widgetConfig.i, 'static', !widgetConfig.static);
          }}
          icon={widgetConfig.static ? <UnlockIcon /> : <LockIcon />}
        >
          {widgetConfig.static ? 'Unlock location and size' : 'Lock location and size'}
        </DropdownItem>
        <DropdownItem
          isDisabled={isMaximized || widgetConfig.static}
          onClick={() => {
            setWidgetAttribute(widgetConfig.i, 'h', widgetConfig.maxH ?? widgetConfig.h);
            setIsOpen(false);
          }}
          icon={<ExpandIcon />}
        >
          Autosize height to content
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setWidgetAttribute(widgetConfig.i, 'h', widgetConfig.minH ?? widgetConfig.h);
            setIsOpen(false);
          }}
          isDisabled={isMinimized || widgetConfig.static}
          icon={<CompressIcon />}
        >
          Minimize height
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            removeWidget(widgetConfig.i);
          }}
          icon={
            <Icon className="pf-v5-u-pb-2xl" status={widgetConfig.static ? undefined : 'danger'}>
              <MinusCircleIcon />
            </Icon>
          }
          isDisabled={widgetConfig.static}
        >
          Remove
          <HelperText>
            <HelperTextItem variant="indeterminate">{"All 'removed' widgets can be added back"}</HelperTextItem>
            <HelperTextItem variant="indeterminate">{"by clicking the 'Add widgets' button."}</HelperTextItem>
          </HelperText>
        </DropdownItem>
      </>
    );
  }, [widgetConfig.minH, widgetConfig.maxH, widgetConfig.h, widgetConfig.i, widgetConfig.static, setWidgetAttribute]);

  const headerActions = (
    <>
      <Tooltip content={<p>Actions</p>}>
        <Dropdown
          popperProps={{
            appendTo: document.body,
            position: "right",
          }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              isExpanded={isOpen}
              onClick={() => setIsOpen((prev) => !prev)}
              variant="plain"
              aria-label="Card title inline with images and actions example kebab toggle"
            >
              <EllipsisVIcon aria-hidden="true" />
            </MenuToggle>
          )}
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        >
          <DropdownList>{dropdownItems}</DropdownList>
        </Dropdown>
      </Tooltip>
      <Tooltip content={<p>{widgetConfig.static ? 'Widget locked' : 'Move'}</p>}>
        <Icon
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className={clsx('drag-handle', {
            dragging: isDragging,
          })}
        >
          <GripVerticalIcon style={{ fill: '#6a6e73' }} />
        </Icon>
      </Tooltip>
    </>
  );

  const titleWidth = useMemo(
    // 88px is the width of the actions container
    // 48px is the width padding on the card title
    // 16px is the width of the left padding on the actions handle
    () => `calc(${widgetConfig.colWidth * widgetConfig.w}px - 48px${widgetConfig.locked ? '' : ' - 88px - 16px'})`,
    [widgetConfig.colWidth, widgetConfig.w, widgetConfig.locked]
  );
  return (
    <Card
      className={clsx('grid-tile', {
        static: widgetConfig.static,
      })}
    >
      <CardHeader actions={{ actions: headerActions }}>
        <CardTitle
          style={{
            userSelect: isDragging ? 'none' : 'auto',
            width: titleWidth,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>
        <Component></Component>
      </CardBody>
    </Card>
  );
};

export default GridTile;
