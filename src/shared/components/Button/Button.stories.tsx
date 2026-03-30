import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Shared/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'secondary', 'ghost'],
      description: 'The visual style of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button extends to the full width of its container',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled and non-interactive',
    },
    children: {
      control: 'text',
      description: 'Content to be rendered inside the button',
    },
  },
  args: {
    variant: 'primary',
    fullWidth: false,
    disabled: false,
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const FullWidth: Story = {
  parameters: {
    layout: 'padded',
  },
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};
