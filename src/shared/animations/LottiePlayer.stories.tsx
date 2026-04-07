import type { Meta, StoryObj } from '@storybook/react';
import { LottiePlayer } from './LottiePlayer';
import { animationRegistry } from './registry';

const meta: Meta<typeof LottiePlayer> = {
  title: 'Shared/Animations/LottiePlayer',
  component: LottiePlayer,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', height: '300px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    animationKey: {
      control: 'select',
      options: Object.keys(animationRegistry),
      description: 'The key of the animation to play from the registry',
    },
    loop: {
      control: 'boolean',
      description: 'Override the default loop setting for the animation',
    },
    autoplay: {
      control: 'boolean',
      description: 'Whether the animation should play immediately',
    },
  },
  args: {
    animationKey: 'cat_idle',
    autoplay: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    animationKey: 'cat_idle',
  },
};

export const Water: Story = {
  args: {
    animationKey: 'cat_water',
    loop: false,
  },
};

export const Meal: Story = {
  args: {
    animationKey: 'cat_meal',
    loop: false,
  },
};

export const Exercise: Story = {
  args: {
    animationKey: 'cat_exercise',
    loop: false,
  },
};

export const Bathroom: Story = {
  args: {
    animationKey: 'cat_bathroom',
    loop: false,
  },
};

export const Medication: Story = {
  args: {
    animationKey: 'cat_medicine',
    loop: false,
  },
};

export const Celebrate: Story = {
  args: {
    animationKey: 'cat_celebrate',
    loop: false,
  },
};

export const Sleep: Story = {
  args: {
    animationKey: 'cat_sleep',
  },
};

export const CustomSize: Story = {
  args: {
    animationKey: 'cat_idle',
    style: { width: '100px', height: '100px', border: '1px solid var(--border-subtle)', borderRadius: '8px' },
  },
};
