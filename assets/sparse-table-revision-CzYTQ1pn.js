var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The condition

![The operations a sparse table may and may not be built over](diagrams/sparse-table-revision-what-it-answers.jpg)

- Data **never changes**, and the operation is **idempotent**: \`min(a, a) == a\`.
- Idempotent means overlap is harmless, which is what lets two power-of-two
  blocks cover any range.
- Yes: min, max, gcd, \`&\`, OR. No: sum, product, XOR — \`a ^ a\` is 0.
- Sums over static data are a prefix sum: O(n) build, one subtraction per query.

## The table

- \`table[k][i]\` = the answer for the block of length 2^k starting at \`i\`.
- \`table[0]\` is the array. Levels run to \`floor(log2 n)\`, so O(n log n) entries.
- Each block is two blocks of half the length, side by side, from the level
  below. The build does not overlap; only the query does.

\`\`\`java
int levels = 32 - Integer.numberOfLeadingZeros(n);
int[][] t = new int[levels][n];
System.arraycopy(a, 0, t[0], 0, n);
for (int k = 1; k < levels; k++)
    for (int i = 0; i + (1 << k) <= n; i++)
        t[k][i] = Math.min(t[k - 1][i], t[k - 1][i + (1 << (k - 1))]);
\`\`\`

## The query

![The two query blocks anchored at l and at r, overlapping in the middle](diagrams/sparse-table-revision-the-two-blocks.jpg)

\`\`\`java
int len = r - l + 1;
int k = 31 - Integer.numberOfLeadingZeros(len);   // floor(log2 len)
return Math.min(t[k][l], t[k][r - (1 << k) + 1]);
\`\`\`

- One block starts at \`l\`, the other **ends** at \`r\` — hence \`r - 2^k + 1\`.
- \`2 × 2^k > len\`, so two blocks of that length always cover the range.
- Never \`Math.log(len) / Math.log(2)\`. It returns 2.9999 for 8 and the query
  reads the wrong level.

## Against the alternatives

| | Build | Query | Update | Space |
|---|---|---|---|---|
| Prefix sum | O(n) | O(1) | rebuild | O(n) |
| Sparse table | O(n log n) | O(1) | none | O(n log n) |
| Fenwick tree | O(n log n) | O(log n) | O(log n) | O(n) |
| Segment tree | O(n) | O(log n) | O(log n) | O(4n) |

Decide in this order: anything changes → Fenwick or segment tree. A sum →
prefix sum. Static min/max/gcd/AND/OR → sparse table. Anything else → segment
tree.

## The bugs

- Using it for sums. Correct on exact powers of two, wrong everywhere else.
- \`r - (1 << k)\` instead of \`r - (1 << k) + 1\`.
- Levels sized one short (top level missing) or one long (zeroes read as the
  minimum).
- \`i + (1 << k) < n\` rather than \`<=\` — drops the block ending at the last index.
- \`i\` as the outer loop. Level \`k\` reads level \`k - 1\`, so \`k\` goes outside.
- Mixing inclusive and half-open ranges. Pick one and comment it.
- \`31 - numberOfLeadingZeros(0)\` is −1 and throws. Guard \`l > r\`.

## The API

| Want | Write |
|---|---|
| 2^k | \`1 << k\` |
| floor(log2 x), x ≥ 1 | \`31 - Integer.numberOfLeadingZeros(x)\` |
| Levels for n | \`32 - Integer.numberOfLeadingZeros(n)\` |
| Largest power of two ≤ x | \`Integer.highestOneBit(x)\` |
| Level 0 | \`System.arraycopy(a, 0, t[0], 0, n)\` |
| gcd | write Euclid — there is no \`Math.gcd\` for \`int\` |

## Worth remembering

- The query cost does not depend on the range length. Two reads and a compare,
  every time, which is the fastest range query available.
- There is no update. Not slow — absent. That is the whole trade.
- Check a new implementation against a brute-force scan over all O(n²) ranges on
  a seven-element array. It catches every off-by-one in a second.
`;export{e as default};