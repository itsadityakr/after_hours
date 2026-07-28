var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## What it is

- A binary tree over ranges. Node 1 is the whole array; children of \`i\` are \`2i\`
  and \`2i + 1\`; leaves are single elements. Every node stores the combined answer
  for its range, and any query range is the union of O(log n) nodes.
- Ranges are not stored — \`lo\` and \`hi\` are parameters on the way down. Call the
  root as \`query(1, 0, n - 1, l, r)\`.
- **Allocate \`4 * n\`.** \`2n\` is right only when n is a power of two; at n = 6 the
  highest index used is 13.

## The three cases

![The three query cases coloured onto one range](diagrams/segment-tree-revision-three-cases.jpg)

\`\`\`text
1. no overlap      hi < l  or  r < lo       -> return the identity
2. total overlap   l <= lo and hi <= r      -> return t[node]
3. partial         otherwise                -> combine both children
\`\`\`

\`\`\`java
private long query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;                       // identity for sum
    if (l <= lo && hi <= r) return t[node];
    int mid = lo + (hi - lo) / 2;
    return query(2 * node, lo, mid, l, r)
         + query(2 * node + 1, mid + 1, hi, l, r);
}
\`\`\`

- Case 2 is the pruning. Drop it and the query still answers correctly, in O(n).
- At most two nodes per level are partial, which is where O(log n) comes from.
- Build and point update are the same descent with the parent recomputed on the
  way out: \`t[node] = t[2*node] + t[2*node+1]\`.

## Combine and identity

| Question | combine | identity |
|---|---|---|
| Sum | \`a + b\` | \`0\` |
| Minimum | \`Math.min(a, b)\` | \`Integer.MAX_VALUE\` |
| Maximum | \`Math.max(a, b)\` | \`Integer.MIN_VALUE\`, or 0 if non-negative |
| gcd | \`gcd(a, b)\` | \`0\` |
| Product | \`a * b\` | \`1\` |
| Bitwise or | <code>a &#124; b</code> | \`0\` |
| Bitwise and | \`a & b\` | \`-1\` |

Must be associative; need not be commutative, so keep the left child on the left.
A wrong identity fails quietly and only on some inputs.

## Lazy propagation

\`\`\`java
private void apply(int node, int lo, int hi, long v) {
    t[node] += v * (hi - lo + 1);
    z[node] += v;                 // += , not = : debts accumulate
}
private void push(int node, int lo, int hi) {
    if (z[node] == 0) return;
    int mid = lo + (hi - lo) / 2;
    apply(2 * node, lo, mid, z[node]);
    apply(2 * node + 1, mid + 1, hi, z[node]);
    z[node] = 0;
}
\`\`\`

- \`z[node]\` means: this node's total is correct, its children have not been told.
- **Push down before you descend** — in \`query\` as well as in \`update\`, because
  a lazy tree has no read-only operation.
- Total overlap applies and stops. Partial overlap pushes, recurses, recomputes.
- Range assign, flip and add compose differently. Write down how two pending
  operations combine before you write the code.

## Which structure

![Space per element for Fenwick, segment tree and sparse table](diagrams/segment-tree-revision-space-cost.jpg)

| | Fenwick | Segment tree | Sparse table |
|---|---|---|---|
| Operations | Invertible only | Any associative | Idempotent only |
| Query | O(log n) | O(log n) | O(1) |
| Point update | O(log n) | O(log n) | Rebuild |
| Range update | Difference trick | O(log n) lazy | No |
| Space | n | 4n | n log n |

Static array? Prefix sum, or a sparse table for min and max. Changing, and it is
a sum? Fenwick — ten lines, small constant. Minimum, range update, or a combine
you invented? Segment tree.

## The bugs

- Array sized \`2 * n\`, or a wrong identity for the operation.
- Parent not recomputed after the recursion returns.
- No \`push\` inside \`query\` — updates look right, some queries return stale data.
- \`z[node] = v\` instead of \`+=\`.
- Nodes are 1-based, positions are 0-based. Do not mix them in one expression.
- \`int\` tree on a large sum — the root holds the whole array's total. Use \`long\`.
- Querying an empty range (\`l > r\`). Guard it at the caller.

## Worth remembering

- The transferable trick is building the tree over the **value** axis instead of
  the position axis — that is what turns Longest Increasing Subsequence II from
  O(n²) into O(n log n).
- Coordinates too large to index? Compress them first, or build nodes on demand.
`;export{e as default};