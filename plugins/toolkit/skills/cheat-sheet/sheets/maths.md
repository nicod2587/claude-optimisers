# Maths, derivations, models and estimates

Fluent algebra goes wrong without any sign that it has. The defence is
checking that does not depend on the derivation being right.

## Before deriving

- **State the problem exactly.** Define every symbol, its units and its
  domain. List the assumptions. Half of all confusion is two meanings for
  one letter.
- **Guess the answer first.** Its sign, its rough size, how it should scale
  with each parameter. A derivation that disagrees with the guess needs one
  of them explained.
- **Check whether it is a known result.** Look it up, and check that the
  conditions of the theorem hold here. They are where misuse happens.

## While deriving

- **Small steps, each one justified.** When a step uses a condition
  (positivity, convergence, independence, swapping a limit and an integral,
  dividing by something), name the condition and check it.
- **Carry units and dimensions** through every line.
- **Write for the reader who will check it.** If you skipped a step because
  it was obvious, do it anyway. Obvious steps hold most of the sign errors.

## After deriving

Run at least two of these. They are cheap and they catch most mistakes.

- **Limiting cases.** Set a parameter to zero, to infinity, to the
  symmetric value. Does the result reduce to what it must?
- **A numeric spot check.** Put in numbers and evaluate both sides. Simulate
  the model and compare with the formula. Use code; do not do arithmetic in
  your head.
- **Dimensions.** Both sides must match.
- **A second route.** Derive it another way, or test a special case by hand.
- **Sanity.** Probabilities in [0, 1], variances non-negative, populations
  not below zero, energy conserved.

## Models

- Say what the model is for. Its assumptions follow from that.
- For a dynamical system: fixed points, their stability, and what happens
  at the parameter boundaries, before any simulation.
- When simulation and analysis disagree, find out which is wrong. Do not
  report the one you like. Check step size and initial conditions.
- A parameter fitted to data is not a parameter measured. Say which is
  which, and how much the conclusion moves when they do.

## Proofs

Know which line carries the difficulty. If every step felt easy, the hard
part is hiding in one of them. Try to build a counterexample to your own
claim before believing it. If a gap remains, mark it as a gap.

## Traps

- Pattern-matching to a familiar problem that differs in one condition.
- A plausible-looking final formula treated as confirmation.
- Rounding early. Dropped factors of 2, pi, n versus n-1.
- "It can be shown that" for something you have not shown.

## Done when

The result survives two independent checks, assumptions are listed, and any
step you could not verify is flagged.
