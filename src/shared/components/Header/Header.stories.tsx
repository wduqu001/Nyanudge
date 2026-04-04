import type { Meta, StoryObj } from '@storybook/react';
import { NyaHeader } from './NyaHeader';
import { MemoryRouter } from 'react-router-dom';
import { NyaButton } from '../Button/NyaButton';

const meta: Meta<typeof NyaHeader> = {
  title: 'Shared/Header',
  component: NyaHeader,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: '20px', background: 'var(--surface-bg)', minHeight: '200px' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Settings',
    showBack: true,
  },
};

export const WithoutBack: Story = {
  args: {
    title: 'Home',
    showBack: false,
  },
};

export const WithRightContent: Story = {
  args: {
    title: 'Edit Reminder',
    rightContent: <NyaButton variant="ghost" style={{ padding: '4px 8px' }}>Save</NyaButton>,
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Muito Longo Título Que Pode Quebrar',
  },
};
