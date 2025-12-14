# 📚 API Documentation - Koundoul

Documentation complète de l'API REST de Koundoul.

## 🔗 Base URL

```
http://localhost:5000/api
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer <your-jwt-token>
```

## 📋 Endpoints

### 🔑 Authentification

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Se connecter avec email/username et mot de passe.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username",
      "xp": 100,
      "level": 2
    },
    "token": "jwt_token"
  }
}
```

### 👤 Utilisateurs

#### GET /users/profile
Récupérer le profil de l'utilisateur connecté.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "xp": 100,
    "level": 2,
    "badges": []
  }
}
```

### 🧠 Résolution de Problèmes

#### POST /solver/solve
Résoudre un problème avec l'IA.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "problem": "Résoudre l'équation x² - 5x + 6 = 0",
  "subject": "math",
  "difficulty": "easy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "solution": "x = 2 ou x = 3",
    "explanation": "En utilisant la formule quadratique...",
    "steps": [
      "Identifier les coefficients a=1, b=-5, c=6",
      "Calculer le discriminant Δ = b² - 4ac = 1",
      "Appliquer la formule x = (-b ± √Δ) / 2a"
    ],
    "points": 10
  }
}
```

### 📝 Quiz

#### GET /quiz
Récupérer la liste des quiz disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz_id",
      "title": "Quiz Mathématiques",
      "description": "Testez vos connaissances",
      "category": "math",
      "difficulty": "easy",
      "points": 20,
      "timeLimit": 15
    }
  ]
}
```

#### POST /quiz/:id/attempt
Commencer un quiz.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_id",
    "quiz": {
      "id": "quiz_id",
      "title": "Quiz Mathématiques",
      "questions": [
        {
          "question": "Quel est le résultat de 2 + 2 ?",
          "options": ["3", "4", "5", "6"]
        }
      ],
      "timeLimit": 15
    }
  }
}
```

#### POST /quiz/attempt/:id/submit
Soumettre les réponses d'un quiz.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "answers": [1, 0, 2],
  "timeSpent": 300
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "total": 10,
    "percentage": 80,
    "points": 16,
    "correctAnswers": [1, 0, 2],
    "userAnswers": [1, 0, 2]
  }
}
```

### 💳 Paiements

#### POST /payments/create-intent
Créer une intention de paiement Stripe.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 2000,
  "currency": "eur",
  "description": "Premium Subscription"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

## 📊 Codes de Statut

- `200` - Succès
- `201` - Créé avec succès
- `400` - Requête invalide
- `401` - Non autorisé
- `403` - Interdit
- `404` - Non trouvé
- `500` - Erreur serveur

## 🔒 Gestion des Erreurs

Toutes les erreurs suivent ce format :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "value": null
    }
  }
}
```

## 🚀 Exemples d'Utilisation

### JavaScript (Frontend)

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.data.token);

// Résoudre un problème
const solveResponse = await fetch('/api/solver/solve', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    problem: 'Résoudre x² - 5x + 6 = 0',
    subject: 'math',
    difficulty: 'easy'
  })
});
```

### cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Résoudre un problème
curl -X POST http://localhost:5000/api/solver/solve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"problem":"Résoudre x² - 5x + 6 = 0","subject":"math","difficulty":"easy"}'
```


