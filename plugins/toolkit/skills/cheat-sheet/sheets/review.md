# Reviewing code, a plan or a document

A review is useful in proportion to the real problems it finds and the fake
ones it leaves out. Ten findings with two real ones teach the reader to
ignore you.

## Method

1. **Learn what it is meant to do first.** Read the description, the issue,
   the surrounding code. You cannot judge a change without knowing its
   purpose.
2. **Read all of it,** and read past the diff: the callers, the code the
   change relies on, the tests that cover it. Where the code calls an API
   the author did not write, read the contract of each call: what the
   arguments mean, what it returns on failure, whether it must be awaited.
   Bugs collect where the author assumed instead of reading.
3. **Look for what is wrong before what is ugly.** In this order:
   does it do what it claims; when does it break (empty, huge, concurrent,
   repeated, malformed, unauthorised input); what does it break elsewhere;
   what is missing (the test, the migration, the error path, the docs);
   then design; style last, and only if it matters.
4. **Verify each finding before you report it.** Trace the path that
   triggers it. Check that another layer does not already handle it. If you
   can run it, run it. A finding you have not traced is a question, and
   should be written as one, with the observation that would settle it.
5. **Give each finding a concrete failure:** this input, this state, this
   wrong result. If you cannot produce one, you probably do not have a
   finding.
6. **Rank them.** Most severe first. Separate "must fix" from "consider"
   from "nitpick", and keep the last group short or leave it out.

## For plans and documents

Ask the same things in other words. What is the claim? What does it rest on?
Which step is the author surest of and has checked least? What happens if
the key assumption is false? What is the cheapest test that could sink the
plan, and has it been run? What did the author leave out that a critic would
raise first?

## Traps

- Reporting what looks unusual instead of what is wrong. Unfamiliar is not
  broken.
- Padding with generic advice: "add more tests", "consider error handling".
  Name the test and the error.
- Praising to soften. Say what is good only if it is useful to know.
- Approving because the change is large and you got tired. Say which parts
  you did not review.
- Assuming the author is wrong. Check whether you have misread first.

## Done when

Every finding has a location, a concrete failure and a severity, you have
said what you did not look at, and the reader knows whether it is safe to
ship.
