import React from 'react';
import { useModal } from '../contexts/ModalContext';
import NewChatModal from './NewChatModal';
import CreateGroupModal from './CreateGroupModal';

const ModalManager = () => {
    const { activeModal, modalProps, closeModal } = useModal();

    const renderModal = () => {
        switch (activeModal) {
            case 'newChat':
                return (
                    <NewChatModal
                        isOpen={true}
                        onClose={closeModal}
                        {...modalProps}
                    />
                );
            case 'createGroup':
                return (
                    <CreateGroupModal
                        isOpen={true}
                        onClose={closeModal}
                        {...modalProps}
                    />
                );
            default:
                return null;
        }
    };

    if (!activeModal) return null;

    return (
        <div className="fixed inset-0 z-50">
            {renderModal()}
        </div>
    );
};

export default ModalManager;