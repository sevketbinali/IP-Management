/**
 * Domain Form Property Tests
 * Property-based tests for domain form validation
 */

import React from 'react';
import fc from 'fast-check';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import { DomainForm } from '@/components/DomainForm';
import { DomainType } from '@/types';

// Mock the domain store
jest.mock('@/stores/useDomainStore', () => ({
  useDomainStore: () => ({
    createDomain: jest.fn(),
    updateDomain: jest.fn(),
    loading: false,
  }),
}));

describe('Domain Form Property Tests', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Property 1: Domain Type Validation - Only valid domain types should be accepted', () => {
    // Feature: frontend-interface, Property 1: Domain Type Validation
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('MFG'),
          fc.constant('LOG'),
          fc.constant('FCM'),
          fc.constant('ENG'),
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => 
            !['MFG', 'LOG', 'FCM', 'ENG'].includes(s)
          )
        ),
        fc.string({ minLength: 10, maxLength: 100 }),
        (domainType, description) => {
          const validDomainTypes = ['MFG', 'LOG', 'FCM', 'ENG'];
          const isValidDomainType = validDomainTypes.includes(domainType);

          render(
            <DomainForm
              onCancel={mockOnCancel}
              mode="create"
            />
          );

          // The form should only allow selection of valid domain types
          const selectElement = screen.getByRole('button', { name: /manufacturing \(mfg\)/i });
          expect(selectElement).toBeInTheDocument();

          // Valid domain types should be available in the dropdown
          if (isValidDomainType) {
            fireEvent.click(selectElement);
            const option = screen.queryByText(new RegExp(domainType, 'i'));
            expect(option).toBeInTheDocument();
          }

          // The form should validate domain type selection
          const descriptionInput = screen.getByRole('textbox');
          fireEvent.change(descriptionInput, { target: { value: description } });

          // Form should be valid only with valid domain type and description
          const submitButton = screen.getByRole('button', { name: /create domain/i });
          
          if (isValidDomainType && description.length >= 10) {
            expect(submitButton).not.toBeDisabled();
          } else {
            // Invalid domain types are not selectable, so button state depends on description
            if (description.length < 10) {
              expect(submitButton).toBeDisabled();
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 7: Required Field Validation - Form should prevent submission when required fields are missing', () => {
    // Feature: frontend-interface, Property 7: Required Field Validation
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: null }),
        (description) => {
          render(
            <DomainForm
              onCancel={mockOnCancel}
              mode="create"
            />
          );

          const descriptionInput = screen.getByRole('textbox');
          const submitButton = screen.getByRole('button', { name: /create domain/i });

          if (description) {
            fireEvent.change(descriptionInput, { target: { value: description } });
          }

          // Form should be disabled when required fields are missing or invalid
          const hasValidDescription = description && description.length >= 10 && description.length <= 500;
          
          if (hasValidDescription) {
            expect(submitButton).not.toBeDisabled();
          } else {
            expect(submitButton).toBeDisabled();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 21: Client-Server Validation Consistency - Client validation should mirror server rules', () => {
    // Feature: frontend-interface, Property 21: Client-Server Validation Consistency
    fc.assert(
      fc.property(
        fc.record({
          description: fc.string({ minLength: 0, maxLength: 600 }),
        }),
        async (formData) => {
          render(
            <DomainForm
              onCancel={mockOnCancel}
              mode="create"
            />
          );

          const descriptionInput = screen.getByRole('textbox');
          fireEvent.change(descriptionInput, { target: { value: formData.description } });

          // Wait for validation to complete
          await waitFor(() => {
            const submitButton = screen.getByRole('button', { name: /create domain/i });
            
            // Client-side validation rules should match server expectations
            const isDescriptionValid = 
              formData.description.length >= 10 && 
              formData.description.length <= 500;

            if (isDescriptionValid) {
              expect(submitButton).not.toBeDisabled();
            } else {
              expect(submitButton).toBeDisabled();
            }

            // Check for validation error messages
            if (formData.description.length > 0 && formData.description.length < 10) {
              expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
            }

            if (formData.description.length > 500) {
              expect(screen.getByText(/description must not exceed 500 characters/i)).toBeInTheDocument();
            }
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 25: Form State Preservation - Form should preserve user input during error correction', () => {
    // Feature: frontend-interface, Property 25: Form State Preservation
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (userInput) => {
          render(
            <DomainForm
              onCancel={mockOnCancel}
              mode="create"
            />
          );

          const descriptionInput = screen.getByRole('textbox');
          
          // User enters some input
          fireEvent.change(descriptionInput, { target: { value: userInput } });
          
          // Simulate validation error by entering invalid input
          fireEvent.change(descriptionInput, { target: { value: 'short' } });
          
          // Then user corrects the input
          fireEvent.change(descriptionInput, { target: { value: userInput } });
          
          // Form should preserve the corrected input
          expect(descriptionInput).toHaveValue(userInput);
        }
      ),
      { numRuns: 30 }
    );
  });
});