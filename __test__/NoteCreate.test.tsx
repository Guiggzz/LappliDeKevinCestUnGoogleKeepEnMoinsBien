// test/NoteCreate.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { Alert } from 'react-native';
import Create from '../app/notes/create'; // Update with actual path
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

// Mock the dependencies (same as in TaskCreate.test.tsx)
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

describe('Note Create Screen', () => {
    const mockUserToken = 'test-token';
    const mockCategories = [
        { id: 1, name: 'Work', color: '#2196F3' },
        { id: 2, name: 'Personal', color: '#4CAF50' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            userToken: mockUserToken,
        });

        // Mock fetch response for categories
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ data: mockCategories }),
        });
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<Create />);

        expect(getByText('Nouvelle Note')).toBeTruthy();
        expect(getByPlaceholderText('Entrez le titre')).toBeTruthy();
        expect(getByPlaceholderText('Entrez le contenu de votre note')).toBeTruthy();
        expect(getByText('Catégories')).toBeTruthy();
        expect(getByText('Créer la note')).toBeTruthy();
    });

    it('handles title and content input correctly', () => {
        const { getByPlaceholderText } = render(<Create />);
        const titleInput = getByPlaceholderText('Entrez le titre');
        const contentInput = getByPlaceholderText('Entrez le contenu de votre note');

        fireEvent.changeText(titleInput, 'Test Note');
        fireEvent.changeText(contentInput, 'This is a test note content');

        expect(titleInput.props.value).toBe('Test Note');
        expect(contentInput.props.value).toBe('This is a test note content');
    });

    it('fetches categories when dropdown is opened', async () => {
        const { getByText } = render(<Create />);
        const dropdownElement = getByText('Sélectionner des catégories');
        const dropdownButton = dropdownElement.parent;

        if (!dropdownButton) {
            throw new Error('Dropdown button parent not found');
        }

        fireEvent.press(dropdownButton as ReactTestInstance);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://keep.kevindupas.com/api/categories', {
                headers: {
                    'Authorization': 'Bearer test-token',
                    'Content-Type': 'application/json'
                }
            });
        });
    });

    it('allows selecting and deselecting categories', async () => {
        const { getByText } = render(<Create />);
        const dropdownElement = getByText('Sélectionner des catégories');
        const dropdownButton = dropdownElement.parent;

        if (!dropdownButton) {
            throw new Error('Dropdown button parent not found');
        }

        // Open dropdown
        fireEvent.press(dropdownButton as ReactTestInstance);

        await waitFor(async () => {
            // Select a category
            const workCategory = getByText('Work');
            fireEvent.press(workCategory);

            // Should show selected categories
            expect(await getByText('1 catégorie(s) sélectionnée(s)')).toBeTruthy();

            // Categories should be displayed below
            expect(await getByText('Work')).toBeTruthy();

            // Deselect the category
            const categoryChip = getByText('Work');
            fireEvent.press(categoryChip);

            // Should reset text
            expect(await getByText('Sélectionner des catégories')).toBeTruthy();
        });
    });

    it('creates a new category', async () => {
        const { getByText, getByPlaceholderText } = render(<Create />);
        const dropdownButton = getByText('Sélectionner des catégories').parent;

        if (!dropdownButton) {
            throw new Error('Dropdown button parent not found');
        }

        // Open dropdown
        fireEvent.press(dropdownButton as ReactTestInstance);

        await waitFor(async () => {
            // Add new category name
            const newCategoryInput = getByPlaceholderText('Nouvelle catégorie');
            fireEvent.changeText(newCategoryInput, 'New Test Category');

            // Mock successful category creation
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({
                    data: { id: 3, name: 'New Test Category', color: '#9C27B0' }
                }),
            });

            if (!newCategoryInput.parent) {
                throw new Error('Parent element not found for newCategoryInput');
            }
            const addButton = newCategoryInput.parent?.children?.[1];
            if (addButton) {
                fireEvent.press(addButton as ReactTestInstance);
            } else {
                throw new Error("Add button not found");
            }

            // Should show success alert
            expect(Alert.alert).toHaveBeenCalledWith('Succès', 'Catégorie créée avec succès');

            // New category should be in the list and selected
            expect(await getByText('1 catégorie(s) sélectionnée(s)')).toBeTruthy();
        });
    });

    it('shows error when creating note without title or content', async () => {
        const { getByText } = render(<Create />);
        const createButton = getByText('Créer la note');

        fireEvent.press(createButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez remplir tous les champs.');
        });
    });

    it('submits note data correctly', async () => {
        const { getByText, getByPlaceholderText } = render(<Create />);
        const titleInput = getByPlaceholderText('Entrez le titre');
        const contentInput = getByPlaceholderText('Entrez le contenu de votre note');
        const createButton = getByText('Créer la note');

        // Fill form
        fireEvent.changeText(titleInput, 'Test Note');
        fireEvent.changeText(contentInput, 'This is a test note content');

        // Mock successful response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValue({ data: { id: 1 } }),
        });

        // Submit form
        fireEvent.press(createButton);

        // Check fetch call
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://keep.kevindupas.com/api/notes', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-token',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Test Note',
                    content: '<p>This is a test note content</p>',
                    categories: []
                })
            });

            // Check success alert
            expect(Alert.alert).toHaveBeenCalledWith(
                'Succès',
                'Note créée avec succès !',
                [{ text: 'OK', onPress: expect.any(Function) }]
            );
        });
    });

    it('handles API errors when creating note', async () => {
        const { getByText, getByPlaceholderText } = render(<Create />);
        const titleInput = getByPlaceholderText('Entrez le titre');
        const contentInput = getByPlaceholderText('Entrez le contenu de votre note');
        const createButton = getByText('Créer la note');

        // Fill form
        fireEvent.changeText(titleInput, 'Test Note');
        fireEvent.changeText(contentInput, 'This is a test note content');

        // Mock failed response
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        // Submit form
        fireEvent.press(createButton);

        // Check error alert
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de créer la note.');
        });
    });

    it('navigates back when back button is pressed', () => {
        const { getAllByRole, getByTestId, queryByTestId } = render(<Create />);

        // Try different ways to find the back button
        const backButton =
            queryByTestId('back-button') ||
            getAllByRole('button').find(button =>
                button.props.accessibilityLabel === 'Retour' ||
                button.props.testID === 'back-button' ||
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