# 📋 Documentation du Projet : Daily Reset

## 🎯 **Aperçu du Projet**

**Daily Reset** est une application web minimaliste de todo-list quotidienne qui se réinitialise automatiquement chaque 24h. Conçue pour les perfectionnistes qui veulent éviter la complexité des calendriers traditionnels, elle se concentre sur l'essentiel : définir des tâches, les accomplir, et visualiser sa progression quotidienne.

### **Problème résolu**
- Évite la sur-planification rigide (comme Google Calendar avec des heures fixes)
- Lutte contre le perfectionnisme paralysant
- Fournit une vue claire de la productivité quotidienne

### **Fonctionnalités principales**
- ✅ Todo-list avec glisser-déposer
- ✅ Réinitialisation automatique à minuit (heure locale)
- ✅ Barre de progression avec code couleur intelligent
- ✅ Mode sombre/clair avec switch manuel
- ✅ Authentification sécurisée (Supabase)
- ✅ Calendrier des performances mensuelles (comme GitHub contributions)
- ✅ Interface minimaliste et intuitive

---

## 🛠 **Stack Technique**

### **Frontend**
- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React
- **Glisser-déposer** : @dnd-kit
- **Dates** : date-fns
- **Gestion des thèmes** : next-themes

### **Backend & Base de données**
- **Platforme** : Supabase (PostgreSQL + Auth + Storage)
- **Hosting** : Netlify
- **Versionning** : GitHub

### **Versions clés**
```
Node.js : 18.x (spécifié dans .nvmrc)
Next.js : 14.x
Supabase : 2.x
```

---

## 🏗 **Architecture**

### **Structure des dossiers**
```
daily-reset/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/
│   │   └── page.tsx
│   └── dashboard/
│       ├── page.tsx
│       ├── tasks/
│       │   └── page.tsx
│       └── calendar/
│           └── page.tsx
├── components/
│   ├── Auth.tsx
│   ├── TasksPage.tsx
│   ├── CalendarPage.tsx
│   └── SignOutButton.tsx
├── lib/
│   ├── supabase.ts (serveur)
│   └── supabase-client.ts (client)
├── hooks/
│   └── useDailyReset.ts
├── public/
├── middleware.ts
└── ...
```

### **Schéma de base de données (Supabase)**
```sql
-- 1. Table des profils (extension de auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  dark_mode BOOLEAN DEFAULT false,
  reset_time TIME DEFAULT '00:00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tâches quotidiennes (réinitialisées chaque jour)
CREATE TABLE daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  task_order INTEGER NOT NULL,
  created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. Historique pour le calendrier
CREATE TABLE completion_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  color TEXT DEFAULT 'gray',
  UNIQUE(user_id, date)
);
```

### **Système de couleurs**
```typescript
// Logique de progression (0-100%)
function getProgressColor(percentage: number, totalTasks: number): string {
  if (totalTasks === 0) return 'bg-gray-300';       // Gris : Aucune tâche
  if (percentage === 0) return 'bg-red-900';        // Rouge foncé : 0% complété
  if (percentage < 30) return 'bg-red-500';         // Rouge : 0-30%
  if (percentage < 70) return 'bg-yellow-500';      // Jaune : 30-70%
  return 'bg-green-500';                            // Vert : 70-100%
}
```

---

## 🚀 **Guide de développement**

### **Prérequis**
- Node.js 18.x
- Compte Supabase
- Compte GitHub
- Compte Netlify

### **Installation locale**
```bash
# 1. Cloner le dépôt
git clone https://github.com/<username>/daily-reset.git
cd daily-reset

# 2. Installer les dépendances
npm ci

# 3. Configurer les variables d'environnement
# Créer .env.local avec :
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# 4. Lancer le serveur de développement
npm run dev
```

### **Commandes utiles**
```bash
# Développement
npm run dev          # Lance le serveur local
npm run build        # Build pour production
npm run start        # Lance la version buildée

# Maintenance
npm run lint         # Vérification du code
npm ci               # Installation exacte des dépendances
```

---

## 🌐 **Déploiement (Netlify)**

### **Configuration requise**
1. **Fichier de configuration Netlify** : `netlify.toml` (à créer)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

2. **Fichier de version Node** : `.nvmrc`
```
18
```

3. **Variables d'environnement Netlify** :
```
NEXT_PUBLIC_SUPABASE_URL    (ton URL Supabase)
NEXT_PUBLIC_SUPABASE_ANON_KEY (ta clé publique)
```

### **Étapes de déploiement**
1. Connecter le dépôt GitHub à Netlify
2. Configurer les variables d'environnement dans Netlify UI
3. Définir la commande de build : `npm run build`
4. Définir le dossier de publication : `.next`
5. Activer le déploiement automatique

### **Problèmes courants de déploiement**
- **Erreur de build** : Vérifier la version Node.js (doit être 18)
- **Variables manquantes** : S'assurer que toutes les variables Supabase sont définies
- **Problème de middleware** : Next.js 14 a changé la convention (utiliser `middleware.ts`)

