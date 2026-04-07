import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedSleep } from './AnimatedSleep';

const meta: Meta<typeof AnimatedSleep> = {
  title: 'Shared/Animations/AnimatedSleep',
  component: AnimatedSleep,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: '120px', height: '120px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
