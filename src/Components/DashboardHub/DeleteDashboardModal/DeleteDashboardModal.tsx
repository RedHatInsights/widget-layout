import React, { useState } from 'react';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import { Button, Icon, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { Checkbox } from '@patternfly/react-core';

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
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <Modal
      variant="small"
      className="delete-dashboard-modal"
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby="delete-dashboard-modal-title"
      aria-describedby="delete-dashboard-modal-description"
    >
      <ModalHeader
        title={`Delete '${dashboardName}' dashboard`}
        titleIconVariant={() => (
          <Icon status="danger" size="lg">
            <TrashIcon />
          </Icon>
        )}
        labelId="delete-dashboard-modal-title"
      />
      <ModalBody id="delete-dashboard-modal-body">
        <span id="delete-dashboard-modal-description">
          Deleting the dashboard will remove this dashboard from your Dashboard Hub and any customizations made to it will need to be reconfigured if
        </span>
        <br />
        <br />
        <Checkbox
          label="I understand that this action cannot be undone."
          id="delete-confirm"
          isChecked={isConfirmed}
          onChange={(_event, checked) => setIsConfirmed(checked)}
        />
      </ModalBody>
      <ModalFooter>
        <Button key="delete" variant="danger" onClick={onDelete} isLoading={isDeleting} isDisabled={isDeleting || !isConfirmed}>
          Delete dashboard
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isDeleting}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteDashboardModal;