---

## ⚙️ **Fonctionnalités clés**

### **1. Réinitialisation quotidienne**
- **Heure** : Minuit (heure locale du navigateur)
- **Logique** : Le hook `useDailyReset` vérifie chaque heure si un nouveau jour est détecté
- **Actions** :
  1. Sauvegarde l'historique de la veille dans `completion_history`
  2. Supprime les tâches de la veille
  3. Réinitialise la progression

### **2. Système de progression**
- **Calcul** : `(tâches_complétées / tâches_totales) * 100`
- **Visualisation** : Barre horizontale avec pourcentage
- **Couleurs** : 5 états (gris, rouge foncé, rouge, jaune, vert)

### **3. Glisser-déposer**
- **Bibliothèque** : @dnd-kit
- **Persistance** : L'ordre est sauvegardé dans `task_order`
- **UX** : Feedback visuel pendant le drag

### **4. Authentification**
- **Provider** : Supabase Auth
- **Flux** : Inscription → Création de profil → Connexion → Session
- **Sécurité** : Row Level Security (RLS) activé sur toutes les tables

### **5. Calendrier des performances**
- **Inspiration** : GitHub contributions graph
- **Données** : Récupérées depuis `completion_history`
- **Navigation** : Par mois avec flèches

---

## 🐛 **Points d'attention & Améliorations**

### **Problèmes connus**
1. **Middleware** : Next.js 14 a déprécié le fichier `middleware` conventionnel. Nous utilisons la nouvelle approche mais rester attentif aux updates.
2. **Timezones** : La réinitialisation utilise l'heure locale du navigateur. Si l'utilisateur change de fuseau horaire, cela peut causer des réinitialisations inattendues.
3. **Performance** : Le calendrier charge un mois entier d'historique. Pour les utilisateurs très actifs, envisager la pagination.

### **Améliorations futures**
1. **Notifications** : Notifications à 21h pour les tâches non complétées
2. **Paramètres utilisateur** : Page pour modifier username, heure de réinitialisation personnalisée
3. **Export de données** : Export CSV/JSON de l'historique
4. **Statistiques avancées** : Graphiques de tendances, moyennes, objectifs
5. **Mode hors-ligne** : Service Worker pour utiliser l'app sans connexion
6. **Application mobile** : Version PWA ou React Native

### **Sécurité**
- ✅ RLS activé sur Supabase
- ✅ Validation des entrées utilisateur
- ✅ Tokens d'authentification sécurisés
- ❌ À faire : Rate limiting sur l'API
- ❌ À faire : Audit de sécurité complet

---

## 📚 **Références & Documentation**

### **Outils principaux**
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Netlify Deployment Guide](https://docs.netlify.com/)

### **Bibliothèques**
- [@dnd-kit](https://docs.dndkit.com/) - Glisser-déposer
- [date-fns](https://date-fns.org/) - Manipulation des dates
- [Lucide Icons](https://lucide.dev/) - Icônes
- [next-themes](https://github.com/pacocoursey/next-themes) - Gestion des thèmes

### **Configurations critiques**
- **`tailwind.config.ts`** : Configuration Tailwind avec couleurs personnalisées
- **`middleware.ts`** : Protection des routes et gestion d'authentification
- **`.nvmrc`** : Version Node.js pour Netlify
- **`next.config.js`** : Configuration Next.js (actuellement par défaut)

---

## 🤝 **Transfert du projet**

### **Pour le développeur reprenant le projet**
1. **Comprendre la philosophie** : Minimalisme, simplicité, focus sur l'essentiel
2. **Respecter le design** : S'inspirer d'Apple Notes, pas de couleurs superflues
3. **Prioriser la stabilité** : Mieux vaut une fonctionnalité simple qui marche qu'une complexe buggée
4. **Tester rigoureusement** : La réinitialisation quotidienne est critique

### **Checklist de reprise**
- [ ] Accès aux comptes (GitHub, Supabase, Netlify)
- [ ] Build local fonctionnel
- [ ] Déploiement Netlify opérationnel
- [ ] Compréhension du schéma de données
- [ ] Connaissance des problèmes connus

---

## 📞 **Support & Contact**

### **En cas de problème**
1. **Vérifier les logs Netlify** : Site settings → Deploys → Logs
2. **Vérifier Supabase** : Logs d'authentification et de requêtes
3. **Reproduire en local** : `npm run build` pour identifier l'erreur

### **Ressources**
- **Code source** : https://github.com/[username]/daily-reset
- **Production** : https://[ton-site].netlify.app
- **Supabase Project** : https://supabase.com/dashboard/project/[project-id]

---

**Bonne continuation avec le projet !** 🚀  
*L'application a un grand potentiel pour aider les perfectionnistes à être plus productifs sans la pression des calendriers rigides. Garde la simplicité au cœur du développement.*