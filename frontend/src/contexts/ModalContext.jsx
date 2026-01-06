import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

export const ModalProvider = ({ children }) => {
    const [activeModal, setActiveModal] = useState(null);
    const [modalProps, setModalProps] = useState({});

    const openModal = (modalType, props = {}) => {
        setActiveModal(modalType);
        setModalProps(props);
    };

    const closeModal = () => {
        setActiveModal(null);
        setModalProps({});
    };

    const value = {
        activeModal,
        modalProps,
        openModal,
        closeModal,
        isModalOpen: (modalType) => activeModal === modalType
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export default ModalContext;