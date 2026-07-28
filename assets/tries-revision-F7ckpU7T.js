var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The structure

- A tree where the path spells the word. No node stores a string; the edges do.
- \`next[26]\` for lowercase-only, \`HashMap<Character, Node>\` for anything wider.
  Array is faster; map is smaller when the tree is sparse.
- \`end\` marks where a word finishes. Without it every prefix reads as a word.
- Shared prefixes are stored once — that is the space win, and it only arrives
  when the words actually share prefixes.

## The shape

![Search reads the end flag and startsWith never does](diagrams/tries-revision-end-flag.jpg)

\`\`\`java
class Node { Node[] next = new Node[26]; boolean end; }

Node cur = root;
for (int i = 0; i < word.length(); i++) {
    int c = word.charAt(i) - 'a';
    if (cur.next[c] == null) cur.next[c] = new Node();
    cur = cur.next[c];
}
cur.end = true;
\`\`\`

- Search is the same walk: \`false\` on a missing step, \`cur.end\` at the finish.
- \`startsWith\` is the same walk again, returning \`true\` at the finish. Never
  reads \`end\`. That one line is the whole difference.

## When it beats a hash set

- Only when the question is about **prefixes**. For exact membership a
  \`HashSet<String>\` is smaller and just as fast.
- Prefix questions: autocomplete, shortest matching prefix, count under a
  prefix, "is any suffix of the stream a word" (build over reversed words).
- Early failure: a trie says after three characters that no word goes this way,
  so a board or backtracking search abandons the whole subtree. That is what
  makes Word Search II run.

## The variants

| Variant | Change | Where |
|---|---|---|
| Wildcard \`.\` | recurse over all 26 children at a dot | Design Add and Search Words |
| Value per key | store an \`int\` on the node | Map Sum Pairs |
| Suffix trie | insert every word reversed | Short Encoding, Stream of Characters |
| Board pruning | carry the trie node with the position | Word Search II |
| Binary trie | 2 children, bits of an int from bit 30 down | Maximum XOR |

## The binary trie

- Alphabet is \`{0, 1}\`, path length is fixed at 31 bits, top bit first.
- To maximise \`x ^ stored\`: at each bit take the child with the **opposite** bit
  if it exists, and set that bit of the answer.
- Greedy is correct because 2^b beats every lower bit combined.
- Insert one value before the first query, or \`cur\` walks into \`null\`.
- Use \`(x >>> b) & 1\`, not \`>>\` — the value is bits, not a number.

## Costs

![A trie query costs the length of the word, not the size of the dictionary](diagrams/tries-revision-cost-is-the-word.jpg)

| Operation | Cost |
|---|---|
| insert / search / startsWith | O(L), L the word length |
| all words under a prefix | O(L + subtree size) |
| wildcard with d dots | up to O(26^d × L) |
| binary trie op | O(31) |
| space | O(total characters × alphabet) |

None of those mention how many words are stored. Ten words or a million,
\`startsWith("car")\` is three steps.

## The bugs

- No \`end\` flag — every prefix reports as a word.
- \`c - 'a'\` on a capital or a digit gives a negative index and throws.
- Returning \`false\` inside the wildcard loop before trying all 26 children.
- Reporting a board word twice — clear \`end\` after adding it.
- Forgetting to unmark the visited cell on the way back out.
- Deleting a word by unlinking shared nodes, which removes its neighbours too.
- Walking a binary trie from bit 0 upwards.

## The API

| Want | Write |
|---|---|
| Letter to index | \`c - 'a'\` |
| Index to letter | \`(char) ('a' + i)\` |
| Get or create a map child | \`next.computeIfAbsent(c, k -> new Node())\` |
| Character at i | \`word.charAt(i)\`, not \`toCharArray()\` in a hot loop |
| Path on the way down | \`StringBuilder\` + \`deleteCharAt(len - 1)\` on the way out |
| Bit b, unsigned | \`(x >>> b) & 1\` |
| No duplicates, order kept | \`new LinkedHashSet<>()\` |
`;export{e as default};