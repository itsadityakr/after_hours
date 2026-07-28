var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## Spotting it

- Sorted input, or input you may sort, and a question about a pair or a triple.
- "In place", "O(1) extra space", "return the new length".
- Room deliberately left at the end of the first array — merge from the back.

![Filling forwards clobbers unread values; filling from the back cannot](diagrams/two-pointers-revision-merge-backwards.jpg)

## The skeleton

\`\`\`java
int lo = 0, hi = a.length - 1;
while (lo < hi) {
    int sum = a[lo] + a[hi];
    if (sum == target) return true;
    if (sum < target) lo++; else hi--;
}
\`\`\`

- \`lo < hi\`, not \`lo <= hi\`, unless the middle element is a candidate alone.
- Neither index ever moves backwards. That is the whole linearity argument.

## The argument you must be able to say

![Why the low index is dead once its best possible sum falls short](diagrams/two-pointers-revision-elimination.jpg)

- Sum too small: \`a[lo]\` paired with the biggest thing left is still too small,
  so \`lo\` is dead. Too big: mirror it on \`hi\`. Each step retires one index for a
  reason, so n steps and nothing skipped.
- **Container With Most Water**: area is \`width × min(h[lo], h[hi])\`. Move the
  shorter wall — moving the taller one shrinks the width and cannot raise the
  height, so every remaining pair on that side is worse than the one just
  measured.
- **Trapping Rain Water**: process whichever side is shorter. If \`h[lo] ≤ h[hi]\`
  a bar of at least \`h[hi]\` exists to the right, so \`leftMax\` binds and \`lo\` can
  be settled now.

## The four forms

| Form | Start | Move | Typical |
|---|---|---|---|
| Opposite ends | \`0\`, \`n - 1\` | inwards | sorted pair, palindrome, area |
| Fast and slow | both \`0\` | read every, write keepers | remove, dedupe, move zeroes |
| From the back | \`m-1\`, \`n-1\`, \`m+n-1\` | descending | Merge Sorted Array |
| Fix one, scan two | outer \`i\`, inner pair | outer once each | 3Sum, 4Sum |

## Fast and slow, and 3Sum

\`\`\`java
int write = 0;
for (int read = 0; read < a.length; read++)
    if (keep(a[read])) a[write++] = a[read];
\`\`\`

- \`write ≤ read\` always, so nothing unread is overwritten — that is why it is
  safe in place.
- Dedupe compares \`a[read]\` with \`a[write - 1]\` (last kept), not \`a[read - 1]\`
  (last seen). Move Zeroes swaps rather than copies, so no second pass.
- 3Sum: sort, fix \`a[i]\`, two-pointer \`i + 1\` to \`n - 1\`; \`if (a[i] > 0) break;\`.
- Skip the fixed value with \`if (i > 0 && a[i] == a[i - 1]) continue;\` — compare
  backwards, never forwards.
- On a hit, move **both** pointers, then skip duplicates on each. Test
  \`[0,0,0,0]\` and \`[]\` before submitting.

## Costs and bugs

| Thing | Time | Space |
|---|---|---|
| The scan, after an optional sort | O(n) or O(n log n) | O(1) |
| Fix one, scan the rest | O(n²) | O(1) beyond output |
| Brute force replaced | O(n²) / O(n³) | O(1) |

- Running it on unsorted input — the elimination argument needs the order.
- \`lo <= hi\` pairs an element with itself.
- Moving the taller wall in Container With Most Water.
- One of the three 3Sum duplicate skips missing, or only one pointer moved.
- Merging forwards, so a write clobbers an unread value.
- Skipping punctuation without re-checking \`lo < hi\` — walks off the end.
- Sums of three or four \`int\` values overflowing; use \`long\`. No guard for \`[]\`,
  where \`a.length - 1\` is \`-1\`.

## The API

| Want | Write |
|---|---|
| Sort | \`Arrays.sort(a)\` |
| Swap | \`int t = a[i]; a[i] = a[j]; a[j] = t;\` |
| Min / max / closeness | \`Math.min\`, \`Math.max\`, \`Math.abs(sum - target)\` |
| Character | \`s.charAt(i)\`, \`s.length()\` |
| Alphanumeric, fold case | \`Character.isLetterOrDigit(c)\`, \`Character.toLowerCase(c)\` |
| Store a triple | \`List.of(x, y, z)\` — immutable |
| Keep the prefix | \`Arrays.copyOf(a, write)\` |

## Worth remembering

- Sorting destroys the original indices. If the answer is indices, use a hash map
  — that is why plain Two Sum is not this pattern. Two indices moving the same
  way with a count between them is a
  [sliding window](#/dsa/sliding-window/notes), not this.
- Before writing the loop, finish "I can move this pointer because…". If you
  cannot, you have guessed.
`;export{e as default};