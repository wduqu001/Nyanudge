import type { Meta, StoryObj } from '@storybook/react';
import { BottomNav } from './BottomNav';
import { MemoryRouter } from 'react-router-dom';

const meta: Meta<typeof BottomNav> = {
  title: 'Shared/BottomNav',
  component: BottomNav,
  decorators: [
    (Story, context) => {
      const initialEntries = context.parameters.initialEntries || ['/'];
      return (
        <MemoryRouter initialEntries={initialEntries}>
          <div style={{ width: '400px', height: '100px', position: 'relative', background: 'var(--surface-bg)' }}>
            <Story />
          </div>
        </MemoryRouter>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AtHistory: Story = {
  parameters: {
    initialEntries: ['/history'],
  },
};

export const AtSettings: Story = {
  parameters: {
    initialEntries: ['/settings'],
  },
};
