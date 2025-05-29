import { render, screen } from '@testing-library/react';
import Button from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
    it('renders the button with the correct label', () => {
        render(<Button label="Create a post" onClick={() => {}} />);

        const buttonElement = screen.getByText('Create a post');
        expect(buttonElement).toBeInTheDocument();
      });
    
      it('calls the onClick function when clicked', () => {
        const onClickMock = vi.fn();
    
        render(<Button label="Click Me" onClick={onClickMock} />);
    
        const buttonElement = screen.getByText('Click Me');
        buttonElement.click();
     
        expect(onClickMock).toHaveBeenCalled();
      });
});
