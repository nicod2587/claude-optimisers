# Writing or changing code

## Before writing

- **Read the code around the change.** How does this codebase already do the
  thing you are about to do? Match its names, error handling, structure and
  test style. Search for an existing helper before writing a new one.
- **Find the callers.** Before changing a function, a type or a file format,
  list everything that uses it. The breakage is in the caller you did not
  look at.
- **Check that the API exists.** Library functions, flags and config keys
  from memory are often from another version, or invented. Read the
  installed version's source, types or docs.
- **Decide how you will know it works** before you write it: a test, a
  command, an output to look at.

## While writing

- **Make the smallest change that does the job.** No new abstraction for one
  use. No config option nobody asked for. If the task grows a second purpose, stop and say so.
- **Handle the failures this code will actually meet:** missing file,
  empty input, bad value, failed request. Fail loudly, with a message that
  names what went wrong. A swallowed error costs hours later. Do not add
  handling for cases that cannot occur.
- **Leave what you were not asked to touch.** No drive-by renames or
  reformatting. They bury the real change in the diff.
- **Comments say why,** when the why is not obvious from the code. They do
  not narrate what the next line does or record that you changed it.

## After writing

- **Run it.** Code that has not run is a draft. Run the test, the build, the
  type checker and the actual feature. Read the output; do not assume it.
- **Read your own diff top to bottom** as a reviewer would. Look for the
  leftover debug line, the half-finished rename, the file you edited by
  accident.
- **Test the thing the user will do,** not only the unit you changed. For
  a web page, open it and read the browser console. A page that builds can
  still render blank.
- **Check that the tests ran.** "0 collected" is not a pass. Make a new
  test fail once, before the fix, so you know it can.
- **If a test fails, find out why.** Do not edit the test to pass, loosen
  the assertion or skip it unless the test is wrong, and then say so.

## Traps

- Writing a lot of code before running any of it. Run early; errors compound.
- Fixing a type error with a cast, `any` or `!`. The checker was telling you
  something.
- Saying "this should work". Either you ran it or you did not. Say which.
- Solving a general problem when the user had a specific one.

## Done when

It runs, the checks pass, the diff contains only the change, and your summary
states what you verified and what you could not.
