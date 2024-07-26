name: Bug Report
description: Please fill out the fields below completely in order to resolve the issue. If the issue is not reproducible, please do not create a new issue.
title: "[BUG] "
labels: 
  - bug
assignees: ''
body:
  - type: textarea
    id: issue-description
    attributes:
      label: Issue Description
      description: Please provide a clear and concise description of the bug.
      placeholder: ...
    validations:
      required: true

  - type: textarea
    id: steps-to-reproduce
    attributes:
      label: Steps to Reproduce
      description: Please provide detailed steps to reproduce the bug.
      value: |
        1. ...
        2. ...
        3. ...
    validations:
      required: true

  - type: textarea
    id: expected-behavior
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
      placeholder: ...
    validations:
      required: true

  - type: textarea
    id: actual-behavior
    attributes:
      label: Actual Behavior
      description: What actually happened?
      placeholder: ...
    validations:
      required: true

  - type: textarea
    id: screenshots
    attributes:
      label: Screenshots
      description: If available, add screenshots here to help explain the issue.

  - type: input
    id: operating-system
    attributes:
      label: Operating System
      placeholder: ...

  - type: input
    id: browser
    attributes:
      label: Browser
      placeholder: ...

  - type: input
    id: application-version
    attributes:
      label: Application Version
      placeholder: ...

  - type: textarea
    id: additional-context
    attributes:
      label: Additional Context
      description: Add any other information about the issue here.
      placeholder: ...
