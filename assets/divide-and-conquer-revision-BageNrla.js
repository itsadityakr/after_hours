var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The shape

\`\`\`java
int solve(int lo, int hi) {
    if (lo >= hi) return base;
    int mid = lo + (hi - lo) / 2;
    return merge(solve(lo, mid), solve(mid + 1, hi));
}
\`\`\`

- Base case \`lo >= hi\`, not \`lo == hi\`, whenever an empty range can happen.
- \`lo + (hi - lo) / 2\`, never \`(lo + hi) / 2\` — the sum overflows.
- \`mid\` and \`mid + 1\`. Writing \`solve(mid, hi)\` never terminates on a range of
  two.
- The two calls must be independent. If they are not, it is dynamic programming.
- **The combine step is the whole problem.** Everything else is boilerplate.

## The recurrences, informally

| Recurrence | Cost | Why | Example |
|---|---|---|---|
| T(n) = 2T(n/2) + O(n) | O(n log n) | every level does n work, log n levels | merge sort |
| T(n) = 2T(n/2) + O(1) | O(n) | the bottom level has n leaves and dominates | tree height |
| T(n) = T(n/2) + O(1) | O(log n) | one chain of halvings, no branching | binary search |
| T(n) = 2T(n/2) + O(n log n) | O(n log² n) | the top dominates by a log factor | some sweeps |

The rule of thumb: compare the top level against the bottom. Equal means
multiply by the number of levels; otherwise the larger one is the answer.

## Counting in the merge

- Inversion: a pair \`i < j\` with \`a[i] > a[j]\`. Brute force O(n²), merge counting
  O(n log n).
- When the right element wins the comparison, it beats \`a[i..mid]\` too, because
  the left half is sorted: \`inversions += mid - i + 1\`.
- Take from the right only on a strict \`<\`. Equal values are not inversions.
- Reverse Pairs (\`a[i] > 2*a[j]\`) needs a **separate** two-pointer pass before
  the merge, and \`2L * a[j]\` to avoid overflow.
- Count of Smaller Numbers After Self: sort an array of **indices**, keep counts
  in a separate array keyed by original position.
- The counter is \`long\`. Up to n(n-1)/2 inversions, which passes 2³¹ near
  n = 65 000.

## The worked examples

![Pow of x to the n built by squaring, five levels for an exponent of ten](diagrams/divide-and-conquer-revision-halving.jpg)

- **Merge sort** — the model. One buffer, allocated once outside the recursion.
- **Pow(x, n)** — \`power(x, n/2)\` squared, times x when n is odd. O(log n).
  Widen to \`long\` before negating, or \`Integer.MIN_VALUE\` overflows.
- **Majority element** — the majority of the whole must be the majority of at
  least one half. O(n log n); Boyer–Moore does it in O(n).
- **Maximum subarray** — left, right, or crossing the middle. O(n log n), and
  Kadane does it in O(n), so this version is an exercise, not an answer.
- **Search a 2D Matrix II** — start top-right; bigger than target drops a
  column, smaller drops a row. O(m + n).
- **Different Ways to Add Parentheses** — split at every operator, cross-product
  the two result lists. Base case is "no operator", not "length 1". Memoise on
  the substring.

## Costs

- Time is the recurrence. Space is the recursion depth, O(log n) for a balanced
  split, plus any buffer.
- Java's stack overflows around 10 000 frames. Balanced splits never get close;
  a split at 1 and n-1 will.
- Merge sort and quicksort are both O(n log n); quicksort is usually faster
  because it copies nothing. Cost classes do not capture that.

## The bugs

![A range of two elements, and the recursive call that never gets smaller](diagrams/divide-and-conquer-revision-mid-plus-one.jpg)

- \`(lo + hi) / 2\` overflow.
- \`solve(mid, hi)\` instead of \`solve(mid + 1, hi)\` — infinite recursion.
- \`lo == hi\` as the base case when an empty range is reachable.
- \`<=\` when counting inversions, which counts equal values.
- \`int\` arithmetic in Reverse Pairs, and an \`int\` inversion counter.
- A new merge buffer per call.
- Assuming the answer is in one half without proving it. Maximum subarray is the
  counterexample.
- Not memoising overlapping subproblems.

## Worth remembering

- Ask: *given the answer for the left half and the answer for the right half,
  could I produce the answer for the whole?* If yes, this technique applies.
- If no, work out what extra information has to be carried up. That is what the
  hard problems in this topic are actually about.
- Binary search belongs to this family — it is the case where one half is thrown
  away without being looked at.
`;export{e as default};