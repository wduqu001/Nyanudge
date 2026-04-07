import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedCatKuro } from './AnimatedCatKuro';

const meta: Meta<typeof AnimatedCatKuro> = {
  title: 'Shared/Cats/Kuro',
  component: AnimatedCatKuro,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmugKuro: Story = {
  render: () => (
    <div style={{ border: '1px solid #ccc', padding: '30px', borderRadius: '30px', background: '#F4F3F1' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Kuro is judging you</h3>
      <AnimatedCatKuro />
      <p style={{ textAlign: 'center', marginTop: '1rem', color: '#555' }}>Hover to track his eyes</p>
    </div>
  ),
};
