# Beaver IoT Web

This project is the Beaver IoT Web application, built upon the following core technologies:

- View Library: React
- Request Library: Axios
- Component Library: Ysd-iot
- State Management: Zustand
- Internationalization: react-intl-universal
- General Hooks: Ahooks

## Directory Structure

```
@app/web
├── public
├── src
│   ├── assets                  # Image assets
│   ├── components              # Global components
│   ├── hooks                   # Global hooks
│   ├── layouts                 # Layout components
│   ├── pages                   # Route page resources
│   │     ├── page-a
│   │     │     ├── components  # Page components
│   │     │     ├── index.ts    # Page entry
│   │     │     ├── store.ts    # Page shared state
│   │     │     ├── style.ts
│   │     │     └── ...
│   │     │
│   │     └── page-b
│   │
│   ├── routes                  # Route configuration
│   ├── services                # Common services
│   ├── stores                  # Global state
│   ├── styles                  # Global styles
│   ├── main.ts                 # Application entry
│   └── typings.d.ts            # Type definitions
│
├── index.html                  # Entry HTML
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts              # Build configuration
```

## Development and Maintenance

### Alias Support

- `'@': './src/*'` src path alias