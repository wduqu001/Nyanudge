import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../core/i18n';
import { NyaSelect } from '../Select/NyaSelect';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter><I18nextProvider i18n={i18n}>{children}</I18nextProvider></MemoryRouter>
);

const defaultOptions = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

describe('NyaSelect', () => {
  it('renders the currently selected option label', () => {
    render(<Wrapper><NyaSelect options={defaultOptions} value="b" onChange={vi.fn()} /></Wrapper>);
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('falls back to the first option when value is not found', () => {
    render(<Wrapper><NyaSelect options={defaultOptions} value="z" onChange={vi.fn()} /></Wrapper>);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('opens the dropdown on trigger click', () => {
    render(<Wrapper><NyaSelect options={defaultOptions} value="a" onChange={vi.fn()} /></Wrapper>);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    // The trigger's accessible name = the selected option label
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders all options inside the open dropdown', () => {
    render(<Wrapper><NyaSelect options={defaultOptions} value="a" onChange={vi.fn()} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    expect(screen.getAllByText('Option A')).toHaveLength(2); // trigger + list item
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('shows a checkmark icon on the currently-selected option', () => {
    render(<Wrapper><NyaSelect options={defaultOptions} value="b" onChange={vi.fn()} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: 'Option B' }));
    // The selected option in the dropdown has aria-selected=true
    const selectedOption = screen
      .getAllByRole('option')
      .find(el => el.getAttribute('aria-selected') === 'true');
    expect(selectedOption).toBeInTheDocument();
  });

  it('calls onChange and closes dropdown when an option is selected', () => {
    const onChange = vi.fn();
    render(<Wrapper><NyaSelect options={defaultOptions} value="a" onChange={onChange} /></Wrapper>);
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    fireEvent.click(screen.getByText('Option C'));
    expect(onChange).toHaveBeenCalledWith('c');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes the dropdown on outside click', () => {
    render(
      <Wrapper>
        <div>
          <NyaSelect options={defaultOptions} value="a" onChange={vi.fn()} />
          <div data-testid="outside">outside</div>
        </div>
      </Wrapper>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
