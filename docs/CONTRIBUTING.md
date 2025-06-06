# Contributing to Multi-Company Job Monitor

First off, thank you for considering contributing to Multi-Company Job Monitor! We welcome any help to make this project better. Whether it's reporting a bug, discussing improvements, or submitting a pull request, your involvement is highly appreciated.

## Table of Contents

- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Reporting a Vulnerability](#reporting-a-vulnerability)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Style](#coding-style)
- [Testing](#testing)
- [Code of Conduct](#code-of-conduct)
- [Questions?](#questions)

## How Can I Contribute?

### Reporting Bugs

If you encounter a bug, please help us by reporting it. Good bug reports are extremely helpful! Before submitting a bug report, please check the existing [issues](https://github.com/retrospct/hunter/issues) to see if someone else has already reported it.

When filing an issue, make sure to include:
- A clear and descriptive title.
- Steps to reproduce the bug.
- What you expected to happen.
- What actually happened.
- Your environment details (e.g., Node.js version, OS).
- Any relevant error messages or logs.

### Suggesting Enhancements

We're open to suggestions for new features or improvements to existing ones. Feel free to open an [issue](https://github.com/retrospct/hunter/issues) to discuss your ideas. Provide as much detail as possible, including:
- A clear description of the enhancement.
- The problem it solves or the value it adds.
- Any potential implementation ideas (optional).

### Your First Code Contribution

Unsure where to begin contributing to Multi-Company Job Monitor? You can start by looking through `good first issue` and `help wanted` issues:
- [Good first issues](https://github.com/retrospct/hunter/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
- [Help wanted issues](https://github.com/retrospct/hunter/labels/help%20wanted) - issues which should be a bit more involved than `good first issues`.

### Pull Requests

We actively welcome your pull requests.

1.  **Fork** the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes (if applicable).
5.  Make sure your code lints.
6.  Issue that pull request!

## Development Setup

To get started with development:

1.  **Fork** the repository.
2.  **Clone** your fork:
    ```bash
    git clone https://github.com/retrospct/hunter.git
    cd hunter
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up environment variables**:
    Copy `.env.example` to `.env` and fill in your details.
    ```bash
    cp .env.example .env
    ```
    You will need to configure at least the email settings to run the application. See the main `README.md` for details on `EMAIL_USER`, `EMAIL_PASS`, and `NOTIFICATION_EMAIL`. For cloud scraping, `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` are also needed.

5.  **Make your changes** in a new git branch:
    ```bash
    git checkout -b feature/my-awesome-feature
    ```

## Coding Style

-   **TypeScript**: This project uses TypeScript. Please follow standard TypeScript best practices.
-   **Code Formatting**: We use Prettier for code formatting. Please ensure your code is formatted before committing. You can run `npx prettier --write .` to format your code.
-   **Linting**: (Future - We will add a linter like ESLint. For now, try to match the existing code style.)
-   **Comments**: Write clear and concise comments where necessary to explain complex logic.

## Testing

Currently, the project has a placeholder for tests (`"test": "echo "Error: no test specified" && exit 1"` in `package.json`). We aim to add a comprehensive test suite. If you are contributing new features or bug fixes, please consider adding relevant tests.

(Future - Once a testing framework is in place, instructions on how to run tests will be added here.)

## Code of Conduct

This project and everyone participating in it is governed by the [Multi-Company Job Monitor Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## Questions?

If you have any questions or need help, feel free to open an issue or start a discussion at https://github.com/retrospct/hunter/discussions.

Thank you for contributing!

## Reporting a Vulnerability

The Multi-Company Job Monitor team and community take all security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

If you believe you have found a security vulnerability in Multi-Company Job Monitor, please report it to us privately. **Do not create a public GitHub issue.**

Please email us at [me@jlee.cool](mailto:me@jlee.cool).

When reporting a vulnerability, please include the following details:

- A clear description of the vulnerability.
- Steps to reproduce the vulnerability.
- The potential impact of the vulnerability.
- Any suggestions for a fix (optional).

We will acknowledge receipt of your vulnerability report within 48 hours and will send you regular updates about our progress. We aim to address all valid reports as quickly as possible.

Once a vulnerability is fixed, we will coordinate with you on public disclosure, if appropriate. We may also list your name in our acknowledgments if you agree.

Thank you for helping keep Multi-Company Job Monitor secure.