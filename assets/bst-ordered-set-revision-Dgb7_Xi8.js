var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The invariant

- At every node: the whole left subtree is smaller, the whole right subtree is
  larger. Subtrees, not just the two children.
- So one comparison discards one subtree, and search, insert and delete are a
  single root-to-leaf walk: O(h). O(h) is O(log n) only when balanced, and a
  hand-written tree is not.
- Inorder (left, node, right) visits the values in increasing order. Most of the
  easy band is that sentence.

## Search and insert

\`\`\`java
TreeNode search(TreeNode n, int key) {
    while (n != null && n.val != key) n = key < n.val ? n.left : n.right;
    return n;                                    // null when it is not there
}

TreeNode insert(TreeNode n, int key) {
    if (n == null) return new TreeNode(key);
    if (key < n.val) n.left = insert(n.left, key);
    else if (key > n.val) n.right = insert(n.right, key);
    return n;
}
\`\`\`

- Always \`n.left = insert(n.left, key)\`. The call alone cannot attach anything
  to a \`null\` child.

## Delete, the three cases

![The three deletion cases, and why two children is the awkward one](diagrams/bst-ordered-set-revision-delete-cases.jpg)

- No children: return \`null\`. One child: return that child.
- Two children: copy the **inorder successor** (leftmost node of the right
  subtree) into this node, then delete the successor from the right subtree —
  it has no left child, so that recursion hits an easy case. The inorder
  predecessor works just as well.

## Validating

\`\`\`java
boolean valid(TreeNode n, long low, long high) {          // window carried down
    if (n == null) return true;
    if (n.val <= low || n.val >= high) return false;
    return valid(n.left, low, n.val) && valid(n.right, n.val, high);
}
\`\`\`

- Or walk inorder keeping the previous **node** and require \`prev.val < n.val\`.
- Checking each node against its own children only is the classic wrong answer:
  \`5(3(1, 6), 8)\` passes it, and 6 is in 5's left subtree.
- \`int\` bounds break when the data holds \`Integer.MIN_VALUE\`. Use \`long\`, or the
  inorder version with a nullable previous node — it invents no bounds at all.

## Kth smallest and neighbours

![Inorder is sorted, so a stack walk can stop at the k-th pop](diagrams/bst-ordered-set-revision-kth-smallest.jpg)

- k-th smallest: inorder with an explicit stack, stop at the k-th pop. O(h + k),
  and paused between calls it is BST Iterator.
- Successor of x: walk down, and every time \`n.val > x\` record it and go left,
  otherwise go right. Predecessor mirrors it. \`>=\` makes it the ceiling.
- Many queries on a changing tree: store a subtree size per node and descend.

## TreeMap and TreeSet

| Want | Call |
|---|---|
| Largest ≤ k, smallest ≥ k | \`floorKey(k)\`, \`ceilingKey(k)\` |
| Strictly greater, strictly smaller | \`higherKey(k)\`, \`lowerKey(k)\` |
| Ends | \`firstKey()\`/\`lastKey()\` throw; \`firstEntry()\`/\`lastEntry()\` give \`null\` |
| Take an end | \`pollFirstEntry()\`, \`pollLastEntry()\` |
| Ranges | \`headMap(k)\` exclusive, \`tailMap(k)\` inclusive, \`subMap(lo, true, hi, false)\` |
| Backwards | \`descendingMap()\`, \`descendingKeySet()\` |
| Set forms | \`floor\`, \`ceiling\`, \`higher\`, \`lower\`, \`pollFirst\`, \`subSet\`, … |

- Navigation methods return \`null\` — keep the result as \`Integer\` and test
  before unboxing.
- Range views are live windows, not copies, and \`subMap(lo, hi).size()\` walks
  the window: O(range), not O(log n).
- \`TreeMap\` is a red-black tree, so O(log n) is guaranteed. A hand-written BST
  fed sorted input becomes a linked list, and every operation becomes O(n).

## Costs and bugs

| Operation | Balanced | Skewed |
|---|---|---|
| search, insert, delete, floor, ceiling | O(log n) | O(n) |
| Inorder traversal, k-th smallest by walking | O(n), O(h + k) | O(n) |
| n inserts, versus building from a sorted array | O(n log n), O(n) | O(n²) |


- Validating against the parent instead of carrying a window.
- \`Integer.MIN_VALUE\` as a starting bound with \`Integer.MIN_VALUE\` in the data.
- Promoting a child when deleting a two-child node, or forgetting the
  \`n.left = insert(n.left, key)\` reassignment.
- Collecting every value to answer "the k-th", or "the closest".
- \`int k = map.floorKey(x)\` when nothing is below \`x\` — \`NullPointerException\`.
  \`firstKey()\` on an empty map throws; \`firstEntry()\` returns \`null\`.
`;export{e as default};