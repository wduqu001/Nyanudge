import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';
import React, { useState, useEffect } from 'react';

const meta: Meta<typeof Toggle> = {
  title: 'Shared/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Current toggle state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is interactable',
    },
    label: {
      control: 'text',
      description: 'Optional label displayed beside the toggle',
    },
    categoryColor: {
      control: 'select',
      options: ['water', 'food', 'exercise', 'bathroom', 'medicine'],
      description: 'Color theme applied when the toggle is active',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type ToggleArgs = React.ComponentProps<typeof Toggle>;

// A wrapper to handle the state interactively in storybook if users don't directly manipulate 'checked' arg
const ToggleWithState = (args: ToggleArgs) => {
  const [checked, setChecked] = useState(args.checked || false);
  useEffect(() => {
    setChecked(args.checked || false);
  }, [args.checked]);
  
  return <Toggle {...args} checked={checked} onChange={(val) => {
    setChecked(val);
    args.onChange?.(val);
  }} />;
};

export const Default: Story = {
  render: (args) => <ToggleWithState {...args} />,
  args: {
    checked: false,
  },
};

export const WithLabel: Story = {
  render: (args) => <ToggleWithState {...args} />,
  args: {
    checked: false,
    label: 'Enable Notifications',
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'Disabled Toggle',
  },
};

export const WithCategoryColor: Story = {
  render: (args) => <ToggleWithState {...args} />,
  args: {
    checked: true,
    categoryColor: 'food',
  },
};

export const AllCategories: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {['water', 'food', 'exercise', 'bathroom', 'medicine'].map((color) => (
        <ToggleWithState key={color} {...args} checked={true} categoryColor={color} label={`${color} category`} />
      ))}
    </div>
  ),
};
