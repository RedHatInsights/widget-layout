# Jira issue draft

Project: RHCLOUD
Issue type: Task
Summary: Onboard widget-layout to i18n validation and Phrase delivery
Team: Console - Framework (ae9633ff-0523-49b5-b99b-16342fc5a327)
Sprint: Confirm the current sprint before creating the issue.

## Description

Add catalog validation and register RedHatInsights/widget-layout with the central i18n-hub for translation delivery through the shared hcc-ui Phrase project. The application already has 127 explicit message IDs, translator descriptions, and runtime loaders for fr, ko, ja, and zh-CN.

## Acceptance criteria

- Validate source ICU, explicit IDs, extraction parity, and declared catalog directories on pull requests.
- Configure Phrase delivery to messages/{locale}.json for fr, ko, ja, and zh-CN, preserving existing empty placeholders until delivery.
- Register widget-layout.ui.en.json in i18n-hub after the consumer change is ready.
- Record App installation and any remaining manual steps in the pull request descriptions.
- Preserve generated catalog bytes and existing application behavior.

## Creation status

The developer approved issue creation, but this session has neither a Jira integration nor the acli CLI. This draft has not been submitted to Jira. Confirm the current sprint and set the Console - Framework team when creating it; then link the issue from the onboarding pull requests.
