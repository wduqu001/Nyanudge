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
  argTypes: {
    categoryColor: {
      control: 'select',
      options: ['water', 'food', 'exercise', 'bathroom', 'medicine'],
      description: 'The theme color corresponding to a valid category',
    },
    onClick: {
      action: 'clicked',
      description: 'Function to execute on click; adding this makes the card interactive',
    },
    children: {
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ width: '300px' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Simple Card</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>This is a regular card with generic content</p>
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
    onClick: () => console.log('Card clicked!'),
    children: (
      <div style={{ width: '300px' }}>
        <h3 style={{ margin: 0 }}>Move Your Body</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Next: 6:30 PM</p>
      </div>
    ),
  },
};

export const AllCategories: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {['water', 'food', 'exercise', 'bathroom', 'medicine'].map((color) => (
        <Card key={color} categoryColor={color as any}>
          <div style={{ width: '300px' }}>
            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{color} Category</h3>
          </div>
        </Card>
      ))}
    </div>
  ),
};
