import type { Meta, StoryObj } from '@storybook/react';
import { CharacterSelect } from './CharacterSelect';
import { useState } from 'react';

const meta: Meta<typeof CharacterSelect> = {
  title: 'Shared/CharacterSelect',
  component: CharacterSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Character>('mochi');
    return <CharacterSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    value: 'mochi',
  },
};

export const SoraSelected: Story = {
  render: (args) => {
    const [value, setValue] = useState<Character>('sora');
    return <CharacterSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    value: 'sora',
  },
};

export const KuroSelected: Story = {
  render: (args) => {
    const [value, setValue] = useState<Character>('kuro');
    return <CharacterSelect {...args} value={value} onChange={setValue} />;
  },
  args: {
    value: 'kuro',
  },
};
