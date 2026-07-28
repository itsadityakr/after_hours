var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The one decision

- At every index ask only: what is the best run **ending exactly here**? The
  answer to the whole problem is the largest of those, because every run ends
  somewhere.
- Two candidates and no others: extend the best run ending at \`i - 1\`, or start
  again at \`a[i]\`. Extending wins exactly when \`here > 0\`, so keep the run
  unless it has gone negative — a negative run is a liability.

\`\`\`java
int best = a[0], here = a[0];
for (int i = 1; i < a.length; i++) {
    here = Math.max(a[i], here + a[i]);   // extend, or start again
    best = Math.max(best, here);
}
return best;
\`\`\`

- Both start at \`a[0]\`; the loop starts at \`i = 1\`. Starting at \`i = 0\` counts
  the first element twice.
- \`here\` before \`best\`. \`here\` goes down often; \`best\` never does.

## Never best = 0

- 0 is the answer only if the empty subarray is allowed, and it usually is not.
- \`[-3, -1, -2]\` should return \`-1\`, not 0.
- Start at \`a[0]\` or \`Integer.MIN_VALUE\`. If empty really is permitted, write
  \`Math.max(kadane(a), 0)\` at the end where it can be seen.

## Recovering the indices

\`\`\`java
if (here < 0) { here = a[i]; start = i; }   // starting again — record the start
else here += a[i];
if (here > best) { best = here; from = start; to = i; }
\`\`\`

- \`>\` not \`>=\`, or a tie is overwritten by the later, equal subarray.
- Reset when \`here < 0\`, not when \`here + a[i] < 0\`. The test is on the run
  before the new element joins it.

## Maximum product

- A large negative is not a liability under \`×\` — one more negative and it is
  the answer. So carry the largest **and** the smallest product ending here.
- A negative \`x\` swaps their roles, so swap before multiplying:

\`\`\`java
if (x < 0) { int t = hi; hi = lo; lo = t; }
hi = Math.max(x, hi * x);
lo = Math.min(x, lo * x);
best = Math.max(best, hi);
\`\`\`

- A zero needs no special case: it drives both to 0, and \`Math.max(x, hi * x)\`
  restarts at the next element.

## Circular

- Two cases only: the run does not wrap (plain Kadane), or it does, in which
  case the elements it leaves out form one ordinary run in the middle.
- Answer is \`max(maxSubarray, total - minSubarray)\` — run both Kadanes in one
  loop.
- **All negative**: \`total - minSubarray\` is 0, the empty subarray again. Guard
  with \`if (maxBest < 0) return maxBest;\`.

## The smallest DP there is

- \`dp[i] = max(a[i], dp[i-1] + a[i])\`, base \`dp[0] = a[0]\`, answer \`max\` over
  the table.
- The table is never allocated because \`dp[i]\` needs only \`dp[i-1]\` — one \`int\`
  is the whole thing rolled up. That rolling is standard in
  [dynamic programming](#/dsa/dynamic-programming/notes); here it is available
  from the first line.

## The relatives

| Problem | Carry |
|---|---|
| [Maximum Subarray](problem:maximum-subarray) | Best sum ending here |
| [Best Time to Buy and Sell Stock](problem:best-time-to-buy-and-sell-stock) | Kadane over the daily differences, \`best\` from 0 |
| [Maximum Product Subarray](problem:maximum-product-subarray) | Largest and smallest product ending here |
| [Maximum Sum Circular Subarray](problem:maximum-sum-circular-subarray) | Largest and smallest sum; \`total - min\` |
| [Maximum Absolute Sum of Any Subarray](problem:maximum-absolute-sum-of-any-subarray) | \`max(maxBest, -minBest)\` |
| [Longest Continuous Increasing Subsequence](problem:longest-continuous-increasing-subsequence) | A length, restarted when \`a[i] <= a[i-1]\` |
| [Longest Turbulent Subarray](problem:longest-turbulent-subarray) | Two lengths, up-run and down-run |

## The bugs

- \`best = 0\` on an all-negative array, or \`a[0]\` on an empty one.
- Loop from \`i = 0\` after seeding with \`a[0]\` — the first element counts twice.
- \`best\` updated before \`here\`.
- Resetting on \`here + a[i] < 0\` instead of \`here < 0\`.
- Product version: swap missing, or applied after the multiplication.
- Circular version: all-negative guard missing.
- \`int\` sums and products overflowing.

## Costs

| | Time | Space |
|---|---|---|
| Any variant on this page | O(n), one pass | O(1) |
| Brute force, for comparison | O(n²) | O(1) |
| Divide and conquer | O(n log n) | O(log n) |

## Worth remembering

- Name a quantity that "ends here", say how it comes from the same quantity at
  \`i - 1\`, keep a separate best. If one value cannot carry the recurrence,
  carry two.
- Not the same as a [sliding window](#/dsa/sliding-window/notes): a window
  decides which elements are in the set; Kadane only decides whether to keep or
  discard everything so far. The habit behind both is in
  [arrays](#/dsa/arrays/notes).
`;export{e as default};