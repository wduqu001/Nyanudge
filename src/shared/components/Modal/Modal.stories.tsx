import type { Meta, StoryObj } from '@storybook/react';
import { Modal } from './Modal';
import { NyaButton as Button } from '../Button/NyaButton';
import React, { useState, useEffect } from 'react';

const meta: Meta<typeof Modal> = {
  title: 'Shared/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Controls whether the modal is open or hidden',
    },
    title: {
      control: 'text',
      description: 'Optional title displayed in the modal header',
    },
    onClose: {
      action: 'closed',
      description: 'Callback executed when the modal requests to be closed (e.g., clicking overlay or close button)',
    },
    children: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type ModalArgs = React.ComponentProps<typeof Modal> & { onClose?: () => void };

const ModalWithState = (args: ModalArgs) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false);

  useEffect(() => {
    setIsOpen(args.isOpen || false);
  }, [args.isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    args.onClose?.();
  };

  return (
    <div>
      {!isOpen && <Button onClick={() => setIsOpen(true)}>Open Modal</Button>}
      <Modal {...args} isOpen={isOpen} onClose={handleClose}>
        {args.children}
      </Modal>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: false,
    title: 'Reminder Settings',
    children: (
      <>
        <p>This is the content of the modal.</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button variant="ghost">Cancel</Button>
          <Button>Save Settings</Button>
        </div>
      </>
    ),
  },
};

export const NoTitle: Story = {
  render: (args) => <ModalWithState {...args} />,
  args: {
    isOpen: false,
    children: (
      <>
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Are you sure?</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>You cannot undo this action.</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </>
    ),
  },
};
