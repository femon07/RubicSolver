# RubicSolver

This web application lets you manipulate a 3×3×3 Rubik's cube using Three.js and React. You can try the [demo here](https://femon07.github.io/RubicSolver/).
The background color automatically switches to dark mode based on the browser setting.

The implementation resides in the `rubicsolver-app` directory. Run the following commands to start the development server. The recommended Node.js version is **20 or higher**.

```bash
cd rubicsolver-app
npm ci
npm run dev
```

Use `npm run build` to create a production build. The base path can be specified with the `VITE_BASE_PATH` environment variable. Set it to `/RubicSolver/` when deploying to GitHub Pages.

## Keyboard Shortcuts

```
U: rotate the U face clockwise / Shift+U: rotate the U face counterclockwise
R: rotate the R face clockwise / Shift+R: rotate the R face counterclockwise
F: rotate the F face clockwise / Shift+F: rotate the F face counterclockwise
D: rotate the D face clockwise / Shift+D: rotate the D face counterclockwise
L: rotate the L face clockwise / Shift+L: rotate the L face counterclockwise
B: rotate the B face clockwise / Shift+B: rotate the B face counterclockwise
```

Install dependencies before running lint or build tasks. Execute the following command to run lint.

```bash
npm ci
npm run lint
```

This project is released under the [MIT License](LICENSE).

## GitHub Pages Automatic Deployment

A push to the `main` branch triggers GitHub Actions to build and automatically deploy to GitHub Pages. On first setup, change the repository's "Pages" source to "GitHub Actions". The deployment status can be checked on the "Actions" tab on GitHub, and the page will update a few minutes after completion.
