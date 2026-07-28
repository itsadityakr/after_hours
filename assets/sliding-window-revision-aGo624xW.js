var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The two shapes

![Longest measures after the shrink loop, shortest measures before each shrink](diagrams/sliding-window-revision-where-you-measure.jpg)

\`\`\`java
// fixed size k — build the first window, then one in, one out
int sum = 0;
for (int i = 0; i < k; i++) sum += a[i];
for (int hi = k; hi < a.length; hi++) {
    sum += a[hi] - a[hi - k];
    best = Math.max(best, sum);
}

// variable size — the right edge always moves, the left only under pressure
int lo = 0;
for (int hi = 0; hi < a.length; hi++) {
    add(a[hi]);
    while (invalid()) remove(a[lo++]);
    best = Math.max(best, hi - lo + 1);
}
\`\`\`

- Both edges inclusive. Length is \`hi - lo + 1\`. The element leaving a fixed
  window is \`a[hi - k]\`.
- **Longest**: shrink until valid, then measure. **Shortest**: measure while
  valid, then shrink.
- \`while\` to shrink, never \`if\` — one step right can need several steps left.

## Why it is O(n)

- \`lo\` only increases and never exceeds \`n\`, so the inner \`while\` runs at most
  \`n\` times in total, not per step. Each index enters once and leaves at most
  once: 2n constant-time events.
- Reset \`lo\` to the start and the argument, and the running time, both collapse.

## Counting: exactly k is two passes

![Every start from lo to hi gives one valid subarray ending at hi](diagrams/sliding-window-revision-at-most-count.jpg)

- A window can only test conditions that survive shrinking. "At most k" does;
  "exactly k" does not.
- \`exactly(k) = atMost(k) - atMost(k-1)\`.
- Inside an at-most window, \`total += hi - lo + 1\` — every start from \`lo\` to
  \`hi\` gives a valid subarray ending at \`hi\`, each counted once.
- Count subarrays in a \`long\`; n(n+1)/2 overflows an \`int\` near n = 65,000.

## Character windows

- Anagrams — a fixed multiset: \`int[26] need\` and \`int[26] have\`, compared with
  \`Arrays.equals\`. Add \`s.charAt(hi)\`, drop \`s.charAt(hi - k)\`.
- No repeats: \`Map<Character,Integer> lastSeen\`, then
  \`if (seen != null && seen >= lo) lo = seen + 1\`. The \`seen >= lo\` guard stops
  \`lo\` moving backwards.
- Longest Repeating Character Replacement: valid when
  \`hi - lo + 1 - mostCommon <= k\`, and \`mostCommon\` is a high-water mark never
  lowered — stale is safe.
- Minimum Window Substring: two count tables plus a tally of satisfied
  characters, so the validity test stays O(1).

## When it does not work

- **Negatives with a variable window.** Dropping a negative makes the sum
  larger, so shrinking is no longer guaranteed to help. Use
  [prefix sum](#/dsa/prefix-sum/notes) with a map instead. A fixed-size window
  is fine with negatives.
- **Maximum of every window.** A sum can be undone by subtraction, a maximum
  cannot. Monotonic [deque](#/dsa/deque/notes) of indices, decreasing.
- **Products.** That is [Kadane's algorithm](#/dsa/kadanes-algorithm/notes).
- **"Subsequence".** Not contiguous, so not a window.

## Costs

| Form | Time | Space |
|---|---|---|
| Numeric summary, fixed or variable | O(n) | O(1) |
| Lowercase-letter counts | O(26n) | O(26) |
| \`HashMap\` summary, exactly-k | O(n) expected | O(distinct) |
| Monotonic deque maximum | O(n) | O(k) |

## The bugs

- \`hi - lo\` instead of \`hi - lo + 1\`.
- Measuring on the wrong side of the shrink loop.
- \`lo++\` without the matching \`sum -=\` or \`count[c]--\`.
- Zero-valued keys left in the map — \`map.size()\` still counts them, so prune
  with \`if (map.merge(k, -1, Integer::sum) == 0) map.remove(k)\`.
- Recording fixed-window answers before \`hi\` reaches \`k - 1\`.
- Any line that sends \`lo\` backwards.

## The API

| Want | Write |
|---|---|
| Character at an index | \`s.charAt(i)\`, \`s.length()\` with brackets |
| The window as text | \`s.substring(lo, hi + 1)\` — end exclusive |
| Letter to a slot | \`c - 'a'\`, or \`c - 'A'\` |
| Compare count tables | \`Arrays.equals(need, have)\` |
| Add to a map count | \`map.merge(k, 1, Integer::sum)\` |
| Read a missing count as 0 | \`map.getOrDefault(k, 0)\` |
| Deque, and its ends | \`new ArrayDeque<>()\`; \`addLast\`, \`pollLast\`, \`pollFirst\`, \`peekFirst\` |

## Worth remembering

- Ask first: what makes a window valid, and does removing an element from a
  valid window keep it valid? Yes means a window works. No means at-most, a
  prefix sum, or something else.
`;export{e as default};