import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedCatMochi } from './AnimatedCatMochi';

const meta: Meta<typeof AnimatedCatMochi> = {
  title: 'Shared/AnimatedCatMochi',
  component: AnimatedCatMochi,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  render: () => (
    <div style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}>
      <AnimatedCatMochi />
    </div>
  ),
};

export const InContainer: Story = {
  render: () => (
    <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h3>Mochi is watching you</h3>
      <AnimatedCatMochi />
      <p style={{ color: '#666' }}>Move your mouse around!</p>
    </div>
  ),
};
