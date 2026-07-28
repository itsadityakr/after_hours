var e=`A tree has no indices and no order — only nodes, each holding a value and
pointing at up to two others. What that buys you is that a question about a
whole tree splits into the same question about two smaller trees, and that split
is what every problem in this topic is built out of.

The solution this replaces is the one where you track where you are by hand,
with a stack of your own and a parent pointer. Recursion keeps all of that for
you, so the answers here are short — five to eight lines, most of them — and the
difficulty moves to one decision: what travels *down* into the recursion as a
parameter, and what comes *back up* as a return value.

## What a node is

There is no \`Tree\` class. A tree is a reference to its top node, and that node
points at the rest. Every problem here hands you this:

\`\`\`java
class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
\`\`\`

\`left\` and \`right\` are \`null\` when there is no child, which is Java's way of
saying "empty tree" — and that is the base case of every recursion below. A node
with both children \`null\` is a **leaf**; the node you were handed is the
**root**; nothing stores a parent unless the problem says so.

**Depth** of a node is the number of edges down from the root, so the root has
depth 0. **Height** is the number of edges down to its deepest leaf, so a leaf
has height 0. \`h\` means the height of the tree throughout, and it matters
because recursion costs O(h) of stack. A **binary search tree** adds an ordering
rule on top of all this — that is [the next topic](#/dsa/bst-ordered-set/notes),
and nothing on this page assumes it.

## The tree we keep coming back to

Every trace below uses this one. Six nodes, deliberately lopsided, so the
traversals actually produce different answers.

\`\`\`text
          1
        /   \\
       2     3
      / \\     \\
     4   5     6
\`\`\`

Node 3 has no left child. That gap is not decoration — it is what stops an
off-by-one hiding, the way it would in a perfect tree.

## The three depth-first orders

Depth-first means going all the way down one branch before starting the next.
The three orders differ in one thing only: **when you look at the node itself**,
relative to the two recursive calls.

\`\`\`java
void preorder(TreeNode n)  { visit(n); preorder(n.left);  preorder(n.right);  }
void inorder(TreeNode n)   { inorder(n.left);   visit(n); inorder(n.right);   }
void postorder(TreeNode n) { postorder(n.left); postorder(n.right); visit(n); }
\`\`\`

Preorder running on the tree above, indented by depth:

\`\`\`text
preorder(1)
  visit 1
  preorder(2)
    visit 2
    preorder(4)     visit 4   (both children null, returns)
    preorder(5)     visit 5
  preorder(3)
    visit 3
    preorder(null)  returns at once, nothing visited
    preorder(6)     visit 6

sequence: 1 2 4 5 3 6
\`\`\`

Move the \`visit\` line and the same walk gives a different sequence. The same
nodes are reached in the same order; you write them down at a different moment.

![The same walk with the visit moved, so the root lands first, middle or last](diagrams/binary-tree-notes-three-orders.jpg)

| Order | Rule | On this tree | What it is for |
|---|---|---|---|
| Preorder | node, left, right | 1 2 4 5 3 6 | Copying or serialising — the parent exists before its children need it |
| Inorder | left, node, right | 4 2 5 1 3 6 | Sorted order out of a BST. On a plain tree it means little |
| Postorder | left, right, node | 4 5 2 6 3 1 | When a node needs its children's answers first: heights, sums, deleting |

The fourth column is the actual rule for choosing. Ask when the node's own work
can be done. If it needs to know how tall its subtrees are, it cannot go before
them, so it is postorder. If it only hands something down, it is preorder.

## Solve for the children, then combine

Nearly every problem here is one sentence: get the answer for the left subtree,
get the answer for the right, combine them with this node, return that. Which is
postorder with a return value instead of a \`visit\`.

\`\`\`java
int depth(TreeNode n) {
    if (n == null) return 0;                              // an empty tree is 0 deep
    return 1 + Math.max(depth(n.left), depth(n.right));   // ask both, combine
}
\`\`\`

- **The base case is \`null\`, not a leaf.** Testing for a leaf means also testing
  for \`null\` first, and you end up with four branches instead of two. Let \`null\`
  return the identity value: 0 for a depth, \`true\` for "all nodes satisfy",
  \`null\` for a subtree.
- **Both children are called unconditionally.** No \`if (n.left != null)\`. The
  base case already covers it.
- **The combine step is the whole problem.** \`1 + max\` is a depth, \`l + r + 1\` a
  node count, \`n.val + l + r\` a subtree sum. Same six lines, different question.

State that a node needs *before* its children run — the sum along the path from
the root, a \`(min, max)\` bound — cannot be returned up. It is a parameter, and
it travels down. Getting that round the wrong way is the mistake the pattern
card warns about, and it is the mistake.

## Level order, and the size trick

Visiting every node at depth 0, then every node at depth 1, needs a queue rather
than recursion, because you have to hold a whole row at once.

\`\`\`java
Queue<TreeNode> q = new ArrayDeque<>();
q.add(root);
while (!q.isEmpty()) {
    int size = q.size();                 // fix the level's width before consuming it
    for (int i = 0; i < size; i++) {
        TreeNode n = q.remove();
        if (n.left != null) q.add(n.left);
        if (n.right != null) q.add(n.right);
    }
    // one level finished here
}
\`\`\`

\`int size = q.size()\` on its own line is the whole trick. Inside the loop the
queue is growing as children go in, so \`i < q.size()\` never ends the level and
the entire tree comes out as one row.

![Reading the queue size once, before the level is drained](diagrams/binary-tree-notes-level-width.jpg)

\`\`\`text
q = [1]        size 1  ->  level [1],       push 2, 3
q = [2, 3]     size 2  ->  level [2, 3],    push 4, 5, 6
q = [4, 5, 6]  size 3  ->  level [4, 5, 6]
q = []                     done
\`\`\`

That loop answers more than it looks.
[Binary Tree Level Order Traversal](problem:binary-tree-level-order-traversal)
collects each level; [Binary Tree Right Side View](problem:binary-tree-right-side-view)
takes the last node of each; a minimum depth stops at the first level holding a
leaf. More on the structure in [queues](#/dsa/queues/notes). Use \`ArrayDeque\`,
not \`LinkedList\` — it is faster, and it refuses \`null\`, which turns a bug into
an exception at the line that caused it.

## The four orders, running

\`\`\`java Traverse.java @run-binary-tree-traverse
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class Traverse {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode sample() {                // the tree drawn above
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);
        return root;
    }

    static void preorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        out.add(n.val);
        preorder(n.left, out);
        preorder(n.right, out);
    }

    static void inorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out);
        out.add(n.val);
        inorder(n.right, out);
    }

    static void postorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        postorder(n.left, out);
        postorder(n.right, out);
        out.add(n.val);
    }

    static List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> levels = new ArrayList<>();
        if (root == null) return levels;
        Queue<TreeNode> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            int size = q.size();
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                TreeNode n = q.remove();
                level.add(n.val);
                if (n.left != null) q.add(n.left);
                if (n.right != null) q.add(n.right);
            }
            levels.add(level);
        }
        return levels;
    }

    public static void main(String[] args) {
        TreeNode root = sample();
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        preorder(root, pre);
        inorder(root, in);
        postorder(root, post);

        System.out.println("preorder     " + pre);
        System.out.println("inorder      " + in);
        System.out.println("postorder    " + post);
        System.out.println("level order  " + levelOrder(root));
        System.out.println("empty tree   " + levelOrder(null));   // no special case needed
    }
}
\`\`\`

\`\`\`output @run-binary-tree-traverse
preorder     [1, 2, 4, 5, 3, 6]
inorder      [4, 2, 5, 1, 3, 6]
postorder    [4, 5, 2, 6, 3, 1]
level order  [[1], [2, 3], [4, 5, 6]]
empty tree   []
\`\`\`

## Height, and the diameter trick

![The value returned to the parent differs from the value recorded at a node](diagrams/binary-tree-notes-return-and-record.jpg)

The **diameter** is the number of edges on the longest path between any two
nodes, and it need not pass through the root. Computing both subtree heights at
every node recomputes the same heights over and over: O(n²) on a skewed tree.

The fix is a trick you will reuse all topic: **return one thing, record
another**. The recursion returns the height, which is what the parent needs, and
on the way past it compares the best path *through this node* against a field.

\`\`\`java
int best;                                  // the answer, recorded as we go

int depth(TreeNode n) {
    if (n == null) return 0;
    int l = depth(n.left), r = depth(n.right);
    best = Math.max(best, l + r);          // a path turning at n uses both sides
    return 1 + Math.max(l, r);             // the parent can only extend one
}
\`\`\`

Both lines are needed and they say different things. On the tree above, node 2
sets \`best\` to 2 — the path 4-2-5 — and node 1 raises it to 4, the path
4-2-1-3-6. Four edges, five nodes: check which one the statement counts.
[Diameter of Binary Tree](problem:diameter-of-binary-tree) counts edges, and
several near-identical questions count nodes.

## What is carried down: path sum and ancestors

[Path Sum](problem:path-sum) asks whether some root-to-leaf path adds to a
target. A node cannot know what was above it, so the running total goes down as
a parameter — and the neatest form subtracts as it descends.

\`\`\`java
boolean hasPathSum(TreeNode n, int target) {
    if (n == null) return false;                                   // ran off the tree
    if (n.left == null && n.right == null) return target == n.val; // a leaf: last chance
    return hasPathSum(n.left, target - n.val)
        || hasPathSum(n.right, target - n.val);
}
\`\`\`

The leaf test is deliberately separate from the \`null\` test. \`null\` means "there
was no child here", not "the path ended" — a node with one child is not a leaf,
and returning \`target == 0\` at \`null\` would accept a path that stops halfway.
[Path Sum II](problem:path-sum-ii) wants every such path, so it carries a list
down too and removes the last element on the way out; that undo is
[backtracking](#/dsa/recursion-and-backtracking/notes).

[Lowest Common Ancestor of a Binary Tree](problem:lowest-common-ancestor-of-a-binary-tree)
runs the other way, with no ordering to exploit:

\`\`\`java
TreeNode lca(TreeNode n, TreeNode p, TreeNode q) {
    if (n == null || n == p || n == q) return n;      // found one, or nothing here
    TreeNode l = lca(n.left, p, q);
    TreeNode r = lca(n.right, p, q);
    if (l != null && r != null) return n;             // one on each side: this is it
    return l != null ? l : r;                         // both on one side: pass it up
}
\`\`\`

The return value means "the shallowest node in this subtree that is \`p\`, or \`q\`,
or an ancestor of both". Two non-null sides mean this node splits them. It stops
at the first of \`p\` or \`q\` it meets, which is still right when one is an
ancestor of the other.

## Two trees at once

[Symmetric Tree](problem:symmetric-tree) and "same tree" are one recursion with
a pair of arguments swapped. Recurse on **two** nodes rather than one:

\`\`\`java
boolean same(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;   // both null is equal, one null is not
    return a.val == b.val && same(a.left, b.left) && same(a.right, b.right);
}

boolean mirror(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;
    return a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
}
\`\`\`

\`a == b\` in the base case is shorthand for "true only if both are \`null\`": past
the \`||\` at least one of them is, so they match exactly when the other is too.
[Subtree of Another Tree](problem:subtree-of-another-tree) is \`same\` started at
every node, O(n × m) and acceptable.
[Invert Binary Tree](problem:invert-binary-tree) is three lines — recurse both
sides, then swap the two child references.

\`\`\`java Shape.java @run-binary-tree-shape
public class Shape {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode sample() {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);
        root.right.right = new TreeNode(6);
        return root;
    }

    static int height(TreeNode n) {
        if (n == null) return 0;
        return 1 + Math.max(height(n.left), height(n.right));
    }

    static int best;

    static int depth(TreeNode n) {
        if (n == null) return 0;
        int l = depth(n.left), r = depth(n.right);
        best = Math.max(best, l + r);
        return 1 + Math.max(l, r);
    }

    static int diameter(TreeNode root) {
        best = 0;
        depth(root);
        return best;
    }

    static boolean hasPathSum(TreeNode n, int target) {
        if (n == null) return false;
        if (n.left == null && n.right == null) return target == n.val;
        return hasPathSum(n.left, target - n.val) || hasPathSum(n.right, target - n.val);
    }

    static TreeNode lca(TreeNode n, TreeNode p, TreeNode q) {
        if (n == null || n == p || n == q) return n;
        TreeNode l = lca(n.left, p, q);
        TreeNode r = lca(n.right, p, q);
        if (l != null && r != null) return n;
        return l != null ? l : r;
    }

    static boolean mirror(TreeNode a, TreeNode b) {
        if (a == null || b == null) return a == b;
        return a.val == b.val && mirror(a.left, b.right) && mirror(a.right, b.left);
    }

    public static void main(String[] args) {
        TreeNode root = sample();
        TreeNode four = root.left.left, five = root.left.right, six = root.right.right;

        System.out.println("height, in nodes   " + height(root));
        System.out.println("diameter, in edges " + diameter(root));
        System.out.println("lca(4, 5)          " + lca(root, four, five).val);
        System.out.println("lca(4, 6)          " + lca(root, four, six).val);
        System.out.println("lca(2, 4)          " + lca(root, root.left, four).val);
        System.out.println("path sum 7 / 9     " + hasPathSum(root, 7) + " / " + hasPathSum(root, 9));
        System.out.println("symmetric          " + mirror(root.left, root.right));
        System.out.println("one node           height " + height(new TreeNode(1))
                + ", diameter " + diameter(new TreeNode(1)));
    }
}
\`\`\`

\`\`\`output @run-binary-tree-shape
height, in nodes   3
diameter, in edges 4
lca(4, 5)          2
lca(4, 6)          1
lca(2, 4)          2
path sum 7 / 9     true / false
symmetric          false
one node           height 1, diameter 0
\`\`\`

The root-to-leaf sums are 7, 8 and 10, so 7 is found and 9 is not. The tree is
not symmetric, because 2 and 3 differ. And \`lca(2, 4)\` is 2 — a node counts as
its own ancestor.

## Rebuilding a tree from two traversals

[Construct Binary Tree from Preorder and Inorder](problem:construct-binary-tree-from-preorder-and-inorder-traversal)
is the problem that proves you understood what the orders mean. One traversal
alone is not enough; many trees share a preorder. Two pin it down:

- The **first** preorder element is the root, by definition.
- Find that value in the **inorder**. Everything left of it is the left subtree,
  everything right of it the right subtree. Also by definition.
- That gives the left subtree's size, so recurse.

\`\`\`text
pre = [1, 2, 4, 5, 3, 6]
in  = [4, 2, 5, 1, 3, 6]

root = pre[0] = 1, at index 3 of in
  left  subtree = in[0..2] = 4 2 5      root = next in pre = 2, at index 1
      left = in[0..0] = 4    right = in[2..2] = 5
  right subtree = in[4..5] = 3 6        root = next in pre = 3, at index 4
      left = empty           right = in[5..5] = 6
\`\`\`

\`\`\`java
int next;                                  // one moving index into the preorder, shared
Map<Integer, Integer> where;               // value -> its index in the inorder

TreeNode build(int lo, int hi) {           // the subtree spanning in[lo..hi]
    if (lo > hi) return null;
    TreeNode n = new TreeNode(pre[next++]);
    int mid = where.get(n.val);
    n.left = build(lo, mid - 1);           // must run first: it consumes the left half
    n.right = build(mid + 1, hi);
    return n;
}
\`\`\`

Two details keep it O(n) rather than O(n²). The map makes "find that value" a
lookup instead of a scan — see [hash tables](#/dsa/hash-tables/notes). And the
preorder is never sliced: one shared index, consumed left-subtree-first, hands
each call exactly the values it should get. It assumes distinct values, which
the problem guarantees and the map depends on.

## The traversals with an explicit stack

Recursion is a stack you did not have to write. Sometimes you need the written
one: when the tree is deep enough to overflow the call stack, and when you need
to *pause* the traversal — which is what
[Binary Search Tree Iterator](problem:binary-search-tree-iterator) asks for.

\`\`\`java
// preorder
Deque<TreeNode> st = new ArrayDeque<>();
st.push(root);                                   // root must not be null here
while (!st.isEmpty()) {
    TreeNode n = st.pop();
    visit(n);
    if (n.right != null) st.push(n.right);       // right first, so left pops first
    if (n.left != null) st.push(n.left);
}

// inorder
Deque<TreeNode> st = new ArrayDeque<>();
TreeNode cur = root;
while (cur != null || !st.isEmpty()) {
    while (cur != null) { st.push(cur); cur = cur.left; }  // dive left, remembering the way
    cur = st.pop();
    visit(cur);
    cur = cur.right;                                       // then the same to the right
}
\`\`\`

Pushing right before left is the line people get backwards; a stack reverses
what you put in. In the inorder loop the stack holds the nodes you walked past
and have not yet visited — stop it after \`k\` visits and you have
[Kth Smallest Element in a BST](problem:kth-smallest-element-in-a-bst) without
touching the rest of the tree. Postorder is fiddliest, and the trick is to avoid
it: run the preorder loop with the two pushes swapped, giving node-right-left,
then reverse the result. More on the structure in [stacks](#/dsa/stacks/notes).

## What it costs

| Operation | Time | Space | Why |
|---|---|---|---|
| Any full traversal | O(n) | O(h) | Each node entered and left once; the stack holds one frame per level of the current path |
| Level order | O(n) | O(w) | \`w\` is the widest level, about n/2 for a full tree |
| Height, diameter, sums | O(n) | O(h) | One postorder, constant work per node |
| Search for a value | O(n) | O(h) | No ordering to exploit — a BST is the fix |
| Build from two traversals | O(n) | O(n) | The map, plus the tree |
| Subtree of another | O(n × m) | O(h) | A comparison started at every node |

\`h\` is where the two extremes live. A balanced tree has h ≈ log₂ n — twenty
levels for a million nodes. A degenerate tree, every node with one child, is a
linked list with extra steps and h = n. That is not exotic: it is what inserting
sorted data into a plain search tree produces, and it is why the library's
ordered structures rebalance.

O(h) stack is a real limit. Java overflows somewhere around ten to twenty
thousand frames, so a chain of 10⁵ nodes can throw \`StackOverflowError\` on a
recursion that is otherwise correct. That is when the explicit stack stops being
an academic exercise.

## The mistakes, in the order people make them

1. **No \`null\` check at the top.** Every recursive method here opens with
   \`if (n == null)\`. Without it the first leaf throws \`NullPointerException\`.
2. **Testing children before recursing.** \`if (n.left != null) f(n.left)\`
   duplicates the base case and doubles the branches.
3. **Reading \`q.size()\` inside the level loop.** The queue grows as children go
   in, the level never ends, and the whole tree arrives as one row.
4. **Confusing "path through this node" with "path the parent can use".** The
   first adds both sides, the second takes the larger. Diameter and
   [Binary Tree Maximum Path Sum](problem:binary-tree-maximum-path-sum) are both
   this mistake.
5. **Counting nodes where the problem counts edges,** or the reverse. The two
   differ by one, and a base case of \`0\` versus \`-1\` is how you choose.
6. **Returning \`target == 0\` at \`null\` in a path sum,** so a node with one child
   reports a path that never reached a leaf.
7. **Storing the path without copying it** in
   [Path Sum II](problem:path-sum-ii). You keep mutating one \`List\`, so every
   answer is the same one, and usually empty.
8. **Pushing \`null\` into an \`ArrayDeque\`.** It throws on \`add\`. Filter children
   as you push, or pick a structure that allows \`null\` when the algorithm
   encodes gaps, as
   [Serialize and Deserialize Binary Tree](problem:serialize-and-deserialize-binary-tree)
   does.

## The Java you will reach for

| You want | Write |
|---|---|
| A queue for level order | \`Queue<TreeNode> q = new ArrayDeque<>()\` |
| Add, remove | \`q.add(n)\` / \`q.remove()\` — both throw when misused |
| The forgiving pair | \`q.offer(n)\` / \`q.poll()\` — \`poll\` returns \`null\` when empty |
| A stack | \`Deque<TreeNode> st = new ArrayDeque<>()\`, then \`push\` / \`pop\` / \`peek\` |
| Level width, safely | \`int size = q.size()\` before the inner loop |
| Value to index, for rebuilding | \`Map<Integer, Integer> m = new HashMap<>()\` |
| Collect an answer | \`List<Integer> out = new ArrayList<>()\`, passed down |
| Copy a path before storing it | \`new ArrayList<>(path)\` |
| Larger of two | \`Math.max(a, b)\` — nests fine for three |
| Sums that might overflow | make the accumulator \`long\` |

\`Stack\` exists and you should not use it: synchronised, slower, and it iterates
bottom-to-top, the opposite of what you expect.

## Working one from the sheet

[Binary Tree Maximum Path Sum](problem:binary-tree-maximum-path-sum): the
largest sum along any path, where a path is any run of connected nodes and need
not touch the root. Values may be negative.

This is the diameter trick with sums instead of edges, plus one idea. A subtree
summing to a negative number is not worth attaching, so clamp its contribution
at zero — the same as saying the path stops before it. Return the best path that
goes straight down through \`n\`, which can use one side; record the best path
that turns at \`n\`, which uses both.

\`\`\`java MaxPath.java @run-binary-tree-max-path
public class MaxPath {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static int best;

    /** The best sum of a path that starts at n and goes straight down. */
    static int down(TreeNode n) {
        if (n == null) return 0;
        int l = Math.max(0, down(n.left));    // a negative branch is refused, not used
        int r = Math.max(0, down(n.right));
        best = Math.max(best, n.val + l + r); // the path that turns at n
        return n.val + Math.max(l, r);        // what the parent may extend
    }

    static int maxPathSum(TreeNode root) {
        best = Integer.MIN_VALUE;             // not 0: the answer can be negative
        down(root);
        return best;
    }

    static TreeNode node(int v, TreeNode l, TreeNode r) {
        TreeNode n = new TreeNode(v);
        n.left = l;
        n.right = r;
        return n;
    }

    public static void main(String[] args) {
        System.out.println("1(2, 3)           " + maxPathSum(node(1, new TreeNode(2), new TreeNode(3))));
        System.out.println("-10(9, 20(15,7))  " + maxPathSum(
                node(-10, new TreeNode(9), node(20, new TreeNode(15), new TreeNode(7)))));
        System.out.println("single -3         " + maxPathSum(new TreeNode(-3)));
        System.out.println("-2(-1, -)         " + maxPathSum(node(-2, new TreeNode(-1), null)));
    }
}
\`\`\`

\`\`\`output @run-binary-tree-max-path
1(2, 3)           6
-10(9, 20(15,7))  42
single -3         -3
-2(-1, -)         -1
\`\`\`

The last two cases are the ones that catch people. Every value is negative, so a
solution starting at \`best = 0\` returns 0 — a sum no path can produce. A path
holds at least one node, so the best available is the largest single value, and
starting at \`Integer.MIN_VALUE\` is what allows that.

## How to work through the topic

1. [Maximum Depth of Binary Tree](problem:maximum-depth-of-binary-tree) and
   [Invert Binary Tree](problem:invert-binary-tree), without looking. They are
   "recurse on both children, combine" with nothing in the way.
2. [Symmetric Tree](problem:symmetric-tree) and
   [Subtree of Another Tree](problem:subtree-of-another-tree): recursion over
   two nodes at once, and the base case where one is \`null\` and the other is not.
3. [Path Sum](problem:path-sum), then [Path Sum II](problem:path-sum-ii). State
   carried down, then the same with a path collected and undone on the way out.
4. [Binary Tree Level Order Traversal](problem:binary-tree-level-order-traversal),
   then [Binary Tree Right Side View](problem:binary-tree-right-side-view). Get
   \`int size = q.size()\` into your fingers; the second is the same loop keeping
   the last node of each level.
5. [Diameter of Binary Tree](problem:diameter-of-binary-tree). The first "return
   one thing, record another" problem. Do not move on until you can say why the
   returned value and the recorded value differ.
6. [Lowest Common Ancestor of a Binary Tree](problem:lowest-common-ancestor-of-a-binary-tree)
   and [Construct Binary Tree from Preorder and Inorder](problem:construct-binary-tree-from-preorder-and-inorder-traversal).
   A return value with a subtle meaning, then what the traversal orders are
   actually telling you.
7. The hard band, one per sitting:
   [Binary Tree Maximum Path Sum](problem:binary-tree-maximum-path-sum),
   [Serialize and Deserialize Binary Tree](problem:serialize-and-deserialize-binary-tree),
   [Vertical Order Traversal of a Binary Tree](problem:vertical-order-traversal-of-a-binary-tree),
   [Binary Tree Cameras](problem:binary-tree-cameras). The last is a tree
   [greedy](#/dsa/greedy/notes) in disguise; the others are shapes from above
   pushed one step further.
   [Validate Binary Search Tree](problem:validate-binary-search-tree) and
   [Kth Smallest Element in a BST](problem:kth-smallest-element-in-a-bst) belong
   to [the next topic](#/dsa/bst-ordered-set/notes) — do them there, with the
   ordering rule in hand.
`;export{e as default};