import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from './Toggle';
import { useState } from 'react';

const meta: Meta<typeof Toggle> = {
  title: 'Shared/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return <Toggle {...args} checked={checked} onChange={setChecked} />;
  },
};

export const WithLabel: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return <Toggle {...args} label="Enable Notification" checked={checked} onChange={setChecked} />;
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
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return <Toggle {...args} categoryColor="food" checked={checked} onChange={setChecked} />;
  },
};
