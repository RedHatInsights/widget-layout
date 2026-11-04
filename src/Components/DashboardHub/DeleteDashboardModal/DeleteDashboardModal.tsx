import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { Checkbox } from '@patternfly/react-core';

const messages = defineMessages({
  title: {
    id: 'widgetLayout.deleteModal.title',
    description: 'Delete dashboard modal title',
    defaultMessage: "Delete ''{name}'' dashboard",
  },
  description: {
    id: 'widgetLayout.deleteModal.description',
    description: 'Delete dashboard modal body',
    defaultMessage:
      'Deleting the dashboard will remove this dashboard from your Dashboard Hub and any customizations made to it will need to be reconfigured if you want to remake it.',
  },
  confirm: {
    id: 'widgetLayout.deleteModal.confirm',
    description: 'Delete confirmation checkbox label',
    defaultMessage: 'I understand that this action cannot be undone.',
  },
  delete: {
    id: 'widgetLayout.deleteModal.delete',
    description: 'Delete dashboard button label',
    defaultMessage: 'Delete dashboard',
  },
  cancel: {
    id: 'widgetLayout.deleteModal.cancel',
    description: 'Cancel button label',
    defaultMessage: 'Cancel',
  },
});

interface DeleteDashboardModalProps {
  isOpen: boolean;
  dashboardName: string;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteDashboardModal: React.FunctionComponent<DeleteDashboardModalProps> = ({
  isOpen,
  dashboardName,
  isDeleting,
  onClose,
  onDelete,
}) => {
  const intl = useIntl();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  const handleDelete = () => {
    setIsConfirmed(false);
    onDelete();
  };

  return (
    <Modal
      variant="small"
      className="delete-dashboard-modal"
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="delete-dashboard-modal-title"
      aria-describedby="delete-dashboard-modal-description"
    >
      <ModalHeader
        title={intl.formatMessage(messages.title, { name: dashboardName })}
        titleIconVariant={() => (
          <Icon status="danger" size="lg">
            <TrashIcon />
          </Icon>
        )}
        labelId="delete-dashboard-modal-title"
      />
      <ModalBody id="delete-dashboard-modal-body">
        <span id="delete-dashboard-modal-description">
          <FormattedMessage {...messages.description} />
        </span>
        <br />
        <br />
        <Checkbox
          label={intl.formatMessage(messages.confirm)}
          id="delete-confirm"
          isChecked={isConfirmed}
          onChange={(_event, checked) => setIsConfirmed(checked)}
        />
      </ModalBody>
      <ModalFooter>
        <Button key="delete" variant="danger" onClick={handleDelete} isLoading={isDeleting} isDisabled={isDeleting || !isConfirmed}>
          <FormattedMessage {...messages.delete} />
        </Button>
        <Button key="cancel" variant="link" onClick={handleClose} isDisabled={isDeleting}>
          <FormattedMessage {...messages.cancel} />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteDashboardModal;
