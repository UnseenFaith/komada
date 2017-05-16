## Issues & Pull Requests
 - Issues and Pull Requests now have a template.
   Ensure you follow these templates or your Issue/PR may be auto-denied.

- In the subject title of a PR place a [TYPE] at the front of the title.
  TYPE can be BUGFIX, FEATURE, REMOVAL or anything that is suitable for the PR

 - When making changes to the source code, ensure the changes are based on the **Indev** branch of the repo.
   This is to ensure that any changes are not outdated.

## Commits
 - Whilst other Contribs have thier own commit message styles, having a commit message template for the Git command-line can streamline this.
   An example of this is below:

 ```
 # If this is the first commit in a PR
 # Start the first commit with a Category Header
 # All subsequent commits are to have the [PR] header

 # Subject Line: [BUG-FIX/FEATURE/REMOVAL]

 # Updated Semver Proposal [MAJOR/MINOR/PATCH]
 SEMVER:

 # What is being committed.
 Why:

 *

 # What does it fix?

 This change addresses the need by:

 *

 # Issue Tracker References go here, Use github #
 # Example, Fixes #123 (Refers to Issue #123)


 # Commit Character Length limits are below
 # 50-character subject line
 #
 # 72-character wrapped longer description.

```

- The above example is saved in a `.gitmessage` file and stored in git config via `git config commit.template /path/to/.gitmessage`

## Questions
- If there are any Questions regarding the Contribution Guidelines, Contact CyberiumShadow on the evie.codes Discord Server
