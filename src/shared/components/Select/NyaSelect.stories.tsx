import type { Meta, StoryObj } from '@storybook/react';
import { NyaSelect } from './NyaSelect';
import { useState } from 'react';

const meta: Meta<typeof NyaSelect> = {
  title: 'Shared/Select',
  component: NyaSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '300px', width: '300px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
];

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState(options[0].value);
    return <NyaSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    options,
    value: 'option1',
  },
};

export const SoundModes: Story = {
  render: (args) => {
    const [value, setValue] = useState('sound_vibration');
    return <NyaSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    options: [
      { value: 'sound_vibration', label: 'Sound & Vibration' },
      { value: 'sound', label: 'Sound Only' },
      { value: 'vibration', label: 'Vibration Only' },
      { value: 'silent', label: 'Silent' },
    ],
    value: 'sound_vibration',
  },
};
