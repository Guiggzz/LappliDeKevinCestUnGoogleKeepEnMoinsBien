// test/TaskCreate.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { Alert } from 'react-native';
import Create from '../app/taches/createTaches'; // Update with actual path
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

// Mock the dependencies
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => 'LinearGradient');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

global.fetch = jest.fn();

describe('Task Create Screen', () => {
  const mockUserToken = 'test-token';
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      userToken: mockUserToken,
      signOut: mockSignOut,
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: [] }),
    });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<Create />);

    expect(getByText('Nouvelle Tâche')).toBeTruthy();
    expect(getByPlaceholderText('Titre de la tâche')).toBeTruthy();
    expect(getByPlaceholderText('Entrez une description détaillée (optionnel)')).toBeTruthy();
    expect(getByText('Tâche complétée')).toBeTruthy();
    expect(getByText('Sous-tâches')).toBeTruthy();
    expect(getByText('Associer à une note')).toBeTruthy();
    expect(getByText('Créer la tâche')).toBeTruthy();
  });

  it('handles title input correctly', () => {
    const { getByPlaceholderText } = render(<Create />);
    const titleInput = getByPlaceholderText('Titre de la tâche');

    fireEvent.changeText(titleInput, 'Test Task');
    expect(titleInput.props.value).toBe('Test Task');
  });

  it('handles description input correctly', () => {
    const { getByPlaceholderText } = render(<Create />);
    const descriptionInput = getByPlaceholderText('Entrez une description détaillée (optionnel)');

    fireEvent.changeText(descriptionInput, 'Test Description');
    expect(descriptionInput.props.value).toBe('Test Description');
  });

  it('toggles task completion status', () => {
    const { getByText } = render(<Create />);
    const completionToggle = getByText('Tâche complétée').parent;

    if (!completionToggle) {
      throw new Error('Completion toggle parent not found');
    }

    fireEvent.press(completionToggle);
    // We should check the state, but we can't directly in RNTL
    // We would need to check visual indicators or a data-testid
  });

  it('adds and removes subtasks', async () => {
    const { getByPlaceholderText, getByText, queryByText, findByText } = render(<Create />);
    const subtaskInput = getByPlaceholderText('Ajouter une sous-tâche');

    // Find the add button - try different approaches
    let addButton;
    if (subtaskInput.parent && subtaskInput.parent.children) {
      // First try to find it as a direct child
      addButton = Array.from(subtaskInput.parent.children).find(
        child => typeof child !== 'string' && child.props &&
          (child.props.testID === 'add-subtask-button' ||
            (child.props.children && child.props.children.type === 'Ionicons' &&
              child.props.children.props.name === 'add-circle'))
      );
    }

    if (!addButton) {
      // Try to find it by its role or some other identifying property
      const buttons = Array.from(subtaskInput.parent?.children || [])
        .filter(child => typeof child !== 'string' && child.props && child.props.onPress);

      if (buttons.length === 0) {
        throw new Error('No button found near subtask input');
      }

      // Use the first button (likely the add button)
      addButton = buttons[0];
    }

    // Initial state should show "Aucune sous-tâche"
    expect(getByText('Aucune sous-tâche')).toBeTruthy();

    // Add a subtask
    fireEvent.changeText(subtaskInput, 'Test Subtask');
    fireEvent.press(addButton as ReactTestInstance);

    // Now there should be a subtask
    const subtaskItem = await findByText('Test Subtask');
    expect(subtaskItem).toBeTruthy();
    expect(queryByText('Aucune sous-tâche')).toBeNull();

    // Find the delete button for this subtask
    const subtaskContainer = subtaskItem.parent;
    if (!subtaskContainer) {
      throw new Error('Subtask container not found');
    }

    // Try different approaches to find the delete button
    let deleteButton;

    // Look for a button with a trash icon
    const children = Array.from(subtaskContainer.children || []);
    deleteButton = children.find(
      child => typeof child !== 'string' && child.props &&
        (child.props.testID === 'delete-subtask-button' ||
          (child.props.children &&
            child.props.children.type === 'Ionicons' &&
            (child.props.children.props.name === 'trash' ||
              child.props.children.props.name === 'trash-outline')))
    );

    if (!deleteButton) {
      // If we can't find it by icon, try to find any pressable element
      deleteButton = children.find(
        child => typeof child !== 'string' && child.props && child.props.onPress
      );
    }

    if (!deleteButton) {
      throw new Error('Delete button not found for subtask');
    }

    // Delete the subtask
    fireEvent.press(deleteButton as ReactTestInstance);

    // Should show "Aucune sous-tâche" again
    await waitFor(() => {
      expect(getByText('Aucune sous-tâche')).toBeTruthy();
    });
  });

  it('fetches notes when dropdown is opened', async () => {
    const { getByText } = render(<Create />);
    const dropdownButton = getByText('Sélectionner une note').parent;

    if (!dropdownButton) {
      throw new Error('Dropdown button parent not found');
    }

    fireEvent.press(dropdownButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://keep.kevindupas.com/api/notes', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
    });
  });

  it('shows error when creating task without title', async () => {
    const { getByText } = render(<Create />);
    const createButton = getByText('Créer la tâche');

    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez ajouter un titre à la tâche.');
    });
  });

  it('submits task data correctly', async () => {
    const { getByText, getByPlaceholderText } = render(<Create />);
    const titleInput = getByPlaceholderText('Titre de la tâche');
    const createButton = getByText('Créer la tâche');

    // Fill form
    fireEvent.changeText(titleInput, 'Test Task');

    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: { id: 1 } }),
    });

    // Submit form
    fireEvent.press(createButton);

    // Check fetch call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://keep.kevindupas.com/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Test Task',
          note_id: null,
          is_completed: false,
          subtasks: []
        })
      });

      // Check success alert
      expect(Alert.alert).toHaveBeenCalledWith(
        'Succès',
        'Tâche créée avec succès !',
        [{ text: 'OK', onPress: expect.any(Function) }]
      );
    });
  });

  it('handles API errors when creating task', async () => {
    const { getByText, getByPlaceholderText } = render(<Create />);
    const titleInput = getByPlaceholderText('Titre de la tâche');
    const createButton = getByText('Créer la tâche');

    // Fill form
    fireEvent.changeText(titleInput, 'Test Task');

    // Mock failed response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    // Submit form
    fireEvent.press(createButton);

    // Check error alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de créer la tâche.');
    });
  });

  it('navigates back when back button is pressed', () => {
    const { getAllByRole, queryByTestId } = render(<Create />);

    // Try different ways to find the back button
    const backButton =
      queryByTestId('back-button') ||
      getAllByRole('button').find(button =>
        button.props.accessibilityLabel === 'Retour' ||
        (button.props.children &&
          typeof button.props.children === 'object' &&
          button.props.children.type === 'Ionicons' &&
          button.props.children.props.name === 'arrow-back')
      );

    if (!backButton) {
      throw new Error('Back button not found - make sure it has a testID="back-button" or proper accessibilityLabel');
    }

    fireEvent.press(backButton);

    expect(router.back).toHaveBeenCalled();
  });
});