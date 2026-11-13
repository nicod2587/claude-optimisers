# Data analysis, statistics and figures

## Look at the data first

- Open it. Print rows from the top, the bottom and the middle. Count rows
  and columns, and compare with what you were told to expect.
- For each column that matters: type, range, missing values, duplicates,
  impossible values, units. Plot its distribution.
- Check the types after loading and parse dates explicitly. Numbers read
  as text, and dates read as strings, sort and compare wrongly without an
  error. Know how your library treats missing values: pandas leaves them
  out of means and drops missing group keys silently.
- Find out how the data came to exist: who was sampled, who dropped out,
  what was measured and how. The answer limits every conclusion after it.

Most wrong analyses are correct statistics on data that was not what the
analyst thought it was.

## Decide the analysis before seeing the result

- Write down the question, the comparison and the measure before running
  it. If you choose after looking, say that the result is exploratory.
- Check each method's assumptions against this data: independence,
  distribution, sample size, equal variances. Repeated measures from one
  person are not independent.
- Count how many things you tested. Twenty tests give one "significant"
  result by chance.

## Check every transformation

- After a join, a filter or a group-by, count rows again. A join that
  doubled the rows or a filter that removed half of them is the commonest
  silent error there is.
- Recompute one result by hand on a few rows.
- Run the pipeline on a tiny made-up dataset where you know the answer.

## Reading the result

- Every number in your write-up comes from output you ran in this session.
  Copy it from the output; do not retype it from memory or round it by
  feel. If you did not compute a number, say so.
- Report the effect size and its uncertainty, not only a p-value. Say
  whether the effect is large enough to matter.
- A surprising result is more often a bug than a discovery. Look for the
  bug first, hard.
- List the boring explanations: confounding, selection, reverse causation,
  regression to the mean, measurement change, chance. Say which you can
  rule out and how.
- Correlation supports a causal claim only with a design that earns it.
- Do not explain a pattern until you have checked it is there.

## Figures

- One point per figure. The title can state it.
- Label axes with units. Show the spread or the raw points, not only the
  mean.
- Check the figure against the numbers. Plots get made from the wrong
  dataframe.

## Traps

- Dropping outliers or missing rows without saying how many and why.
- Averaging averages. Percentages of different bases.
- Reporting to more decimal places than the data supports.
- Finding what the user hoped for and stopping.

## Done when

Someone could rerun it from your description, row counts are accounted for
at each step, and the conclusion claims no more than the design allows.
