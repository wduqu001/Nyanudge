import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedExercise } from './AnimatedExercise';

const meta: Meta<typeof AnimatedExercise> = {
  title: 'Shared/Animations/AnimatedExercise',
  component: AnimatedExercise,
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
