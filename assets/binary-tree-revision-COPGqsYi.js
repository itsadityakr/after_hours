var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The node, and the words

- \`class TreeNode { int val; TreeNode left, right; }\` — a tree is a reference to
  its root, and \`null\` is the empty subtree, the base case of every recursion.
- Leaf: both children \`null\`. Depth counts edges down from the root, height
  counts edges down to the deepest leaf, \`h\` is the tree's height.
- Balanced means h ≈ log₂ n. A chain means h = n.

## The three depth-first orders

| Order | Rule | Use it for |
|---|---|---|
| Preorder | node, left, right | Copying, serialising — parent before children |
| Inorder | left, node, right | Sorted output, from a BST |
| Postorder | left, right, node | When a node needs its children's answers first |

- On \`1(2(4,5), 3(-,6))\`: preorder \`1 2 4 5 3 6\`, inorder \`4 2 5 1 3 6\`,
  postorder \`4 5 2 6 3 1\`. Only the \`visit\` moves; the walk is identical.

## The shape

![What travels down as a parameter and what comes back up as a return](diagrams/binary-tree-revision-down-and-up.jpg)

\`\`\`java
int depth(TreeNode n) {
    if (n == null) return 0;                              // base case is null, not leaf
    return 1 + Math.max(depth(n.left), depth(n.right));   // solve both, then combine
}
\`\`\`

- Recurse on both children unconditionally — the base case covers \`null\`. Swap
  the combine for a different problem: \`l + r + 1\` counts nodes,
  \`n.val + l + r\` sums a subtree.
- **Down** as a parameter: running sums, \`(min, max)\` bounds, the path so far.
  **Up** as a return: heights, counts, subtree answers. Choosing wrong is the bug.

## Level order

\`\`\`java
Queue<TreeNode> q = new ArrayDeque<>();
q.add(root);
while (!q.isEmpty()) {
    int size = q.size();          // read once, before the level is consumed
    for (int i = 0; i < size; i++) { /* one node of this level */ }
}
\`\`\`

- Read the size outside the inner loop. Inside, the queue grows and the level
  never ends.
- Right side view = last node of each level. Minimum depth = first level holding
  a leaf, then stop.
- \`ArrayDeque\`, not \`LinkedList\` or \`Stack\`. It refuses \`null\`, a feature here.

## Return one thing, record another

\`\`\`java
int best;
int depth(TreeNode n) {
    if (n == null) return 0;
    int l = depth(n.left), r = depth(n.right);
    best = Math.max(best, l + r);   // a path turning at n uses both sides
    return 1 + Math.max(l, r);      // the parent can extend only one
}
\`\`\`

- Diameter and Binary Tree Maximum Path Sum are both this. For the sum version
  clamp each side with \`Math.max(0, ...)\` and start \`best\` at
  \`Integer.MIN_VALUE\` — the answer can be negative.

## The set pieces

- **Path sum**: subtract going down, test at the leaf
  (\`n.left == null && n.right == null\`), never at \`null\`.
- **LCA**: \`if (n == null || n == p || n == q) return n\`; two non-null sides
  means this node, otherwise pass the one up.
- **Same / symmetric**: recurse on two nodes, base case
  \`if (a == null || b == null) return a == b\`; mirror swaps \`left\`/\`right\`.
- **Build from preorder + inorder**: preorder gives the root, inorder splits the
  subtrees. Map value → inorder index, one shared moving preorder index, left
  built first.
- **Iterative preorder**: push right before left. **Inorder**: dive left
  pushing, pop, visit, go right. **Postorder**: preorder with the pushes
  swapped, reversed.

## Costs and bugs

![The height of the tree is the whole cost, balanced against a chain](diagrams/binary-tree-revision-cost-of-h.jpg)

| Thing | Time | Space |
|---|---|---|
| Any traversal | O(n) | O(h) stack |
| Level order | O(n) | O(w), the widest level |
| Search, unordered tree | O(n) | O(h) |
| Build from two traversals | O(n) | O(n) |

- O(h) is O(log n) balanced, O(n) skewed; a 10⁵-node chain can throw
  \`StackOverflowError\`, which is when you write the stack out by hand.
- Bugs, in order: no \`null\` guard at the top; \`q.size()\` read inside the level
  loop; adding both subtree answers where the parent may use one; edges counted
  as nodes; storing a path without \`new ArrayList<>(path)\`.
`;export{e as default};