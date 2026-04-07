import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedWater } from './AnimatedWater';

const meta: Meta<typeof AnimatedWater> = {
  title: 'Shared/Animations/AnimatedWater',
  component: AnimatedWater,
  parameters: {
    layout: 'centered',
  },
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
