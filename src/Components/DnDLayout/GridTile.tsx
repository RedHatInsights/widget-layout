import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
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
import { ExtendedLayoutItem, WidgetConfiguration } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { BaconIcon } from '@patternfly/react-icons';
import { getWidget } from '../Widgets/widgetDefaults';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';

export type SetWidgetAttribute = <T extends string | number | boolean>(id: string, attributeName: keyof ExtendedLayoutItem, value: T) => void;

export type GridTileProps = React.PropsWithChildren<{
  widgetType: string;
  title: string;
  setIsDragging: (isDragging: boolean) => void;
  isDragging: boolean;
  setWidgetAttribute: SetWidgetAttribute;
  widgetConfig: Layout & {
    colWidth: number;
    locked?: boolean;
    config?: WidgetConfiguration;
  };
  removeWidget: (id: string) => void;
}>;

const GridTile = ({ widgetType, title, isDragging, setIsDragging, setWidgetAttribute, widgetConfig, removeWidget }: GridTileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetMapping = useAtomValue(widgetMappingAtom);
  const { headerLink } = widgetConfig.config || {};

  const { node, module, scope } = useMemo(() => {
    return getWidget(widgetMapping, widgetType);
  }, [widgetMapping, widgetType]);

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
            <HelperTextItem className="pf-v5-u-text-wrap" variant="indeterminate">
              {"All 'removed' widgets can be added back by clicking the 'Add widgets' button."}
            </HelperTextItem>
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
            maxWidth: '300px',
            position: 'right',
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

  return (
    <Card
      className={clsx('grid-tile', {
        static: widgetConfig.static,
        [scope]: scope && module,
      })}
    >
      <CardHeader actions={{ actions: headerActions }}>
        <Flex className="pf-v5-u-flex-direction-row pf-v5-u-flex-nowrap">
          <Icon status="custom" className="pf-v5-u-mr-sm">
            <BaconIcon />
          </Icon>
          <CardTitle
            style={{
              userSelect: isDragging ? 'none' : 'auto',
            }}
            className="pf-v5-u-flex-wrap pf-v5-u-text-break-word"
          >
            {title}
          </CardTitle>
          {headerLink && (
            <Button className="widget-header-link pf-v5-u-p-0" variant="link" onClick={() => window.open(headerLink.href, '_blank')}>
              {headerLink.title}
            </Button>
          )}
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody
        className={classNames('pf-v5-u-p-0', {
          [`${scope}-${module}`]: scope && module,
        })}
      >
        {node}
      </CardBody>
    </Card>
  );
};

export default GridTile;
