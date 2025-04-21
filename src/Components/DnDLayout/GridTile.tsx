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
  FlexItem,
  HelperText,
  HelperTextItem,
  Icon,
  MenuToggle,
  MenuToggleElement,
  Skeleton,
  Tooltip,
} from '@patternfly/react-core';
import { CompressIcon, EllipsisVIcon, ExpandIcon, GripVerticalIcon, LockIcon, MinusCircleIcon, UnlockIcon } from '@patternfly/react-icons';
import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import './GridTile.scss';
import { Layout } from 'react-grid-layout';
import { ExtendedLayoutItem, WidgetConfiguration } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { getWidget } from '../Widgets/widgetDefaults';
import { useAtomValue } from 'jotai';
import classNames from 'classnames';
import HeaderIcon from '../Icons/HeaderIcon';

export type SetWidgetAttribute = <T extends string | number | boolean>(id: string, attributeName: keyof ExtendedLayoutItem, value: T) => void;

export type GridTileProps = React.PropsWithChildren<{
  widgetType: string;
  icon?: React.ComponentClass;
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

const GridTile = ({ widgetType, isDragging, setIsDragging, setWidgetAttribute, widgetConfig, removeWidget }: GridTileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetMapping = useAtomValue(widgetMappingAtom);
  const { headerLink } = widgetConfig.config || {};
  const hasHeader = headerLink && headerLink.href && headerLink.title;

  const { analytics } = useChrome();

  const widgetData = useMemo(() => {
    return getWidget(widgetMapping, widgetType, () => setIsLoaded(true));
  }, [widgetMapping, widgetType]);

  if (!widgetData) {
    return null;
  }

  const { node, module, scope } = widgetData;

  const dropdownItems = useMemo(() => {
    const isMaximized = widgetConfig.h === widgetConfig.maxH;
    const isMinimized = widgetConfig.h === widgetConfig.minH;
    return (
      <>
        <DropdownItem
          ouiaId={widgetConfig.static ? 'unlock-widget' : 'lock-widget'}
          onClick={() => {
            setIsOpen(false);
            setWidgetAttribute(widgetConfig.i, 'static', !widgetConfig.static);
          }}
          icon={widgetConfig.static ? <UnlockIcon /> : <LockIcon />}
        >
          {widgetConfig.static ? 'Unlock location and size' : 'Lock location and size'}
        </DropdownItem>
        <DropdownItem
          ouiaId="autosize-widget"
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
          ouiaId="minimize-widget"
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
          ouiaId="remove-widget"
          onClick={() => {
            removeWidget(widgetConfig.i);
            analytics.track('widget-layout.widget-remove', { widgetType });
          }}
          icon={
            <Icon className="pf-v6-u-pb-2xl" status={widgetConfig.static ? undefined : 'danger'}>
              <MinusCircleIcon />
            </Icon>
          }
          isDisabled={widgetConfig.static}
        >
          Remove
          <HelperText>
            <HelperTextItem className="pf-v6-u-text-wrap" variant="indeterminate">
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
          ouiaId={`${scope}-${widgetType}-widget`}
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
              aria-label="widget actions menu toggle"
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
      <Tooltip aria-label="Move widget" content={<p>{widgetConfig.static ? 'Widget locked' : 'Move'}</p>}>
        <Icon
          onMouseDown={() => {
            setIsDragging(true);
            analytics.track('widget-layout.widget-move', { widgetType });
          }}
          onMouseUp={() => setIsDragging(false)}
          className={clsx('drag-handle', {
            dragging: isDragging,
          })}
        >
          <GripVerticalIcon style={{ fill: 'var(--pf-t--global--icon--color--subtle)' }} />
        </Icon>
      </Tooltip>
    </>
  );

  return (
    <Card
      ouiaId={`${scope}-${widgetType}-widget`}
      className={clsx('grid-tile', {
        static: widgetConfig.static,
        [scope]: scope && module,
      })}
    >
      <CardHeader className="pf-v6-u-pr-lg" actions={{ actions: headerActions }}>
        <Flex>
          <Flex className="pf-v6-u-flex-direction-row pf-v6-u-flex-nowrap">
            <div className="pf-v6-u-align-self-flex-start widg-c-icon--header pf-v6-u-mr-sm">
              {isLoaded ? <HeaderIcon icon={widgetConfig?.config?.icon} /> : <Skeleton shape="circle" width="25px" height="25px" />}
            </div>
            <Flex className="pf-v6-u-flex-direction-row widg-card-header-text">
              {isLoaded ? (
                <CardTitle
                  style={{
                    userSelect: isDragging ? 'none' : 'auto',
                  }}
                  className="pf-v6-u-align-self-flex-start"
                >
                  {widgetConfig?.config?.title || widgetType}
                </CardTitle>
              ) : (
                <Skeleton width="50%" />
              )}
              {hasHeader && isLoaded && (
                <FlexItem>
                  <Button
                    className="pf-v6-u-font-weight-bold pf-v6-u-font-size-xs pf-v6-u-p-0"
                    variant="link"
                    onClick={() => window.open(headerLink.href, '_blank')}
                  >
                    {headerLink.title}
                  </Button>
                </FlexItem>
              )}
            </Flex>
          </Flex>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody
        className={classNames('pf-v6-u-p-0', {
          [`${scope}-${widgetType}`]: scope && module,
        })}
      >
        {node}
      </CardBody>
    </Card>
  );
};

export default GridTile;
