"use client";

import Modal from "./Modal";
import ButtonPrimaryBlack from "./buttons/ButtonPrimaryBlack";
import ButtonSecondaryBlack from "./buttons/ButtonSecondaryBlack";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, isDeleting = false }: ConfirmDeleteModalProps) {
  const footer = (
    <>
      <div className="flex-1">
        <ButtonSecondaryBlack onClick={onClose} disabled={isDeleting}>
          Cancel
        </ButtonSecondaryBlack>
      </div>
      <div className="flex-1">
        <ButtonPrimaryBlack onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </ButtonPrimaryBlack>
      </div>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Photo" footer={footer} closeDisabled={isDeleting}>
      <div className="text-gray-700 dark:text-gray-300">
        <p>Are you sure you want to delete this photo?</p>
        <p className="mt-2 text-sm text-gray-500">This action cannot be undone.</p>
      </div>
    </Modal>
  );
}
