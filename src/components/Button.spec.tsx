import { render, screen } from '@testing-library/react';
import Button from './Button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Component', () => {
    it('renders the button with the correct label', () => {
        // Render the Button component with a label
        render(<Button label="Create a post" onClick={() => {}} />);
    
        // Check if the button is rendered with the correct label
        const buttonElement = screen.getByText('Create a post');
        expect(buttonElement).toBeInTheDocument();
      });
    
      it('calls the onClick function when clicked', () => {
        // Create a mock function to simulate the onClick event
        const onClickMock = vi.fn();
    
        // Render the Button component with the mock function
        render(<Button label="Click Me" onClick={onClickMock} />);
    
        // Find the button and simulate a click event
        const buttonElement = screen.getByText('Click Me');
        buttonElement.click();
    
        // Check if the mock function was called
        expect(onClickMock).toHaveBeenCalled();
      });
});
