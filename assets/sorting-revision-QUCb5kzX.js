var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## What the library gives you

- \`Arrays.sort(int[])\` is dual-pivot quicksort: O(n log n) average, **O(n²)
  worst**, **not stable**.
- \`Arrays.sort(Object[])\`, \`list.sort\`, \`Collections.sort\` are TimSort:
  **O(n log n) guaranteed**, **stable**.
- Sorts in place, returns \`void\`. Sort \`a.clone()\` if you still need the
  original order.
- \`Arrays.sort(a, from, to)\` — \`to\` is exclusive.
- No comparator overload for \`int[]\`. To sort descending: box, or sort and
  reverse.
- Timing out on a provably n log n solution? Box it, or shuffle first, then
  sort.

## Comparators

\`\`\`java
Arrays.sort(people, Comparator
    .comparingInt((int[] p) -> p[0])
    .thenComparing(p -> p[1], Comparator.reverseOrder()));
\`\`\`

- **Never \`a - b\`** — it overflows. \`Integer.compare(a, b)\`.
- \`comparingInt\` over \`comparing\` when the key is a primitive: no boxing.
- \`thenComparing\` runs only on a tie. \`reversed()\` flips everything before it,
  so its position matters.
- A comparator that is not a real ordering gives
  \`Comparison method violates its general contract!\`.
- Type the lambda parameter — \`(int[] r) -> r[0]\` — whenever you chain onto it.
- Two stable sorts sort by two keys: secondary key first, then primary.

## The sorts you should be able to write

- **Merge sort** — split, sort both halves, merge. O(n log n) always, O(n)
  buffer, stable. On a tie in the merge take the **left** element; that is the
  whole stability argument.
- Allocate the merge buffer once, outside the recursion.
- **Quicksort, Lomuto** — pivot \`a[hi]\`, \`store\` marks the end of the "at most
  pivot" region, swap the pivot to \`store\` at the end. In place, O(n²) on sorted
  input with a fixed pivot.
- **Quickselect** — partition, then recurse into the side holding \`k\` only.
  O(n) average. The answer to Kth Largest.
- Base case is \`lo >= hi\`, never \`lo == hi\`.

## Beating n log n

- Comparison sorts cannot beat O(n log n). Stop comparing to go faster.
- **Counting sort** — O(n + k), needs a small known range. Sort Colors, Height
  Checker.
- **Bucket by frequency** — \`n + 1\` buckets indexed by count, read from the top.
  O(n), and the good answer to Top K Frequent Elements.
- **Radix** — stable counting sort per digit, least significant first. O(d(n+b)).
- **Cyclic sort** — value \`v\` goes to index \`v - 1\`, by swapping. O(n) time,
  O(1) space; then the first \`a[i] != i + 1\` is the missing or duplicate value.
  Guard with \`a[home] != a[i]\` or it hangs on duplicates.

## Costs

| Sort | Time | Space | Stable |
|---|---|---|---|
| \`Arrays.sort\` primitives | O(n log n) avg, O(n²) worst | O(log n) | no |
| \`Arrays.sort\` objects, \`list.sort\` | O(n log n) | O(n) | yes |
| Merge sort | O(n log n) | O(n) | yes |
| Quicksort | O(n log n) avg, O(n²) worst | O(log n) | no |
| Quickselect | O(n) avg | O(1) | n/a |
| Counting | O(n + k) | O(k) | yes |
| Cyclic | O(n) | O(1) | no |

## The bugs

- \`a - b\` in a comparator.
- Expecting \`Arrays.sort\` to return the array.
- \`Comparator.reverseOrder()\` on an \`int[]\` — no such overload.
- Sorting inside a loop instead of once before it.
- A new merge buffer per recursive call.
- Lomuto on all-equal values: O(n²). Three-way partition is the fix.
- \`new int[max + 1]\` for counting sort without checking the range.

## Worth remembering

- Sorting throws away the original indices. If the answer is positions, keep
  them alongside or use a map.
- Largest Number is the model: the algorithm is \`Arrays.sort\`, the work is the
  comparator \`(a, b) -> (b + a).compareTo(a + b)\`.
- Ask "does sorting make the loop unnecessary" before writing the second loop.
`;export{e as default};