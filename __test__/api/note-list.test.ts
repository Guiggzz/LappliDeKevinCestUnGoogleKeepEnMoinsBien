// Test d'authentification et de récupération du token
import { saveToken } from '../utils/api-utils';
// Ajouter node-fetch pour les environnements Node.js
import fetch from 'node-fetch';

describe('API Auth', () => {
    test('login et récupération du token', async () => {
        try {
            // Afficher un message de début
            console.log('Tentative de connexion à l\'API...');

            // Appel API réel pour se connecter
            const response = await fetch('https://keep.kevindupas.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: 'test@test.com',
                    password: 'password'
                })
            });

            // Afficher le statut de la réponse
            console.log('Statut de la réponse:', response.status);

            // Vérifier que la requête a réussi
            expect(response.ok).toBe(true);

            // Récupérer le texte brut puis le parser
            const rawText = await response.text();
            console.log('Réponse brute:', rawText);

            // Parser le JSON manuellement
            const data = JSON.parse(rawText);

            // Vérifier que nous avons un token
            expect(data.access_token).toBeDefined();
            expect(typeof data.access_token).toBe('string');

            // Vérifier les informations utilisateur
            expect(data.user).toBeDefined();
            expect(data.user.email).toBe('test@test.com');

            // Stocker le token pour les tests suivants
            saveToken(data.access_token);
            console.log('Token récupéré et sauvegardé:', data.access_token);
        } catch (error) {
            console.error('Erreur lors du test:', error);
            throw error;
        }
    }, 15000); // Timeout plus long pour l'appel API réel
});