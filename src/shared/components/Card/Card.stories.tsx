import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Toggle } from '../Toggle/Toggle';

const meta: Meta<typeof Card> = {
  title: 'Shared/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ width: '300px' }}>
        <h3>Activity</h3>
        <p>Something to do</p>
      </div>
    ),
  },
};

export const WithCategoryColor: Story = {
  args: {
    categoryColor: 'water',
    children: (
      <div style={{ width: '300px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Drink Water</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Next: 3:30 PM</p>
        </div>
        <Toggle checked={true} onChange={() => {}} categoryColor="water" />
      </div>
    ),
  },
};

export const Clickable: Story = {
  args: {
    categoryColor: 'exercise',
    onClick: () => alert('Card clicked!'),
    children: (
      <div style={{ width: '300px' }}>
        <h3 style={{ margin: 0 }}>Move Your Body</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Next: 6:30 PM</p>
      </div>
    ),
  },
};
