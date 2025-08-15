## FOLDER STRUCTURE

src/
├── assets/         # Static files like images, fonts, icons
├── components/     # Global reusable UI components (eg: Common header, Button, Modal, Shadcn components)
├── features/       # Feature-based modular folders
│   ├── auth/       # Authentication-related logic and UI
│   │   ├── components/  # Auth-specific components (eg: LoginForm)
│   │   ├── hooks/       # Auth-related hooks (eg: useLogin)
│   │   └── index.ts     # Entry point to export auth module
│   ├── profile/    # User profile feature
│   │   └── components/  # Components for profile UI ( Follow the same structure as authentication )
├── hooks/          # Shared/custom hooks used across features ( Global hooks )
├── lib/            # Libraries and instances (eg: Axios instance, validators)
├── pages/          # Route-level pages for React Router
├── routes/         # Route definitions and layout files
├── store/          # Global state management (eg: Redux, Zustand)
├── utils/          # Utility/helper functions (eg: formatters, constants)

