# Web Engineering Coding Playground Template

This repository is designed as the foundation for coding playgrounds in the Web Engineering course. It offers a structured space for experimenting with and mastering various web development technologies and practices. 
The project is based on [this](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Accessibility_troubleshooting) repository from MDN.

The project introduces a lot of code smells for you to tackle. 
**Let's get coding!**

## Submission Details and Deadlines
* Coding playgrounds are **individual** work
* Use this base template to create your project repository.
* Submit your repository link once.
* Each playground must be submitted via a new branch in that repository (last commit within deadline will be graded).
  * Naming conventions of branch: <code>playground-1</code>, <code>playground-2</code>, ...
* Each playground consists of 5 tasks, 1 point each. A task is complete only when both its implementation work and its theory question have been answered.

### Submission Deadlines
* [1st Playground](#1-js-playground): 14.09.2026
* [2nd Playground](#2-dependency--and-build-management-playground): 28.09.2026
* [3rd Playground](#3-migrate-to-a-frontend-framework): 04.10.2026
* other Playgrounds TBA by Thomas Berger

## Features

- Wonderful UI-design :heart_eyes:
- Loads bear data using [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) :bear:
  - Original Wikipedia Page can be found [here](https://en.wikipedia.org/wiki/List_of_ursids)
- Worst JS coding practices :cold_sweat:
- No Build and Dependency Management at all :fire:


# Coding Playground Description

## 1. JS Playground
The provided base project template contains bad coding and templating practices and bugs for you to fix. Take a look into the component files and get a grasp of the inner workings of the provided project. The app should provide the requirements described below. Some are implemented poorly or do not work at all. 

### App Requirements
* On page load the app requests the Wikipedia API to extract bear information from Wikipedia's [list of ursids](https://en.wikipedia.org/wiki/List_of_ursids). The page then renders the provided image, the common name, the scientific name and it's range.
  * the bears should be ordered in the same order and number (no duplicates) as in the corresponding Wiki page.
  * if there is no image available, the app should show a placeholder image.
* Users are able to toggle the comment section.
* Users are able to leave their name and a comment (both should not be empty).
* Users are able to search the web page contents using a search query, whereby only the html contents with tag <code>article</code> should be highlighted.

### Tasks
Fix the application code and support them with short code examples where useful.

#### Task 1: Introduce ES modules

Split the code into separate script files and use ES modules (`import`/`export`). Choose module boundaries that separate concerns and avoid circular dependencies.

**Theory question:** How does an ES module differ from a classic script with respect to scope, strict mode, loading, and bindings? Explain why the module boundaries you chose make the application easier to maintain.

**Answer:** ES modules have their own scope, run in strict mode automatically, are loaded with `type="module"` and support `import`/`export`. Their imports are live bindings, so they stay linked to the exported values.

The chosen module boundaries separate features like search, comments, bear rendering, and API access. This makes the code easier to understand, change, test, and maintain without affecting unrelated parts.

#### Task 2: Correct the application behavior

Fix the semantic and functional issues according to the app requirements. Use appropriate DOM queries and event handling, and ensure the bear list has the same order and number of entries as the source page.

**Theory question:** Describe event propagation (capturing, target, and bubbling). Where could event delegation be useful in this application, and what trade-off would it introduce?

**Answer:** Event propagation describes how an event moves through the DOM. In the **capturing phase**, it travels from the document down to the target element. In the **target phase**, it reaches the element that triggered the event. In the **bubbling phase**, it travels back up through the parent elements.

Event delegation could be used in the navigation by adding one click listener to `<nav>` instead of one for each link. The trade-off is that `event.target` must be checked.

#### Task 3: Make failures explicit

Add error handling with `try`/`catch` and show useful, user-facing error messages. Check whether each image can be loaded and render a placeholder when it cannot. Do not represent a failed request as valid empty data.

**Theory question:** How do synchronous exceptions and rejected promises travel through this application? Explain where errors should be caught and why catching every error at its source can make failures harder to diagnose.

**Answer:** Synchronous exceptions travel up the call stack, while rejected promises travel through the promise chain until a `.catch()` handles them. Errors should be caught where they can be handled meaningfully, for example in `initBears()` for general failures and locally for image fallbacks. Catching every error immediately can hide the original cause and make debugging harder.

#### Task 4: Refactor asynchronous control flow

Replace promise callback chains with `async`/`await` and refactor suitable callbacks to arrow functions. Run independent asynchronous operations concurrently where doing so is safe.

**Theory question:** Explain the relationship between `async`/`await`, promises, the microtask queue, and the browser event loop. Also explain why an arrow function is not always an interchangeable replacement for a regular function, particularly regarding `this`.

**Answer:** async/await is built on top of Promises and makes asynchronous code easier to read. When an awaited Promise finishes, the continuation is placed in the microtask queue and handled by the browser’s event loop.

Arrow functions are not always interchangeable with regular functions because they do not have their own this, they inherit this from the surrounding scope.

#### Task 5: Remove remaining code smells

Find and eliminate the remaining bad coding practices. Consider scope, accidental globals, mutation and shared references, function responsibilities, naming, duplication, and DOM update patterns. Document each relevant finding, why it is problematic, and how you fixed it below.

**Theory question:** Select one of your refactorings and explain how JavaScript scope, closures, references, or prototypes caused the original risk. State how you verified that your refactoring preserved behavior.

**Answer:** I changed image loading so it no longer mutates the original bear objects. Since JavaScript objects are references, bear.image = ... changed shared data. Returning a new object with {...bear, image} avoids this.

I verified the refactoring by testing that the same bears, images, placeholders, order, and number of entries were still displayed after the change.

### What bad coding practices did you find? Why is it a bad practice and how did you fix it?

#### Mutation of shared objects

Bad:

```js
bear.image = await fetchImageUrl(bear.fileName);
```

JavaScript objects are reference values, so this mutates the original object.

Fixed:

```js
return {...bear, image};
```

This creates a new object instead of changing shared data.

#### Duplicated fetch logic

Bad:

```js
const response = await fetch(url);

if (!response.ok) {
    throw new Error(...);
}

return response.json();
```

The same logic existed in multiple functions.

Fixed:

```js
async function fetchJson(params, errorMessage) {
    ...
}
```

The common logic is now reusable and easier to maintain.

#### Too many DOM updates

Bad:

```js
bears.forEach((bear) => {
    moreBears.appendChild(bearDiv);
});
```

This updates the DOM repeatedly.

Fixed:

```js
const fragment = document.createDocumentFragment();

bears.forEach((bear) => {
    fragment.appendChild(createBearElement(bear));
});

bearList.replaceChildren(fragment);
```

The DOM is updated only once.

#### Using `innerHTML` for text

Bad:

```js
span.innerHTML = ...
```

Dynamic text can accidentally be interpreted as HTML.

Fixed:

```js
mark.textContent = part;
```

DOM elements and `textContent` are safer and clearer.

#### Mixed responsibilities

`renderBears()` originally created elements and updated the page at the same time.

Fixed by separating:

```js
createBearElement(bear);
renderBears(bears);
```

Each function now has one clear responsibility.



## 2. Dependency- and Build Management Playground
Build the application with ``npm`` and a build and a dependency management tool of your choice (e.g. [Vite](https://vitejs.dev/), [Webpack](https://webpack.js.org/), or others). 

### Tasks

#### Task 1: Establish the build

Set up the project with `npm` and a build tool of your choice (for example, Vite or Webpack). Keep source files separate from generated distribution files and commit the package-manager lockfile.

1. The project was initialized with `npm init -y`. The `-y` flag accepted all default options.
2. Vite was installed as a development dependency with `npm install --save-dev vite`.
3. A `src` folder was created for the source files and a `public` folder for static assets. The JavaScript and CSS files were moved into `src`, while the media files were moved into `public`.
4. The references in `index.html` were updated to point to the new file locations.
5. `dev` and `build` commands were added to the `scripts` section of `package.json`. The `dev` command starts the Vite development server, while the `build` command creates the production build.
6. A `.gitignore` file was added to exclude the `node_modules` and `dist` directories.
7. `package.json` and `package-lock.json` were committed. The lockfile stores the exact dependency versions and makes the installation reproducible.

**Theory question:** Distinguish source, build, distribution, and deployment. What does your build tool do in development and in a production build, and why is the lockfile important for reproducibility?

**Answer:**
- **Source:** The code developers write and edit.
- **Build:** The process that transforms and prepares the source code.
- **Distribution:** The generated output of the build, for example `dist/`.
- **Deployment:** The process of delivering the distribution to a target environment.

In development, Vite runs a dev server and loads code with native ES modules.

In a production build, Vite creates an optimized distribution for deployment.

The lockfile stores the exact dependency versions. This makes installations reproducible on different systems.

#### Task 2: Migrate to TypeScript

Use TypeScript as the primary development language and adapt the source files and configuration accordingly. Enable strict checking, model the application's domain data, and validate data received from external APIs before treating it as a typed value.

**Theory question:** TypeScript uses structural typing and erases types during compilation. Explain both concepts and why a compile-time type alone cannot guarantee the shape of a Wikipedia API response at runtime.

**Answer:**
- **Structural typing:** TypeScript checks whether an object has the required structure, not whether it was created from a specific type or class.
- **Type erasure:** TypeScript types and interfaces are removed during compilation. The browser only receives JavaScript.
- Because TypeScript checks types only at compile time, it cannot guarantee that data received from an external API has the expected structure at runtime.
- Therefore, a Wikipedia API response should first be treated as `unknown` and validated before it is used as a typed value.

#### Task 3: Add static analysis and formatting

Configure ESLint and Prettier using the rulesets below. Resolve all reported errors in the application code and avoid disabling rules without a written justification.

eslint-config-standard-with-typescript was replaced by its recommended successor eslint-config-love because the original package is deprecated. TypeScript-specific ESLint rules are still provided through the TypeScript ESLint tooling.

With `npm run lint:fix` and `npm run format` you should be able to automatically fix most of the issues.

**Theory question:** What different problems do a linter, a formatter, and the TypeScript compiler detect? Give one concrete example for each from this project.

**Answer:** ESLint checks code quality and rules, Prettier checks formatting, and TypeScript checks types.

#### Task 4: Provide a consistent command interface

Define the following tasks within `npm scripts`:

  * `dev`: starts the development server.
  * `build`: runs the typescript compiler and bundles your application - bundling depends on your chosen build tool (e.g. Vite, Webpack) but typically bundles multiple files into one, applies optimizations like minification and obfuscation and outputs final results to a `dist` or `build` directory.
  * `lint`: runs ESLint on all  `.js` and `.ts` files in your projects `/src` directory.
  * `lint:fix`: runs and also fixes all issues found by ESLint.
  * `format`: formats all `.js` and `.ts` files in your projects `/src` directory.
  * `format:check`: checks if the files in the `/src` directory are formatted according to Prettier's rules.

The `build`, `lint`, and `format:check` commands must exit with a non-zero status when their checks fail.

> **Note:** No changes to `package.json` were necessary for this task because the required npm scripts had already been added and committed in previous tasks.

**Theory question:** Why are stable, composable commands such as these useful as an interface for developers and CI? Explain idempotence and identify which of your scripts should be idempotent.

**Answer:** Stable npm scripts give developers and CI the same predictable commands for building, checking, and formatting the project.

Idempotence means that running the same command multiple times with the same input gives the same result. build, typecheck, lint, and format:check should be idempotent. format and lint:fix should also make no further changes after the first successful run.

#### Task 5: Enforce quality before integration

Configure a pre-commit hook that checks staged code using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged). Configure a continuous-integration workflow that installs dependencies from the lockfile and runs the non-mutating build, type, lint, and formatting checks for every push or pull request.

1. Husky and lint-staged were installed as development dependencies with `npm install --save-dev husky lint-staged`.
2. Husky was initialized with `npx husky install`.
3. A pre commit hook was added with husky `npx lint-staged` to run prettier and eslint on staged files.
4. A GitHub Actions workflow was created in `.github/workflows/ci.yml` to run the build, type, lint, and format:check commands on every push or pull request.

**Theory question:** Compare a local pre-commit hook with a CI quality gate. Why is CI still necessary when hooks are configured, and why should CI use non-mutating checks rather than automatically rewriting source files?

**Answer:** A pre-commit hook checks and can fix staged files locally. CI runs the checks independently on every push or pull request.

CI is still needed because local hooks can be skipped or misconfigured. CI should only check code, not modify it, so failed checks must be fixed and committed by the developer.

**ESLint Configurations**

Use ESLint configs [standard-with-typescript](https://www.npmjs.com/package/eslint-config-standard-with-typescript) and [TypeScript ESLint Plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin).
Your `.eslintrc` file should have the following extensions:
```.eslintrc.yml
...
extends:
  - standard-with-typescript
  - plugin:@typescript-eslint/recommended
  - plugin:prettier/recommended
  - prettier
...
```
 
**Prettier Configurations**

Apply the following ruleset for Prettier:
``` .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

## 3. Migrate to a Frontend Framework
In this playground you will migrate your application to React with TypeScript while retaining the build and quality pipeline from Playground 2.

### Tasks

#### Task 1: Establish the React application

Add React (or another framework of your choice) to the existing Vite and TypeScript project and migrate the page entry point to a React root. Preserve the build, linting, formatting, and CI setup from Playground 2, adapting scripts and configuration where necessary.

**Theory question:** Contrast imperative DOM updates with React's declarative model. What happens during React's render, reconciliation, and commit phases, and why should code outside React not modify DOM nodes owned by the React root? If you chose not to use React, answer the same questions in the context of your chosen framework.

**Answer:** Imperative DOM updates modify the DOM directly, while React declaratively describes the UI. React renders the UI, reconciles changes using the Virtual DOM, and commits necessary updates to the real DOM. External code should not modify React-owned DOM nodes because it can cause inconsistencies.

#### Task 2: Design the component tree

Decompose the interface into components organised by feature. Use props where appropriate, keep rendering pure, and render bear collections with stable keys.

**Theory question:** Explain how component boundaries and typed props act as contracts. What makes a key stable, why does React need keys during reconciliation, and why is an array index unsuitable when list entries can change order?

**Answer:** Component boundaries separate responsibilities, while typed props define a clear contract for what data a component expects.

React uses keys during reconciliation to identify list items across renders. A good key is unique and stable, meaning it stays the same for the same item. Array indexes are unsuitable when the order can change because they represent the item's position, not its identity, which can cause React to associate state with the wrong item.

#### Task 3: Model state and interaction

Implement the comment toggle, comment form, and search behavior with React events and state. Use controlled inputs, immutable updates, and derived values rather than duplicate state. Lift state only to the closest common owner that needs it.

**Theory question:** Distinguish props, stored state, and derived values. Explain why direct mutation can produce incorrect React behavior and when lifting state is preferable to introducing context.

**Answer:** Props are passed from parent to child. Stored state is saved between renders. Derived values are calculated from props or state.

Direct mutation can prevent correct React updates. Lift state for a few related components. Use Context when many components need the same data.

#### Task 4: Load and represent remote data

Load and validate the bear data within the React application. Represent loading, success, empty, and error states explicitly; prevent stale requests from overwriting newer results; and retain the image fallback behavior from Playground 1.

**Theory question:** Why is fetching data a synchronization with an external system rather than part of pure rendering? Explain how cleanup or cancellation prevents race conditions when a component unmounts or a request becomes irrelevant.

**Answer:** Fetching data is a side effect because it synchronizes the application with an external system. Pure rendering should only calculate the UI from the current props and state without causing external changes.

Cleanup or cancellation stops requests that are no longer relevant. This prevents an old request from updating the component after it has unmounted or after a newer request has already started, avoiding race conditions and outdated data.

#### Task 5: Add client-side routing and verify the migration

Add at least a list route and a bear-detail route using a stable bear identifier as a route parameter. Use query parameters for optional search/filter view state where appropriate. Verify that every requirement from Playground 1 still works and that all Playground 2 quality commands pass.

**Theory question:** Distinguish client-side rendering, a single-page application, and client-side routing. Compare route parameters with query parameters, and describe one benefit and one cost of the SPA architecture used here.

**Answer:** Client-side rendering creates the UI in the browser, a SPA works without full page reloads, and client-side routing switches views based on the URL.

Route parameters identify resources, while query parameters are used for optional filters or searches. SPAs provide smooth navigation but increase frontend complexity.

---

## In-Class Accessibility Workshop
You might have noticed that the base project has a number of accessibility issues - your task is to explore the existing site and fix them. Use the tools presented in our accessibility workshop to test the accessibility of your app and write a summary of your reports below.

### Tasks
* Accessibility Checks:
  * **Color**: Test the current color contrast (text/background), report the results of the test, and then fix them by changing the assigned colors.
  * **Semantic HTML**: Report on what happens when you try to navigate the page using a screen reader. Fix those navigation issues.
  * **Audio**: The ``<audio>`` player isn't accessible to hearing impaired people — can you add some kind of accessible alternative for these users?
  * **Forms**:
    * The ``<input>`` element in the search form at the top could do with a label, but we don't want to add a visible text label that would potentially spoil the design and isn't really needed by sighted users. Fix this issue by adding a label that is only accessible to screen readers.
    * The two ``<input>`` elements in the comment form have visible text labels, but they are not unambiguously associated with their labels — how do you achieve this? Note that you'll need to update some of the CSS rule as well.
  * **Comment Section**: The show/hide comment control button is not currently keyboard-accessible. Can you make it keyboard accessible, both in terms of focusing it using the tab key, and activating it using the return key?
  * **The table**: The data table is not currently very accessible — it is hard for screen reader users to associate data rows and columns together, and the table also has no kind of summary to make it clear what it shows. Can you add some features to your HTML to fix this problem?


>
> _Note your findings here..._
>

<p>© 2026 Leon Freudenthaler (Hochschule Campus Wien). All rights reversed.</p>

## Playground 4 

#### Task 1: API workspace (Express)

### Structure and decisions

- `apps/web`: existing React app, with its own package and TypeScript configuration.
- `apps/api`: small Express server, strict TypeScript, ESM, and one health route.
- Root `package.json`: npm workspaces and shared tools. `concurrently` starts both dev servers together.
- Root `npm run build`, `typecheck`, `lint`, and `format:check` check both apps. `lint:fix` and `format` also apply to both.
- Husky/lint-staged checks staged source files in both workspaces. CI checks both and builds both Docker images.

I use Express instead of Fastify because this task only needs a small HTTP server, and its `app.get()` and `response.json()` calls are easy to explain. And mostly because I have more experience with Express than Fastify.

### Theory
Node's event loop: why does one slow synchronous operation delay every request? What is a health endpoint for, and who calls it?

### Answer:
Node.js runs JavaScript callbacks on a single event-loop thread. A slow synchronous operation blocks that thread, so other requests must wait. Asynchronous I/O allows the event loop to handle other work while waiting, but CPU-heavy JavaScript still blocks it, even inside an async function. Such tasks can be offloaded to worker threads.

A health endpoint allows monitoring systems, load balancers, container health checks, or developers using curl to check whether a server responds. A simple liveness check confirms that the API is running, but not that external services like Wikipedia are available.

### Commands to start and test

Start both containers:

```sh
docker compose up --build
```

In a second terminal, check the API directly and through the Nginx proxy:

```sh
curl -i http://localhost:3000/health
curl -i http://localhost:8080/api/health
```

Both requests should return `200 OK` and JSON containing `status`, `version`, and `uptime`. `uptime` is the API process runtime in seconds.

Check the web page:

```sh
curl -i http://localhost:8080/bears
```

#### Task 2: Move Wikipedia behind a BFF

### Theory
What is a BFF, and what moves from the browser to the server? Why is an empty 200 on upstream failure
worse than a 502?

### Answer:
A BFF (Backend for Frontend) is a backend designed for a specific frontend. It moves API requests, data parsing, validation, and error handling from the browser to the server.

Returning an empty `200 OK` on upstream failure is misleading because it looks like a successful request with no data. A `502` correctly indicates an upstream failure, allowing the frontend to display an error instead of an empty list.

#### Task 3: Design the comments API

### Theory

Safe, idempotent, cacheable methods. Why POST for creating, why must DELETE be idempotent, what happens when a client retries a POST?

### Answer

Safe methods like GET only read data without changing server state. Idempotent methods like GET, PUT, and DELETE have the same intended effect when repeated. Cacheable responses, such as GET responses, can be stored and reused.

POST is used for creating comments because it changes server state and is not idempotent, allowing each request to create a new resource. DELETE must be idempotent so repeated requests leave the comment deleted. Retrying a POST may create duplicate comments because each request can create a new resource.

### Commands to test

**201 Created – Create a comment:**

```sh
curl -i -X POST http://localhost:3000/api/bears/m-ursinus/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"David","text":"This is a test comment"}'
```

Expected: `201 Created` with a `Location` header. Copy the returned comment ID.

**204 No Content – Delete the comment:**

```sh
curl -i -X DELETE http://localhost:3000/api/comments/YOUR-COMMENT-ID
```

Expected: `204 No Content`.

**400 Bad Request – Invalid input:**

```sh
curl -i -X POST http://localhost:3000/api/bears/m-ursinus/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"","text":""}'
```

Expected: `400 Bad Request`.

**404 Not Found – Unknown comment:**

```sh
curl -i -X DELETE http://localhost:3000/api/comments/does-not-exist
```

Expected: `404 Not Found`.
#### Task 4: One error format for everything

### Theory

Why exactly one error contract? Which information must never leave the server, and how do request ids
connect a complaint to a log line?

### Answer

One error contract ensures that all API errors have the same format, making them easier for the frontend to handle consistently.

Sensitive information like stack traces, passwords, tokens, internal server details, or database information must never be exposed to the client.

The API accepts an incoming `x-request-id` with 1–128 letters, digits, underscores, or hyphens; otherwise it generates a UUID. The ID appears in the response header and server logs, and the error's `instance` is `/requests/<requestId>`. This allows developers to find the corresponding log entry when a user reports an error.

### Commands to demonstrate Task 4

**400 Bad Request (invalid comment):**

```sh
curl -i -X POST http://localhost:3000/api/bears/u-arctos/comments \
  -H 'Content-Type: application/json' \
  -d '{"author":"","text":""}'
```

Expected: `400 Bad Request` and an `errors` array with validation messages.

**404 Not Found (unknown route):**

```sh
curl -i http://localhost:3000/api/does-not-exist
```

Expected: `404 Not Found`.

**502 Bad Gateway (Wikipedia unavailable, Playground 4 only):**

```sh
WIKIPEDIA_API_URL=https://falsche.url/w/api.php npm run dev
curl -i http://localhost:3000/api/bears
```

Expected: `502 Bad Gateway`, not an empty list.

**500 Internal Server Error (deliberately thrown error):**

```sh
curl -i http://localhost:3000/api/debug/error
```

Expected: `500 Internal Server Error` with a generic detail, without a stack trace or internal error message.

### Commands to test Task 5

**1. Start the API with an intentionally wrong allowed origin:**

```sh
CORS_ORIGINS=http://localhost:9999 npm run dev -w apps/api
```

**2. In another terminal, build and preview React with direct API calls:**

```sh
VITE_API_URL=http://localhost:3000 npm run dev -w apps/web -- --port 4173
```

**3. Restart the API with the correct allowed origin:**

```sh
CORS_ORIGINS=http://localhost:4173 npm run dev -w apps/api
```

### Theory

Who enforces CORS? Simple vs preflighted requests? Why no `*` with credentials,
and why does a BFF make most CORS problems disappear?

### Answer

CORS is enforced by the browser, while the server defines which origins are allowed.

Simple requests, such as GET, are sent directly. Preflighted requests first send an OPTIONS request to check permissions, for example before a DELETE or a POST with JSON.

The wildcard `*` cannot be used with credentials because the server must explicitly specify the allowed origin when cookies or other credentials are included.

A BFF reduces CORS problems because the browser communicates with the backend through the same origin using a proxy. The BFF then handles external API requests server-side, where browser CORS restrictions do not apply.

## Playground 5 

#### Task 1

Start the stack and wait for PostgreSQL to accept connections:

```sh
docker compose up -d --build --wait
curl -i http://localhost:3000/health/ready  # 200
docker compose stop db
curl -i http://localhost:3000/health/ready  # 503 application/problem+json
curl -i http://localhost:3000/health        # 200
docker compose up -d --wait db
curl -i http://localhost:3000/health/ready  # 200
```

For local development use `docker compose up -d --wait db` and `npm run dev`.

### Theory

Liveness versus readiness: who uses each, and what goes wrong if the readiness check includes too many dependencies? Why is a pool necessary, and what limits its size?

### Answer

**Liveness** tells an orchestrator whether the API process responds. **Readiness** tells a load balancer whether to send it traffic. Readiness runs `SELECT 1` to check the database. Adding optional services to this check could take healthy API instances out of rotation during an unrelated outage.

The API shares one connection pool. Requests reuse connections, avoiding the cost of connecting each time. When the pool is full, requests wait. Its size depends on available database connections, CPU, memory and how many API instances share them.

#### Task 2

```sh
docker compose up -d --wait db
npm run db:migrate
npm run db:seed
npm run dev
```

### Theory

Why migrations instead of creating tables from code at startup? What does forward-only mean, and what goes wrong when two branches both create migration 0003? Natural versus surrogate key: when is which appropriate?

### Answer

**Migrations.** A versioned SQL migration brings every environment through the same schema changes. Creating tables at startup cannot update an existing table. Forward-only means an applied migration stays as written and a correction gets a new migration. If two branches generate migration 0003, their journals and snapshots disagree. Rebase and regenerate the unapplied migration against the merged history.

**Keys and indexes.** A bear's slug is a natural key because it already identifies the bear in URLs. A comment has no stable natural identifier, so PostgreSQL generates a UUID as its surrogate key. The foreign key links each comment to a bear and deletes its comments when the bear is deleted. The composite index on (bear_id, created_at, id) supports listing one bear's comments in a stable time order.

#### Task 3

### Theory

What does the repository hide, and what does it cost? Explain the N+1 problem using "comments for all bears" and show how your repository avoids it.

### Answer

A repository hides storage details such as column names, query syntax and timestamp conversion. The cost is maintaining the interfaces and keeping both implementations consistent. An N+1 query would load all bears once and then query comments separately for each of N bears. The current UI asks for comments for the selected bear only. Its endpoint looks up that bear by ID and fetches its comments in one filtered query. A future view showing comments for all bears should use one join or one batched comment query.

### Playground 5 — Task 4

Search for bears by name (for example, panda):

```sh
curl -i 'http://localhost:3000/api/bears?q=panda'
```

```sh
curl 'http://localhost:3000/api/bears/u-arctos/comments?limit=2'
# Replace TOKEN with nextCursor from the response.
curl 'http://localhost:3000/api/bears/u-arctos/comments?limit=2&cursor=TOKEN'
```

```sh
docker compose exec -T db psql -X -v ON_ERROR_STOP=1 -U bears -d bears < apps/api/scripts/measure-comments.sql
```

The benchmark uses a temporary table with 100,000 comments to compare query performance before and after creating the composite B-tree index. The permanent index on the comments table is defined in the Drizzle migration.

```text
CREATE TABLE
INSERT 0 100000
ANALYZE
PREPARE
 Limit  (cost=2675.27..2675.32 rows=21 width=81) (actual time=16.605..16.608 rows=21.00 loops=1)
   Buffers: local hit=8 read=1022 written=1014
   ->  Sort  (cost=2675.27..2706.19 rows=12367 width=81) (actual time=16.602..16.603 rows=21.00 loops=1)
         Sort Key: created_at DESC, id DESC
         Sort Method: top-N heapsort  Memory: 30kB
         Buffers: local hit=8 read=1022 written=1014
         ->  Seq Scan on comment_sample  (cost=0.00..2341.84 rows=12367 width=81) (actual time=0.307..14.579 rows=12500.00 loops=1)
               Filter: (bear_id = 'bear-0'::text)
               Rows Removed by Filter: 87500
               Buffers: local hit=8 read=1022 written=1014
 Planning:
   Buffers: shared hit=46 read=5
 Planning Time: 0.304 ms
 Execution Time: 16.624 ms
CREATE INDEX
 Limit  (cost=0.42..8.34 rows=21 width=81) (actual time=0.029..0.044 rows=21.00 loops=1)
   Buffers: local hit=2 read=3
   ->  Index Scan Backward using sample_bear_created_idx on comment_sample  (cost=0.42..4668.14 rows=12367 width=81) (actual time=0.028..0.041 rows=21.00 loops=1)
         Index Cond: (bear_id = 'bear-0'::text)
         Index Searches: 1
         Buffers: local hit=2 read=3
 Planning:
   Buffers: shared hit=40, local read=1
 Planning Time: 0.394 ms
 Execution Time: 0.063 ms
```

### Theory

Why does offset pagination get slower and skip or repeat rows, and how does a cursor avoid that? What is a
B-tree index, why does the column order in a composite index matter, and why may PostgreSQL ignore an index on a
small table?

### Answer

Offset pagination gets slower because the database must scan and skip rows. Inserts or deletes can shift positions, causing skipped or duplicate results. **Cursor pagination** avoids this by continuing from the last retrieved row using a stable ordering.

A **B-tree index** is a sorted tree structure that speeds up searches and sorting. Column order matters in composite indexes because PostgreSQL can use them most efficiently when queries filter on the leading columns.

PostgreSQL may ignore an index on small tables because a **sequential scan** can be faster than using the index.

### Playground 5 — Task 5

`POST /api/comments/:commentId/report` adds one report and returns the updated comment. The third report sets `hiddenAt`. Hidden comments disappear from the paginated list but remain available by ID so the final count can be inspected. Further reports increment the count and preserve the original hiding time.

```sh
curl -i -X POST http://localhost:3000/api/comments/:id/report
```

Run the comparison from the project root with the local database configured as in Task 2:

```sh
docker compose up -d --wait db
npm run db:migrate
npm run db:seed
npm run report:storm
```

The storm starts a local HTTP server for each implementation, creates a temporary comment, sends 50 concurrent POST requests, reads the stored count by ID and deletes the demo comment. In one local run:

| Implementation | Reports sent | Stored count |
|---|---:|---:|
| Naive read, increment in TypeScript, write | 50 | 5 |
| Atomic SQL update | 50 | 50 |

The naive result varies. Two requests can both read 4 and both write 5, losing one increment. Under PostgreSQL's default **read committed** isolation each statement sees committed data at the start of that statement. Separate reads and writes can still interleave, even inside a transaction. In the atomic version PostgreSQL locks the row during the update. A competing update waits and increments the latest value. The report service defines the whole operation as one atomic repository call. PostgreSQL wraps this single statement in an implicit transaction that updates both the count and the hiding timestamp.

### Theory

Explain ACID and the lost-update anomaly. What does PostgreSQL's default isolation level (read committed)
guarantee, and what not? Compare pessimistic locking, atomic updates and optimistic concurrency with a version
column.

### Answer

**ACID** stands for Atomicity (all or nothing), Consistency (valid data), Isolation (transactions do not interfere incorrectly), and Durability (committed changes persist).

A **lost update** occurs when two transactions read the same value and overwrite each other's changes.

PostgreSQL's default isolation level, **Read Committed**, prevents dirty reads but allows non-repeatable reads, phantom reads, and lost updates in read-modify-write operations.

**Solutions:**

- **Pessimistic locking:** Uses `SELECT FOR UPDATE` to lock rows, but may cause waiting.
- **Atomic updates:** Uses `UPDATE ... SET count = count + 1` to safely modify values in one statement.
- **Optimistic concurrency:** Uses a version column to detect conflicts. Failed updates must be retried.

For incrementing a comment's report count, **atomic updates are usually the simplest solution**.
### Playground 6 — Task 1

```sh
docker compose up -d --wait db
npm run db:migrate
npm run dev
```

For testing:

```sh
curl -i -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"a long demo password"}'
```

The first request returns 201 and the public user fields. Repeating it returns 409 Problem Details.

Inspect password storage:

```sh
docker compose exec -T db psql -U bears -d bears -c 'SELECT email, password_hash FROM users;'
```

### Theory

Why hash instead of encrypt, what do salt and work factor do, and why is a deliberately slow hash a feature?  Why does NIST SP 800-63B prefer length over composition rules? What is the trade-off between a clear 409 and user enumeration?

### Answer

Passwords are hashed instead of encrypted because hashing is one-way and passwords cannot be decrypted. A salt ensures that identical passwords produce different hashes, while the work factor controls the time and memory required. Deliberately slow hashing makes brute-force attacks more expensive. NIST prefers password length over composition rules because longer passwords are generally harder to guess, while composition rules often lead to predictable patterns. A clear 409 Conflict improves usability by indicating that an email is already registered, but it also enables attackers to discover existing accounts through user enumeration.

### Playground 6 — Task 2

For local HTTP development, use `NODE_ENV=development` (also the Compose default). Production requires HTTPS, `NODE_ENV=production` and a private `SESSION_SECRET` of at least 32 characters. Generate a secret with `openssl rand -hex 32`. Behind the trusted TLS proxy, forward `X-Forwarded-Proto: https`; the API trusts one proxy hop. The deployment must restrict direct API access to that trusted proxy.

```sh
# Register demo@example.com first using Task 1.
curl -i -c /tmp/bears-cookies.txt http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"a long demo password"}'
curl -i -b /tmp/bears-cookies.txt http://localhost:3000/api/auth/me
curl -i -X POST -b /tmp/bears-cookies.txt http://localhost:3000/api/auth/logout
curl -i -b /tmp/bears-cookies.txt http://localhost:3000/api/auth/me
```

Expected responses are 200, 200, 204, then 401 Problem Details. Even replaying the old cookie after logout returns 401. Wrong credentials return a generic 401.

**ADR — authentication state**

Context: The React SPA and Express API require secure authentication and session management.
Context: PostgreSQL is already available and can store sessions across multiple API instances.
Options: Server-side sessions with an opaque session ID stored in an HTTP cookie, or signed JWTs.
Trade-offs: Sessions allow immediate revocation, while JWTs avoid database lookups but require additional mechanisms for secure logout and revocation.
Decision: Use express-session with connect-pg-simple and the existing PostgreSQL connection pool.
Rationale: Server-side sessions simplify logout, keep sensitive user data on the server, and fit our existing architecture.
Storage: PostgreSQL stores session data, including the user ID and expiry; the browser only receives a signed, opaque session ID.
Security: Cookies use HttpOnly, SameSite=Lax, Path=/, and Secure in production, with a 24-hour lifetime.
Lifecycle: Login verifies the password using Argon2id and regenerates the session ID; logout destroys the server-side session.
Consequences: Sessions require PostgreSQL availability and a shared session secret across API instances, but provide small cookies, centralized control, and immediate revocation.

### Theory

Compare session cookies and JWTs regarding revocation, statelessness, size and storage in the browser. What does an XSS attacker get in each case, and how does SameSite relate to CSRF?

### Answer
Session cookies are small and stateful because session data is stored on the server, allowing immediate revocation. JWTs are larger and stateless, but harder to revoke before expiration. HttpOnly session cookies cannot be stolen through JavaScript, although XSS attackers can still make authenticated requests. JWTs stored in localStorage can be stolen through XSS. SameSite helps prevent CSRF by restricting when browsers send cookies with cross-site requests, but it does not provide complete protection.

### Playground 6 — Task 3

Apply the migration and seed a moderator:

```sh
npm run db:migrate
# Set MODERATOR_EMAIL and MODERATOR_PASSWORD (12–128 characters) in .env first.
npm run db:seed:moderator
```

**Prepare two users and three cookie files:**

```sh
# Register demo@example.com using Task 1 if it does not exist yet.
curl -i http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"other@example.com","password":"another long password"}'

curl -i -c /tmp/author-cookies.txt http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"a long demo password"}'
curl -i -c /tmp/other-cookies.txt http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"other@example.com","password":"another long password"}'
# Replace email and password with the moderator credentials from .env.
curl -i -c /tmp/moderator-cookies.txt http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"moderator@example.com","password":"REPLACE_WITH_MODERATOR_PASSWORD"}'
```

**Anonymous creation: 401**

```sh
curl -i http://localhost:3000/api/bears/u-arctos/comments \
  -H 'Content-Type: application/json' \
  -d '{"author":"Demo","text":"My comment"}'
