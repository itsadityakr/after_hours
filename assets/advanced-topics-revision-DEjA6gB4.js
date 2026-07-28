var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from. This one is a drawer rather than a pattern — look up the algorithm
you need and ignore the rest.

## Union-find

\`\`\`java
int find(int x) { if (p[x] != x) p[x] = find(p[x]); return p[x]; }

boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;                      // already together: a cycle
    if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
    p[rb] = ra;
    if (rank[ra] == rank[rb]) rank[ra]++;
    return true;
}
\`\`\`

- Path compression **and** union by rank: O(α(n)) per operation, effectively
  constant. Either one alone is O(log n).
- \`union\` returning \`false\` is the cycle test — free, and the core of Kruskal.
- Connectivity only. No paths, no distances, no ordering — use a traversal for
  those.
- Elements that are strings: number them with a \`Map<String, Integer>\` first.

## KMP

- \`fail[i]\` = longest proper prefix of \`p[0..i]\` that is also a suffix of it.
- \`fail("ababaca") = [0,0,1,2,3,0,1]\`. \`fail[0]\` is always 0.
- On a mismatch: \`while (len > 0 && mismatch) len = fail[len - 1];\` — a \`while\`,
  never an \`if\`. The text index never moves backwards, so search is O(n + m).
- \`n - fail[n-1]\` is the smallest period. If it divides \`n\`, the string is a
  repeated block — that is Repeated Substring Pattern in three lines.
- Same array answers Longest Happy Prefix and, after a reversal, Shortest
  Palindrome.

## Rolling hash

- Treat the string as a base-\`b\` number mod a prime near 10⁹. Slide: drop the
  left character times \`b^(len-1)\`, multiply by \`b\`, add the right one.
- \`long\` arithmetic always. An \`int\` hash overflows and collisions stop being
  rare.
- **Always verify a match** with \`s.regionMatches(i, s, j, len)\`. A trusted hash
  is a guess.
- Binary search the length: a repeat of length L implies one of length L − 1, so
  the property is monotonic. O(n log n) for Longest Duplicate Substring.

## Topological order (Kahn)

- Count indegrees, queue everything at 0, pop and decrement, enqueue on hitting
  0.
- \`order.size() < n\` means a cycle. That is the whole cycle test.
- Course Schedule, Course Schedule II, Alien Dictionary. Building the edges is
  usually harder than ordering them.

## Where the rest of the list actually lives

| Problem | Home |
|---|---|
| Find Pivot Index, Running Sum, Continuous Subarray Sum | prefix sum |
| Power of Two, Number of 1 Bits, Bitwise ORs of Subarrays | bit manipulation |
| Contains Duplicate II | hash tables |
| Sqrt(x), Median of Two Sorted Arrays | binary search |
| Range Sum Query - Mutable | Fenwick tree |
| My Calendar I | ordered set / sweep line |
| Subarrays with K Different Integers, Find All Anagrams | sliding window |
| Count of Smaller Numbers After Self, Count of Range Sum | divide and conquer |
| The Skyline Problem | sweep line with a heap |
| Sliding Window Maximum | monotonic deque |

## Costs

| Algorithm | Cost |
|---|---|
| Union-find, both optimisations | O(α(n)) per op, O(n) space |
| KMP | O(m) build, O(n) search, O(m) space |
| Rolling hash | O(1) per window after O(n) |
| Rolling hash + binary search | O(n log n) |
| Kahn's algorithm | O(V + E) |
| Sweep line with a heap | O(n log n) |

## The bugs

- \`parent[b] = a\` instead of \`parent[find(b)] = find(a)\`.
- Skipping path compression — it degrades to a linked list on the large case.
- The failure-function fallback written as an \`if\`.
- \`int\` arithmetic in a hash, or trusting a hash match without verifying.
- Forgetting \`(x % M + M) % M\`. Java's \`%\` keeps the sign of the left operand.
- Binary searching a property that is not monotonic. Say the claim out loud
  first.
- Reaching into this drawer before trying a window, a map or a sort.
`;export{e as default};