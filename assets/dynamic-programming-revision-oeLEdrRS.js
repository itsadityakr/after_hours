var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## What it is

- A recursion whose subproblems repeat, with each answer written down once.
- Needs both: overlapping subproblems, and a best-of-the-whole built from
  best-of-the-parts.
- Cost is always **number of states × work per state**. Price the design before
  you write it.

## The route, every time

1. Write the brute-force recursion. Do not skip this.
2. Add a cache — that is memoisation, and it is already the finished algorithm.
3. If you want the constant factor or the space, turn it into a table filled
   smallest-first.
4. Roll the table down to the rows you actually read.

Under pressure, stop at step 2. Memoised recursion visits only reachable states,
puts base cases where they belong, and is far harder to get subtly wrong.

## Naming the state

- Ask: what do I need to know to decide everything that is left?
- Whatever varies between recursive calls is the state. What is constant is data.
- Finish the sentence "\`dp[i]\` is …" out loud. If you cannot, the recurrence will
  not come either.
- Too many dimensions to fit the limits means you are carrying something that
  does not matter.

## The families

| Family | State | Recurrence in one line |
|---|---|---|
| Linear | \`i\` | \`dp[i]\` from \`dp[i-1]\`, \`dp[i-2]\` |
| Knapsack | \`i, capacity\` | take it, or leave it |
| Two sequences | \`i, j\` | match takes the diagonal, else the better neighbour |
| Interval | \`lo, hi\` | split at every \`k\` inside; loop over length |
| Subsequence (LIS) | \`i\` | longest run ending at \`i\`, or the patience \`tails\` array |
| Bitmask | \`mask, i\` | subsets of at most 20 things |

## The knapsack loops

\`\`\`java
// 0/1: each item once — capacity DESCENDING
for (int i = 0; i < n; i++)
    for (int c = cap; c >= w[i]; c--)
        dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);

// unbounded / coin change: reuse allowed — capacity ASCENDING
for (int c = w[i]; c <= cap; c++) dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);
\`\`\`

- Descending reads the previous row, so the item is used at most once. Ascending
  reads this row, so it can be reused.
- **Coins outside, amount inside** counts combinations — 1+2 and 2+1 are one.
- **Amount outside, coins inside** counts permutations — they are two.
- Fewest-coins does not care which order; the counting versions do.

## Costs

| Shape | Time | Space |
|---|---|---|
| Linear | O(n) | O(1) rolled |
| Coin change, knapsack | O(n · amount) | O(amount) |
| LCS, edit distance | O(n · m) | O(min(n, m)) rolled |
| LIS quadratic / patience | O(n²) / O(n log n) | O(n) |
| Interval | O(n³) | O(n²) |
| Bitmask over subsets | O(2ⁿ · n²) | O(2ⁿ · n) |

Read the limits backwards: n ≤ 20 is a bitmask, n ≤ 500 with two strings is a
grid, n ≤ 10⁵ means the state is one number.

## Getting the answer back

- Walk the finished table backwards, asking which predecessor could have produced
  each cell. No extra memory.
- Or keep a \`from[]\` array of the winning choice and follow it from the end.
  Easier when the recurrence has several branches.
- Reconstruction is a second pass. Never mix it into the filling. And do not roll
  the table away if you will need it.

## The bugs

- Writing the table before the recurrence.
- A state that does not determine the rest — two histories, one cell, different
  answers.
- \`dp[0]\` wrong. For counting it is 1: one way to make nothing.
- A zero-filled cache when 0 is a real answer. \`Arrays.fill(dp, -1)\`.
- The 0/1 inner loop going forwards, so an item is used twice.
- Coin and amount loops swapped, so combinations become permutations.
- Off-by-one between string and table: with \`n + 1\` rows, row \`i\` is
  \`a.charAt(i - 1)\`.
- \`Integer.MAX_VALUE\` as "impossible", then added to. Use \`amount + 1\`.
- \`int\` overflow when counting ways. Use \`long\`, or the given modulus.
`;export{e as default};