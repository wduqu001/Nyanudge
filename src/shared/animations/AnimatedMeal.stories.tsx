import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedMeal } from './AnimatedMeal';

const meta: Meta<typeof AnimatedMeal> = {
  title: 'Shared/Animations/AnimatedMeal',
  component: AnimatedMeal,
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
