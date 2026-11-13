# Debugging

The job is to find the cause, then fix it. A change that makes the symptom go
away without a known cause is a second bug waiting.

## Order of work

1. **Reproduce it.** Get the failure to happen on demand, with the smallest
   input you can. If you cannot reproduce it, say so, and treat everything
   after as a guess.
2. **Read the whole error.** The full message, the full stack trace, the
   line it points at. Read the code at that line as it is now, not as you
   expect it to be. Most bugs are stated in the output that nobody finished
   reading.
3. **Ask what changed.** It worked before, or it works elsewhere. The
   difference between working and broken is the search space: a commit, a
   version, an input, an environment variable, a machine.
   Confirm that the code you are reading is the code that runs: print a
   marker, check which interpreter and which installed package version is
   in use, and look for a stale build folder or cache.
4. **Write down two or three candidate causes** before testing any. For each,
   name the observation that would be true only if it were the cause.
5. **Test the cheapest discriminating observation first.** A print, a log
   line, an assertion, a bisect. One change at a time, so you know which
   change did what.
6. **Explain every symptom.** The cause you settle on must account for all
   of what was observed, including the odd detail you wanted to ignore. If
   one thing is left over, you have not found it yet, or there are two bugs.
7. **Fix the cause where it lives,** not where it surfaced. Then run the
   reproduction again and watch it pass. Then check whether the same mistake
   exists in sibling code.

## Traps

- Changing code to "see if that helps". Each speculative edit moves the
  system and muddies the evidence. Observe first, edit after.
- Trusting the comment, the function name or the docs over what the code
  does. Run it.
- Wrapping the failure in a try/catch, a retry, a null check or a longer
  timeout. That hides the symptom. Ask why the value was null.
- Blaming the framework, the compiler or cosmic rays. It is nearly always
  your code or your assumption. Check those first.
- Stopping at the first bug found when the user reported something
  different. Confirm it produces their symptom.
- Two failed attempts on one theory. Your model of the system is wrong
  somewhere. Stop, list what you have verified with your own eyes, and
  question the item you are surest of.

## Done when

You can state the cause in one sentence, the reproduction now passes, and you
have said what you checked and what you did not.
