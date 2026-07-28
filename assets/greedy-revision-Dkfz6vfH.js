var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The shape

\`\`\`java
Arrays.sort(items, byBestFirst);
for (T item : items) if (fits(item)) take(item);
\`\`\`

- One rule, applied once per step, never revisited. The code is trivial; the
  measure you sort by is the design.
- The whole risk is that a wrong rule fails silently — right speed, wrong answer.

## Knowing it is safe

- **Greedy choice property**: some optimal answer contains the choice your rule
  makes first.
- **Optimal substructure**: what is left after that choice is the same problem,
  smaller.
- **Exchange argument**: take any optimal answer, find the first place it differs
  from yours, swap its choice for yours without making it worse, repeat. Five
  sentences, and it is what the interviewer wants to hear.
- **Counter-example habit**: before writing the loop, spend a minute trying to
  break the rule on three or four items. Wrong greedy rules die to tiny inputs.
- If you can neither prove it nor break it, suspect dynamic programming.

## Greedy against DP

- Greedy commits to one choice per step. DP keeps all of them.
- Coin change \`{1, 3, 4}\`, amount 6: greedy takes 4+1+1 = three coins, best is
  3+3 = two.
- Coin change \`{3, 4}\`, amount 6: greedy takes 4, gets stuck, reports impossible.
  Two threes exist.
- Same problem, different coin set — the rule is what fails, not the code.

## The rules worth having by heart

| Problem | Rule |
|---|---|
| Interval scheduling | sort by **end**, take when start is at or after the last end |
| Assign cookies | sort both, give each cookie to the hungriest child it satisfies |
| Stock II, unlimited trades | add every upward step |
| Jump game | carry \`furthest\`; \`i > furthest\` means stranded |
| Jump game II | levels — when \`i == levelEnd\`, jumps++ and \`levelEnd = furthest\` |
| Gas station | tank goes negative, so restart at \`i + 1\`; feasible if total ≥ 0 |
| Connect sticks, Huffman | heap, join the two smallest, put the result back |
| Task scheduler | \`max(n, (most - 1) * (gap + 1) + tied)\` |

## Rules that look right and are not

- Intervals by **earliest start**: \`[0,10] [1,2] [3,4]\` keeps one, best is two.
- Intervals by **shortest duration**: \`[0,5] [4,6] [6,10]\` keeps one, best is two.
- Largest coin first on an awkward denomination set.

## Costs

| Form | Time | Space |
|---|---|---|
| Sort then scan | O(n log n) | O(1) beyond the sort |
| Running-maximum scan | O(n) | O(1) |
| Count then formula | O(n + k) | O(k) |
| Repeated two-smallest | O(n log n) | O(n) heap |

## The bugs

- Trusting the rule because the three given examples pass.
- Sorting by the wrong key — start time and duration both feel reasonable.
- \`(x, y) -> x[1] - y[1]\` overflows. \`Integer.compare\`.
- Interval boundary: is \`[1,2]\` against \`[2,3]\` an overlap? It changes \`>=\` to \`>\`.
- Gas station without the total-gas check finds a start that does not exist.
- Jump Game II looping to \`a.length\` instead of \`a.length - 1\` — one jump too many.
- Empty or single-element input into a heap loop.

## The API

| Want | Write |
|---|---|
| Sort rows by a column | \`Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]))\` |
| Second key, descending | \`.thenComparing(f, Comparator.reverseOrder())\` |
| Min-heap / max-heap | \`new PriorityQueue<>()\` / \`new PriorityQueue<>(Comparator.reverseOrder())\` |
| Smallest, removed | \`heap.poll()\` — \`peek\` only looks |
| Letter counts | \`int[] count = new int[26]; count[c - 'A']++\` |
| \`int[]\` descending | box to \`Integer[]\`, or sort ascending and walk backwards |
`;export{e as default};