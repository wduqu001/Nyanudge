import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedMedicine } from './AnimatedMedicine';

const meta: Meta<typeof AnimatedMedicine> = {
  title: 'Shared/Animations/AnimatedMedicine',
  component: AnimatedMedicine,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: '96px', height: '96px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
