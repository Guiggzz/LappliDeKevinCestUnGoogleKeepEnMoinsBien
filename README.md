# Documentation Technique - Application de Notes et Tâches

## Table des matières

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Fonctionnalités principales](#fonctionnalités-principales)
5. [Composants principaux](#composants-principaux)
6. [Navigation et routing](#navigation-et-routing)
7. [Authentification](#authentification)
8. [API et services backend](#api-et-services-backend)
9. [Gestion de l'état](#gestion-de-létat)
10. [Tests](#tests)
11. [UI/UX](#uiux)
12. [Dépendances](#dépendances)
13. [Installation et déploiement](#installation-et-déploiement)

## Vue d'ensemble du projet

Cette application mobile est un clone simplifié de Google Keep, permettant aux utilisateurs de créer et gérer leurs notes et tâches. Développée avec React Native et Expo, l'application offre une interface utilisateur intuitive et moderne, avec un design utilisant des dégradés et des effets de transparence.

L'application fonctionne sur Android et iOS, avec une architecture basée sur Expo pour faciliter le développement et le déploiement.

### Principales fonctionnalités

- Authentification sécurisée
- Création, modification et suppression de notes
- Gestion des tâches avec sous-tâches
- Organisation par catégories avec code couleur
- Recherche et filtrage des notes et tâches
- Interface utilisateur adaptative (thème clair/sombre)

## Architecture technique

### Technologies principales

- **Frontend**: React Native, TypeScript, Expo
- **Navigation**: Expo Router (basé sur les fichiers)
- **Styles**: Tailwind CSS pour React Native (TWRNC)
- **Animations**: React Native Reanimated
- **Stockage sécurisé**: Expo Secure Store
- **Tests**: Jest, React Testing Library

### Schéma d'architecture

L'application suit une architecture basée sur les composants React, avec séparation des préoccupations:

```
Utilisateur ⟷ UI (Composants) ⟷ Contextes (État) ⟷ Services API ⟷ Backend
```

- La couche UI est composée de composants React Native
- La gestion d'état globale est assurée par React Context
- Les requêtes API sont effectuées avec Fetch API
- L'authentification utilise les tokens JWT stockés dans Secure Store

## Structure des dossiers

```
/
├── app/                       # Dossiers pour les écrans (utilisant Expo Router)
│   ├── (auth)/                # Écrans liés à l'authentification
│   │   ├── _layout.tsx        # Layout pour les écrans d'authentification
│   │   └── Login.tsx          # Écran de connexion
│   ├── (tabs)/                # Écrans principaux avec navigation par onglets
│   │   ├── _layout.tsx        # Configuration des onglets
│   │   ├── index.tsx          # Liste des notes (premier onglet)
│   │   └── explore.tsx        # Liste des tâches (deuxième onglet)
│   ├── notes/                 # Gestion des notes
│   │   ├── create.tsx         # Création de notes
│   │   └── [id].tsx           # Consultation/modification de notes
│   ├── taches/                # Gestion des tâches
│   │   ├── createTaches.tsx   # Création de tâches
│   │   └── [id].tsx           # Consultation/modification de tâches
│   ├── +not-found.tsx         # Page d'erreur 404
│   └── _layout.tsx            # Layout principal de l'application
├── assets/                    # Ressources statiques
│   ├── fonts/                 # Polices personnalisées
│   └── images/                # Images et icônes
├── components/                # Composants réutilisables
│   ├── ui/                    # Composants d'interface utilisateur
│   │   ├── IconSymbol.tsx     # Composant d'icône
│   │   └── TabBarBackground.tsx # Arrière-plan de la barre d'onglets
│   ├── ThemedText.tsx         # Texte adapté au thème
│   ├── ThemedView.tsx         # Vue adaptée au thème 
│   ├── Collapsible.tsx        # Composant expansible
│   ├── HapticTab.tsx          # Onglet avec retour haptique
│   ├── ParallaxScrollView.tsx # Défilement avec effet parallaxe
│   └── __tests__/             # Tests des composants
├── constants/                 # Constantes de l'application
│   ├── Colors.ts              # Palettes de couleurs
│   └── config.js              # Configuration de l'API
├── contexts/                  # Contextes pour la gestion de l'état
│   └── AuthContext.tsx        # Contexte d'authentification
├── hooks/                     # Hooks personnalisés
│   ├── useColorScheme.ts      # Hook pour le thème
│   └── useThemeColor.ts       # Hook pour les couleurs du thème
├── __test__/                  # Tests
│   ├── api/                   # Tests d'API
│   ├── context/               # Tests des contextes
│   ├── utils/                 # Utilitaires pour les tests
│   └── *.test.tsx             # Tests des écrans/composants
└── scripts/                   # Scripts utilitaires
```

## Fonctionnalités principales

### Système d'authentification

L'application implémente un système d'authentification complet:

- **Écran de connexion** avec validation des entrées
- **Stockage sécurisé** du token JWT via `expo-secure-store`
- **Vérification automatique** du statut d'authentification
- **Redirection intelligente** basée sur l'état d'authentification
- **Déconnexion** avec confirmation

### Gestion des notes

- **Liste des notes** avec titre, aperçu du contenu et catégories
- **Création de notes** avec titre et contenu formaté
- **Modification des notes** existantes
- **Suppression de notes** avec confirmation
- **Ajout de catégories** aux notes
- **Filtrage** par texte et par catégories
- **Tri** par date de création/modification

### Gestion des tâches

- **Liste des tâches** avec statut de complétion et sous-tâches
- **Création de tâches** avec titre, description et sous-tâches
- **Modification des tâches** existantes
- **Suppression de tâches** avec confirmation
- **Création de sous-tâches** avec statut de complétion
- **Association** à des notes existantes
- **Filtrage** par texte

### Système de catégories

- **Création de catégories** avec génération automatique de couleurs
- **Association** aux notes
- **Filtrage des notes** par catégories
- **Interface visuelle** avec code couleur pour faciliter l'organisation

## Composants principaux

### Composants de base

#### ThemedView et ThemedText

Composants adaptés au thème (clair/sombre) de l'application:

```typescript
// ThemedView.tsx
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

// ThemedText.tsx
export function ThemedText({
  style, lightColor, darkColor, type = 'default', ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        /* autres styles conditionnels */
        style,
      ]}
      {...rest}
    />
  );
}
```

#### Collapsible

Composant pour afficher/masquer du contenu:

```typescript
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}
```

#### ParallaxScrollView

Défilement avec effet de parallaxe:

```typescript
export default function ParallaxScrollView({
  children, headerImage, headerBackgroundColor
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}
```

### Écrans principaux

#### Écran de notes (index.tsx)

- Liste des notes avec aperçu et catégories
- Filtrage par texte et par catégories
- Bouton d'ajout de nouvelle note
- Interaction pour accéder aux détails

#### Écran de tâches (explore.tsx)

- Liste des tâches avec statut de complétion
- Filtrage par texte
- Bouton d'ajout de nouvelle tâche
- Interaction pour accéder aux détails

#### Création/modification de notes (create.tsx et [id].tsx)

- Formulaire avec champs pour titre et contenu
- Sélection de catégories existantes
- Possibilité de créer de nouvelles catégories
- Boutons de sauvegarde et suppression

#### Création/modification de tâches (createTaches.tsx et [id].tsx)

- Formulaire avec champs pour titre et description
- Gestion des sous-tâches (ajout, suppression, complétion)
- Association à une note existante
- Boutons de sauvegarde et suppression

## Navigation et routing

Le projet utilise Expo Router, un système de navigation basé sur les fichiers:

### Structure de navigation

```
app/
├── (auth)/               # Groupe d'authentification
│   ├── _layout.tsx       # Layout spécifique à l'authentification
│   └── Login.tsx         # Page de connexion
├── (tabs)/               # Groupe d'onglets principaux
│   ├── _layout.tsx       # Configuration des onglets
│   ├── index.tsx         # Premier onglet (Notes)
│   └── explore.tsx       # Second onglet (Tâches)
├── notes/
│   ├── create.tsx        # Création de note
│   └── [id].tsx          # Détail de note (route dynamique)
├── taches/
│   ├── createTaches.tsx  # Création de tâche
│   └── [id].tsx          # Détail de tâche (route dynamique)
├── +not-found.tsx        # Page 404
└── _layout.tsx           # Layout principal (root)
```

### Navigation entre écrans

Le projet utilise le hook `router` d'Expo Router pour naviguer entre les écrans:

```typescript
import { router } from "expo-router";

// Navigation vers un écran
router.push("/notes/create");

// Retour à l'écran précédent
router.back();

// Navigation avec remplacement (empêche le retour)
router.replace("/(auth)/Login");
```

### Paramètres de route

Les paramètres de route sont accessibles via le hook `useLocalSearchParams`:

```typescript
import { useLocalSearchParams } from "expo-router";

// Dans un écran dynamique comme notes/[id].tsx
const { id } = useLocalSearchParams();

// Utilisation de l'ID pour charger des données
useEffect(() => {
  loadNote(id);
}, [id]);
```

## Authentification

### Flux d'authentification

1. L'utilisateur entre email/mot de passe sur l'écran de connexion
2. L'application fait une requête POST au point d'API `/api/login`
3. En cas de succès, un token JWT est retourné
4. Le token et les données utilisateur sont stockés dans `expo-secure-store`
5. L'utilisateur est redirigé vers l'application principale
6. Le token est utilisé pour toutes les requêtes API ultérieures

### AuthContext

Le contexte d'authentification fournit l'état d'authentification et les méthodes associées:

```typescript
// Définition du contexte
const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  userToken: null,
  user: null,
});

// Fournisseur du contexte
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  // Fonction de connexion
  const signIn = async (token: string, userData: User) => {
    try {
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      await SecureStore.setItemAsync(SECURE_USER_DATA_KEY, JSON.stringify(userData));
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };
  
  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_USER_DATA_KEY);
      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Chargement initial du token (persistance)
  useEffect(() => {
    const loadToken = async () => {
      // Chargement du token depuis le stockage sécurisé
      // ...
    };
    loadToken();
  }, []);
  
  // Redirection basée sur l'état d'authentification
  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    if (!userToken && !inAuthGroup && !isLoading) {
      router.replace("/(auth)/Login");
    } else if (userToken && inAuthGroup) {
      router.replace("/");
    }
  }, [userToken, isLoading, segments]);
  
  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        isLoading,
        userToken,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);
```

## API et services backend

### Configuration de l'API

L'application centralise sa configuration API dans `constants/config.js`:

```javascript
const BASE_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const API = {
    BASE: BASE_API_URL,
    NOTES: `${BASE_API_URL}/notes`,
    CATEGORIES: `${BASE_API_URL}/categories`,
    TASKS: `${BASE_API_URL}/tasks`,
    LOGIN: `${BASE_API_URL}/login`,
};
```

### Points d'API principaux

| Endpoint | Méthode | Description | Paramètres/Corps |
|----------|---------|-------------|-----------------|
| `/api/login` | POST | Authentification | `{ email, password }` |
| `/api/notes` | GET | Liste des notes | Headers: `Authorization: Bearer <token>` |
| `/api/notes` | POST | Création de note | `{ title, content, categories }` |
| `/api/notes/:id` | GET | Détail d'une note | - |
| `/api/notes/:id` | PUT | Mise à jour d'une note | `{ title, content, categories }` |
| `/api/notes/:id` | DELETE | Suppression d'une note | - |
| `/api/tasks` | GET | Liste des tâches | Headers: `Authorization: Bearer <token>` |
| `/api/tasks` | POST | Création de tâche | `{ description, note_id, is_completed, subtasks }` |
| `/api/tasks/:id` | GET | Détail d'une tâche | - |
| `/api/tasks/:id` | PUT | Mise à jour d'une tâche | `{ description, is_completed, subtasks }` |
| `/api/tasks/:id` | DELETE | Suppression d'une tâche | - |
| `/api/categories` | GET | Liste des catégories | Headers: `Authorization: Bearer <token>` |
| `/api/categories` | POST | Création de catégorie | `{ name, color }` |

### Exemple d'appel API

```typescript
// Exemple de création d'une note
const createNote = async () => {
  if (!userToken) {
    Alert.alert("Erreur", "Token non disponible.");
    return;
  }
  
  setLoading(true);
  try {
    const response = await fetch(API.NOTES, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title,
        content: `<p>${content}</p>`,
        categories: selectedCategories
      })
    });

    if (!response.ok) throw new Error("Erreur lors de la création");

    Alert.alert("Succès", "Note créée avec succès !", [
      { text: "OK", onPress: () => router.back() }
    ]);
  } catch (error) {
    Alert.alert("Erreur", "Impossible de créer la note.");
  } finally {
    setLoading(false);
  }
};
```

## Gestion de l'état

### État global (Context API)

L'application utilise principalement React Context pour la gestion de l'état global:

- **AuthContext**: Gestion de l'authentification et de l'utilisateur
- **ThemeContext**: Implicitement géré via `useColorScheme`

### État local (useState)

Chaque écran gère son propre état local pour:

- Données des formulaires
- État d'affichage (loading, dropdowns, etc.)
- Filtres et recherches

### Exemple de gestion d'état dans un écran

```typescript
// État local pour l'écran de création de note
const [title, setTitle] = useState("");
const [content, setContent] = useState("");
const [loading, setLoading] = useState(false);
const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
const [dropdownVisible, setDropdownVisible] = useState(false);
```

## Tests

Le projet comprend plusieurs types de tests:

### Tests unitaires

Tests de composants et fonctions isolés:

```typescript
// Test d'un composant
it(`renders correctly`, () => {
  const tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Tests d'intégration

Tests simulant des interactions utilisateur et des flux complets:

```typescript
it('handles title input correctly', () => {
  const { getByPlaceholderText } = render(<Create />);
  const titleInput = getByPlaceholderText('Titre de la tâche');

  fireEvent.changeText(titleInput, 'Test Task');
  expect(titleInput.props.value).toBe('Test Task');
});
```

### Tests d'API

Tests vérifiant l'intégration avec le backend:

```typescript
test('login et récupération du token', async () => {
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
  
  expect(response.ok).toBe(true);
  const data = JSON.parse(await response.text());
  expect(data.access_token).toBeDefined();
});
```

### Configuration Jest

Le projet utilise Jest avec la configuration suivante:

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-secure-store|twrnc|@sentry|expo-router)'
  ],
  moduleNameMapper: {
    '^@/contexts/(.*)$': '<rootDir>/contexts/$1',
    '^@/auth/(.*)$': '<rootDir>/app/auth/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/(.*)$': '<rootDir>/$1'
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
```

## UI/UX

### Design et thème

L'application utilise un design moderne avec des dégradés de couleurs et des effets de transparence:

- **Couleurs principales**: Dégradés de bleu foncé, turquoise
- **Surface des cartes**: Fond semi-transparent avec bordure subtile
- **Typographie**: Texte blanc ou bleu clair pour le contraste
- **Support de thème**: Adaptation automatique aux thèmes clair/sombre

### Styles avec TWRNC (Tailwind)

Le projet utilise `twrnc` (Tailwind pour React Native) pour les styles:

```tsx
<View style={tw`bg-white/10 backdrop-blur-md p-5 border border-white/10`}>
  <Text style={tw`text-white text-xl font-bold mb-2`}>{item.title}</Text>
  <Text style={tw`text-blue-100 text-base mb-3`}>{item.content}</Text>
</View>
```

### Composants d'interface utilisateur 

#### Gradients

Utilisation de LinearGradient pour un effet visuel avancé:

```tsx
<LinearGradient
  colors={["#0f2027", "#203a43", "#2c5364"]}
  style={tw`flex-1`}
>
  {/* Contenu */}
</LinearGradient>
```

#### Animations

Animations fluides avec React Native Reanimated:

```tsx
const rotationAnimation = useSharedValue(0);

useEffect(() => {
  rotationAnimation.value = withRepeat(
    withSequence(
      withTiming(25, { duration: 150 }),
      withTiming(0, { duration: 150 })
    ),
    4
  );
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotationAnimation.value}deg` }],
}));

return (
  <Animated.View style={animatedStyle}>
    <ThemedText style={styles.text}>👋</ThemedText>
  </Animated.View>
);
```

## Dépendances

### Dépendances principales

```json
"dependencies": {
  "@expo/vector-icons": "^14.0.2",         // Bibliothèque d'icônes
  "@react-native-async-storage/async-storage": "^2.1.2", // Stockage local
  "expo": "~52.0.37",                       // Framework principal
  "expo-blur": "~14.0.3",                   // Effet de flou
  "expo-crypto": "~14.0.2",                 // Fonctions cryptographiques
  "expo-linear-gradient": "^14.0.2",        // Dégradés de couleurs
  "expo-router": "~4.0.17",                 // Navigation 
  "expo-secure-store": "~14.0.1",           // Stockage sécurisé
  "react": "18.3.1",                        // Bibliothèque React
  "react-native": "0.76.7",                 // Framework mobile
  "react-native-reanimated": "~3.16.1",     // Animations avancées
  "react-native-safe-area-context": "^4.12.0", // Gestion des zones sécurisées
  "twrnc": "^4.6.1"                         // Tailwind pour React Native
}
```

### Dépendances de développement

```json
"devDependencies": {
  "@babel/core": "^7.25.2",
  "@testing-library/jest-native": "^5.4.3",  // Extensions Jest pour React Native
  "@testing-library/react-native": "^13.2.0", // Tests pour React Native
  "@types/jest": "^29.5.14",                 // Types pour Jest
  "jest": "^29.7.0",                         // Framework de test
  "jest-expo": "~52.0.4",                    // Intégration Jest et Expo
  "typescript": "^5.3.3"                     // Support TypeScript
}
```

## Installation et déploiement

### Prérequis

- Node.js (version LTS recommandée)
- npm ou yarn
- Expo CLI
- Application Expo Go sur appareil mobile (pour le développement)

### Installation

1. Cloner le dépôt
   ```bash
   git clone [URL_DU_REPO]
   cd lapplidekevincestungooglekeepenmoinsbien
   ```

2. Installer les dépendances
   ```bash
   npm install
   ```

3. Configurer les variables d'environnement
   Créer un fichier `.env` à la racine avec:
   ```
   EXPO_PUBLIC_API_URL=https://keep.kevindupas.com/api
   ```

### Lancement en développement

```bash
npx expo start
```

Cette commande lance le serveur de développement Expo. Vous pouvez ensuite:
- Scanner le QR code avec l'application Expo Go sur Android
- Utiliser l'application Expo Go sur iOS
- Appuyer sur 'a' pour ouvrir sur un émulateur Android
- Appuyer sur 'i' pour ouvrir sur un simulateur iOS

### Tests

Exécuter les tests unitaires et d'intégration:

```bash
npm test
```

Pour exécuter les tests en mode surveillance:

```bash
npm test -- --watchAll
```

### Construction pour production

#### Build EAS (recommandé)

1. Installer EAS CLI
   ```bash
   npm install -g eas-cli
   ```

2. Connexion à votre compte Expo
   ```bash
   eas login
   ```

3. Configurer EAS
   ```bash
   eas build:configure
   ```

4. Lancer la construction
   ```bash
   eas build --platform android
   eas build --platform ios
   ```

#### Build Expo classique

Pour Android:
```bash
expo build:android
```

Pour iOS:
```bash
expo build:ios
```

**Note**: Ces commandes expo build sont dépréciées en faveur d'EAS Build.