```

Create a comment as the author (201), then copy its returned `id` into `COMMENT_ID`:

```sh
curl -i -b /tmp/author-cookies.txt http://localhost:3000/api/bears/u-arctos/comments \
  -H 'Content-Type: application/json' \
  -d '{"author":"Demo","text":"My comment"}'
COMMENT_ID='replace-with-returned-id'

# Anonymous: 401
curl -i -X DELETE "http://localhost:3000/api/comments/$COMMENT_ID"
# Another user: 403
curl -i -X DELETE -b /tmp/other-cookies.txt "http://localhost:3000/api/comments/$COMMENT_ID"
# Author: 204
curl -i -X DELETE -b /tmp/author-cookies.txt "http://localhost:3000/api/comments/$COMMENT_ID"
```

Create another comment with the same POST command, update `COMMENT_ID` to its new ID, then delete it as moderator (204):

```sh
curl -i -X DELETE -b /tmp/moderator-cookies.txt "http://localhost:3000/api/comments/$COMMENT_ID"
```

### Theory

Authentication versus authorisation, 401 versus 403. Explain RBAC and ownership checks, what an IDOR vulnerability is (OWASP A01 Broken Access Control) and why hiding a button in the client is not a security control.

### Answer

Authentication verifies **who the user is**, while authorisation checks **what they are allowed to do**. A **401** means the user is not authenticated, while **403** means they lack permission. **RBAC** controls access based on roles, and ownership checks ensure users can only modify their own resources. **IDOR** is a security vulnerability where users access other users' resources by changing IDs without proper permission checks. Hiding a button is not secure because API requests can still be sent directly. Access control must always be enforced on the server.