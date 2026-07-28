var e=`A plain binary tree gives you no help finding anything: a value could be
anywhere, so you look at every node. A binary search tree adds one rule, and
that rule turns a search from O(n) into a walk down a single branch. The same
rule is what makes "the k-th smallest", "the nearest value below x" and "every
key between 100 and 200" short to write rather than a sort followed by a scan.

The second half of this topic is the part that wins interviews. Java already
ships a balanced binary search tree — \`TreeMap\` and \`TreeSet\` — with methods for
floor, ceiling, next-higher, next-lower and every kind of range view. A lot of
"hard" problems are eight lines with those and forty without, and most people do
not know the methods exist.

This page assumes [binary tree](#/dsa/binary-tree/notes): the \`TreeNode\` class,
the three traversal orders and the recursion shape all come from there.

## The invariant

For **every** node in the tree:

> everything in its left subtree is smaller, everything in its right subtree is
> larger.

Not just its two children — the entire subtree. That distinction is the whole
topic, and it is where the common wrong answer to validation comes from.

\`\`\`text
            8
          /   \\
         3     10
        / \\      \\
       1   6      14
          / \\     /
         4   7   13
\`\`\`

Check it at 8: the left subtree holds 1, 3, 4, 6, 7 — all smaller. The right
holds 10, 13, 14 — all larger. Check it at 3, at 6, at 10, and it holds there
too. Duplicates are usually excluded; when a problem allows them it will say
where they go, and you follow it exactly.

Because the rule holds at every node, comparing a value with a node tells you
which half of the remaining tree it can possibly be in. Every comparison
discards a subtree. That is the entire mechanism.

## Search

\`\`\`java
TreeNode search(TreeNode n, int key) {
    while (n != null && n.val != key)
        n = key < n.val ? n.left : n.right;   // one comparison, one subtree discarded
    return n;                                  // null when it is not there
}
\`\`\`

Looking for 6 in the tree above: 6 < 8 so go left; 6 > 3 so go right; found.
Three comparisons for nine nodes. This is binary search with pointers instead of
indices — see [binary search](#/dsa/binary-search/notes) — and it costs O(h),
where \`h\` is the height of the tree.

O(h) is not O(log n). It is O(log n) only when the tree is *balanced*, and
nothing so far forces it to be. Hold that thought; it comes back.

## Insert

Insert follows exactly the search path and hangs the new node where the search
would have fallen off the tree.

\`\`\`java
TreeNode insert(TreeNode n, int key) {
    if (n == null) return new TreeNode(key);       // the empty spot the search reached
    if (key < n.val) n.left = insert(n.left, key);
    else if (key > n.val) n.right = insert(n.right, key);
    return n;                                      // equal: already present, change nothing
}
\`\`\`

The \`n.left = insert(...)\` idiom is worth reading twice. Each call returns the
subtree it was given, possibly changed, and the caller reassigns it. That means
the base case can create a node and the parent's reference gets fixed for free —
no parent pointers, no special case for an empty tree. Delete uses the same
convention.

## Delete, including the awkward case

Deletion is the one operation with real cases, and it is asked precisely because
of them. [Delete Node in a BST](problem:delete-node-in-a-bst):

- **No children.** Return \`null\`. The parent's reference is overwritten with it.
- **One child.** Return that child. It moves up, and the invariant survives
  because every value in it was already on the correct side of the parent.
- **Two children.** You cannot return either one. Instead, replace the node's
  *value* with the smallest value in its right subtree — its **inorder
  successor**, the next value up in sorted order — and then delete that
  successor from the right subtree. The successor is the leftmost node of the
  right subtree, so it has no left child, which puts it in one of the two easy
  cases above.

\`\`\`java
TreeNode delete(TreeNode n, int key) {
    if (n == null) return null;
    if (key < n.val) n.left = delete(n.left, key);
    else if (key > n.val) n.right = delete(n.right, key);
    else {
        if (n.left == null) return n.right;      // 0 or 1 child: hand the child up
        if (n.right == null) return n.left;
        TreeNode succ = n.right;                 // 2 children: smallest on the right
        while (succ.left != null) succ = succ.left;
        n.val = succ.val;                        // copy the value in
        n.right = delete(n.right, succ.val);     // then remove where it came from
    }
    return n;
}
\`\`\`

Why the successor works: it is larger than everything in the left subtree
(everything there was smaller than the node it replaces, which was smaller than
the successor) and smaller than everything remaining on the right (it was the
minimum). So it is exactly the value that may sit in this position. The largest
value of the *left* subtree — the inorder predecessor — works equally well, and
either is an acceptable answer.

\`\`\`text
delete 6 from   3            the node has two children, 4 and 7
               / \\           successor = leftmost of the right subtree = 7
              4   7          copy 7 up, then delete 7 from the right subtree

result          3
               / \\
              4   7   ->     7 now has no children, so that delete is the easy case
\`\`\`

## Inorder is sorted

Take the traversal \`left, node, right\` and read the invariant into it: you visit
everything smaller than the node, then the node, then everything larger. By
induction that produces the values in increasing order.

\`\`\`java
void inorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    inorder(n.left, out);
    out.add(n.val);
    inorder(n.right, out);
}
\`\`\`

On the tree above that gives \`1 3 4 6 7 8 10 13 14\`, and that one fact answers
several of the sheet's problems.
[Minimum Absolute Difference in BST](problem:minimum-absolute-difference-in-bst)
is the smallest gap between adjacent values in a sorted list, so keep the
previous node and compare.
[Find Mode in Binary Search Tree](problem:find-mode-in-binary-search-tree)
counts runs of equal values, which are adjacent.
[Increasing Order Search Tree](problem:increasing-order-search-tree) rebuilds
the tree in that order, and
[Balance a Binary Search Tree](problem:balance-a-binary-search-tree) reads the
values out and rebuilds taking the middle as the root — the construction of
[Convert Sorted Array to Binary Search Tree](problem:convert-sorted-array-to-binary-search-tree).

## Validating, and the trap

![A tree where every parent-child pair passes but the tree is not a BST](diagrams/bst-ordered-set-notes-validation-trap.jpg)

[Validate Binary Search Tree](problem:validate-binary-search-tree) has one
famous wrong answer: check each node against its two children and recurse. It
passes on trees that are not search trees, because the rule is about whole
subtrees, not parents.

\`\`\`text
        5
       / \\
      3   8        every parent-child pair is fine:
     / \\           3 < 5, 8 > 5, 1 < 3, 6 > 3
    1   6          but 6 sits in 5's LEFT subtree, and 6 > 5
\`\`\`

Two correct approaches:

\`\`\`java
// 1. carry a window down: everything here must sit strictly inside (low, high)
boolean valid(TreeNode n, long low, long high) {
    if (n == null) return true;
    if (n.val <= low || n.val >= high) return false;
    return valid(n.left, low, n.val)        // going left tightens the upper bound
        && valid(n.right, n.val, high);     // going right tightens the lower one
}
// call with valid(root, Long.MIN_VALUE, Long.MAX_VALUE)
\`\`\`

\`\`\`java
// 2. walk inorder and require the sequence to increase
TreeNode prev;                              // the previously visited node, not a value

boolean check(TreeNode n) {
    if (n == null) return true;
    if (!check(n.left)) return false;
    if (prev != null && prev.val >= n.val) return false;
    prev = n;
    return check(n.right);
}
\`\`\`

The window is the more general tool — it is state carried *down*, and the same
shape solves [Trim a Binary Search Tree](problem:trim-a-binary-search-tree) and
range queries. The catch is the initial bounds. If you write it with \`int\` and
call it with \`Integer.MIN_VALUE\`, a tree whose data legitimately contains
\`Integer.MIN_VALUE\` is rejected. Use \`long\` bounds, or \`Integer\` bounds where
\`null\` means unbounded.

The inorder version has no such problem **provided** you keep the previous
*node* rather than a previous *value* initialised to a sentinel. \`null\` means
"nothing visited yet", and no real value can collide with that. That makes it
the safer default, and it is the version to reach for when the constraints
mention \`Integer.MIN_VALUE\` at all.

\`\`\`java Validate.java @run-bst-ordered-set-validate
public class Validate {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode node(int v, TreeNode l, TreeNode r) {
        TreeNode n = new TreeNode(v);
        n.left = l;
        n.right = r;
        return n;
    }

    static boolean window(TreeNode n, long low, long high) {
        if (n == null) return true;
        if (n.val <= low || n.val >= high) return false;
        return window(n.left, low, n.val) && window(n.right, n.val, high);
    }

    /** The same idea with int bounds — correct until the data reaches the ends. */
    static boolean windowInt(TreeNode n, int low, int high) {
        if (n == null) return true;
        if (n.val <= low || n.val >= high) return false;
        return windowInt(n.left, low, n.val) && windowInt(n.right, n.val, high);
    }

    static TreeNode prev;

    static boolean rising(TreeNode n) {
        if (n == null) return true;
        if (!rising(n.left)) return false;
        if (prev != null && prev.val >= n.val) return false;
        prev = n;
        return rising(n.right);
    }

    static boolean inorderCheck(TreeNode root) {
        prev = null;
        return rising(root);
    }

    /** The wrong answer: each node against its own two children only. */
    static boolean parentOnly(TreeNode n) {
        if (n == null) return true;
        if (n.left != null && n.left.val >= n.val) return false;
        if (n.right != null && n.right.val <= n.val) return false;
        return parentOnly(n.left) && parentOnly(n.right);
    }

    public static void main(String[] args) {
        TreeNode good = node(5, node(3, new TreeNode(1), new TreeNode(4)), new TreeNode(8));
        TreeNode bad = node(5, node(3, new TreeNode(1), new TreeNode(6)), new TreeNode(8));
        TreeNode edge = new TreeNode(Integer.MIN_VALUE);

        System.out.println("good: window " + window(good, Long.MIN_VALUE, Long.MAX_VALUE)
                + ", inorder " + inorderCheck(good) + ", parent-only " + parentOnly(good));
        System.out.println("bad:  window " + window(bad, Long.MIN_VALUE, Long.MAX_VALUE)
                + ", inorder " + inorderCheck(bad) + ", parent-only " + parentOnly(bad));
        System.out.println("MIN_VALUE node: long bounds "
                + window(edge, Long.MIN_VALUE, Long.MAX_VALUE)
                + ", int bounds " + windowInt(edge, Integer.MIN_VALUE, Integer.MAX_VALUE));
    }
}
\`\`\`

\`\`\`output @run-bst-ordered-set-validate
good: window true, inorder true, parent-only true
bad:  window false, inorder false, parent-only true
MIN_VALUE node: long bounds true, int bounds false
\`\`\`

Two lies in that output, both instructive: \`parent-only\` calls the broken tree
valid, and \`int bounds\` calls a single legal node invalid.

## Kth smallest, successor, predecessor

Since inorder is sorted, the k-th smallest is the k-th node an inorder walk
visits. Do not collect the whole list — walk with the explicit stack and stop.

\`\`\`java
int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> st = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !st.isEmpty()) {
        while (cur != null) { st.push(cur); cur = cur.left; }  // dive left, remembering
        cur = st.pop();
        if (--k == 0) return cur.val;                          // the k-th visit
        cur = cur.right;
    }
    return -1;
}
\`\`\`

That loop paused between calls is
[Binary Search Tree Iterator](problem:binary-search-tree-iterator) — \`next()\` is
one iteration, and the stack is O(h), not O(n). If the tree is modified often
and \`kthSmallest\` is asked often, store a subtree size in each node and descend:
compare \`k\` with the left subtree's size and you skip whole branches.

The **successor** of \`x\` is the smallest value greater than \`x\`, and you do not
need to find \`x\` first. Walk down remembering every node you turned left at:

\`\`\`java
Integer higher(TreeNode n, int x) {          // successor: smallest value > x
    Integer best = null;
    while (n != null) {
        if (n.val > x) { best = n.val; n = n.left; }   // a candidate — try for a smaller one
        else n = n.right;                              // too small, the answer is to the right
    }
    return best;                                       // null when x is the maximum
}
\`\`\`

Flip both comparisons and you have the predecessor. Change \`>\` to \`>=\` and it
becomes the **ceiling** — smallest value not less than \`x\` — and the mirror is
the **floor**. Those four names are exactly what \`TreeMap\` calls its methods,
which is not a coincidence.

\`\`\`java Bst.java @run-bst-ordered-set-bst
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class Bst {

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    static TreeNode insert(TreeNode n, int key) {
        if (n == null) return new TreeNode(key);
        if (key < n.val) n.left = insert(n.left, key);
        else if (key > n.val) n.right = insert(n.right, key);
        return n;
    }

    static boolean contains(TreeNode n, int key) {
        while (n != null && n.val != key) n = key < n.val ? n.left : n.right;
        return n != null;
    }

    static TreeNode delete(TreeNode n, int key) {
        if (n == null) return null;
        if (key < n.val) n.left = delete(n.left, key);
        else if (key > n.val) n.right = delete(n.right, key);
        else {
            if (n.left == null) return n.right;
            if (n.right == null) return n.left;
            TreeNode succ = n.right;
            while (succ.left != null) succ = succ.left;
            n.val = succ.val;
            n.right = delete(n.right, succ.val);
        }
        return n;
    }

    static void inorder(TreeNode n, List<Integer> out) {
        if (n == null) return;
        inorder(n.left, out);
        out.add(n.val);
        inorder(n.right, out);
    }

    static List<Integer> sorted(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        inorder(root, out);
        return out;
    }

    static int kthSmallest(TreeNode root, int k) {
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop();
            if (--k == 0) return cur.val;
            cur = cur.right;
        }
        return -1;
    }

    static Integer higher(TreeNode n, int x) {
        Integer best = null;
        while (n != null) {
            if (n.val > x) { best = n.val; n = n.left; }
            else n = n.right;
        }
        return best;
    }

    public static void main(String[] args) {
        TreeNode root = null;
        for (int v : new int[] { 8, 3, 10, 1, 6, 14, 4, 7, 13 }) root = insert(root, v);

        System.out.println("inorder       " + sorted(root));
        System.out.println("contains 6/5  " + contains(root, 6) + " / " + contains(root, 5));
        System.out.println("3rd smallest  " + kthSmallest(root, 3));
        System.out.println("after 8, 9    " + higher(root, 8) + " / " + higher(root, 9));
        System.out.println("after 14      " + higher(root, 14));

        root = delete(root, 1);          // a leaf
        System.out.println("delete 1      " + sorted(root));
        root = delete(root, 14);         // one child, on the left
        System.out.println("delete 14     " + sorted(root));
        root = delete(root, 6);          // two children: 4 and 7
        System.out.println("delete 6      " + sorted(root));
        System.out.println("root, still   " + root.val);
    }
}
\`\`\`

\`\`\`output @run-bst-ordered-set-bst
inorder       [1, 3, 4, 6, 7, 8, 10, 13, 14]
contains 6/5  true / false
3rd smallest  4
after 8, 9    10 / 10
after 14      null
delete 1      [3, 4, 6, 7, 8, 10, 13, 14]
delete 14     [3, 4, 6, 7, 8, 10, 13]
delete 6      [3, 4, 7, 8, 10, 13]
root, still   8
\`\`\`

Printing the inorder sequence after every change is how you inspect a search
tree: if an operation breaks the invariant, that print is where it shows.

## Why the library's tree is balanced

Insert 1, 2, 3, 4, 5 in that order into the code above and look at what you get:

\`\`\`text
1
 \\
  2
   \\
    3
     \\
      4
       \\
        5      h = n. Every search walks the whole thing.
\`\`\`

Sorted input is not an unusual case; it is one of the first things a test
harness tries. A plain BST degenerates into a linked list, and every O(h)
operation quietly becomes O(n).

![Sorted input turns a hand-written BST into a linked list](diagrams/bst-ordered-set-notes-degenerate.jpg)

The fix is rebalancing: after each insert or delete, rotate the tree so that no
path is much longer than another. \`TreeMap\` and \`TreeSet\` are **red-black
trees**, which keep h ≤ 2·log₂(n + 1) by colouring nodes and rotating on the way
back up. You will not be asked to implement one. You are expected to know that
the library's is balanced, that yours is not, and what that costs.
[Balance a Binary Search Tree](problem:balance-a-binary-search-tree) is the
cheap version: read the values out in order, rebuild from the middle.

## TreeMap and TreeSet

![floorKey, ceilingKey, higherKey and lowerKey on a sorted key set](diagrams/bst-ordered-set-notes-navigation.jpg)

This is the API worth memorising. \`TreeMap\` keeps its keys sorted and gives you
navigation and range views over them; \`TreeSet\` is the same thing without
values.

| You want | Write |
|---|---|
| Largest key ≤ k | \`map.floorKey(k)\` |
| Smallest key ≥ k | \`map.ceilingKey(k)\` |
| Strictly greater than k | \`map.higherKey(k)\` |
| Strictly smaller than k | \`map.lowerKey(k)\` |
| Smallest, largest key | \`map.firstKey()\`, \`map.lastKey()\` — throw when empty |
| The same as entries | \`map.firstEntry()\`, \`map.lastEntry()\` — return \`null\` when empty |
| Take the smallest, largest | \`map.pollFirstEntry()\`, \`map.pollLastEntry()\` |
| Everything below k | \`map.headMap(k)\` — exclusive; \`headMap(k, true)\` includes k |
| Everything from k up | \`map.tailMap(k)\` — inclusive; \`tailMap(k, false)\` excludes k |
| A window | \`map.subMap(lo, true, hi, false)\` |
| Reverse order | \`map.descendingMap()\`, \`map.descendingKeySet()\` |
| The set forms | \`floor\`, \`ceiling\`, \`higher\`, \`lower\`, \`first\`, \`last\`, \`pollFirst\`, \`pollLast\`, \`headSet\`, \`tailSet\`, \`subSet\` |
| Sort by something else | \`new TreeMap<>(Comparator.comparingInt(...))\` |

Four things to know before you use them. The navigation methods return \`null\`
when nothing qualifies, so the result is \`Integer\`, not \`int\`, and unboxing it
without a null check throws. The views — \`headMap\`, \`subMap\` and friends — are
*live windows* onto the map, not copies, so writing through one writes through
to the map. \`subMap(lo, hi).size()\` walks the window, so counting a range is
O(range), not O(log n) — that is what a
[Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) is for. And when
you only ever want the smallest or largest, a [heap](#/dsa/heaps/notes) does
that job with a smaller constant.

\`\`\`java Ordered.java @run-bst-ordered-set-ordered
import java.util.List;
import java.util.TreeMap;
import java.util.TreeSet;

public class Ordered {

    public static void main(String[] args) {
        TreeMap<Integer, String> m = new TreeMap<>();
        m.put(30, "thirty");
        m.put(10, "ten");
        m.put(40, "forty");
        m.put(20, "twenty");

        System.out.println("keys             " + m.keySet());       // sorted, whatever the order in
        System.out.println("floorKey(25)     " + m.floorKey(25));
        System.out.println("ceilingKey(25)   " + m.ceilingKey(25));
        System.out.println("floorKey(20)     " + m.floorKey(20));   // 20 qualifies for floor
        System.out.println("higherKey(20)    " + m.higherKey(20));  // but not for higher
        System.out.println("lowerKey(20)     " + m.lowerKey(20));
        System.out.println("lowerKey(10)     " + m.lowerKey(10));   // nothing below: null
        System.out.println("first, last key  " + m.firstKey() + ", " + m.lastKey());
        System.out.println("firstEntry       " + m.firstEntry());
        System.out.println("headMap(30)      " + m.headMap(30));
        System.out.println("headMap(30,true) " + m.headMap(30, true));
        System.out.println("tailMap(20)      " + m.tailMap(20));
        System.out.println("subMap(15, 35)   " + m.subMap(15, 35));
        System.out.println("descendingMap    " + m.descendingMap());
        System.out.println("pollFirstEntry   " + m.pollFirstEntry() + ", left " + m.keySet());

        TreeSet<Integer> s = new TreeSet<>(List.of(1, 4, 9, 16, 25));
        System.out.println("set floor(8)     " + s.floor(8));
        System.out.println("set ceiling(8)   " + s.ceiling(8));
        System.out.println("set subSet(2,10) " + s.subSet(2, 10));
        System.out.println("set pollLast     " + s.pollLast() + ", left " + s);
    }
}
\`\`\`

\`\`\`output @run-bst-ordered-set-ordered
keys             [10, 20, 30, 40]
floorKey(25)     20
ceilingKey(25)   30
floorKey(20)     20
higherKey(20)    30
lowerKey(20)     10
lowerKey(10)     null
first, last key  10, 40
firstEntry       10=ten
headMap(30)      {10=ten, 20=twenty}
headMap(30,true) {10=ten, 20=twenty, 30=thirty}
tailMap(20)      {20=twenty, 30=thirty, 40=forty}
subMap(15, 35)   {20=twenty, 30=thirty}
descendingMap    {40=forty, 30=thirty, 20=twenty, 10=ten}
pollFirstEntry   10=ten, left [20, 30, 40]
set floor(8)     4
set ceiling(8)   9
set subSet(2,10) [4, 9]
set pollLast     25, left [1, 4, 9, 16]
\`\`\`

## What it costs

| Operation | Balanced | Degenerate | Note |
|---|---|---|---|
| \`search\`, \`insert\`, \`delete\` | O(log n) | O(n) | One root-to-leaf walk |
| \`floor\`, \`ceiling\`, \`higher\`, \`lower\` | O(log n) | O(n) | The same walk, remembering candidates |
| Inorder traversal | O(n) | O(n) | Every node once |
| k-th smallest, by walking | O(h + k) | O(n) | O(log n) if nodes store subtree sizes |
| Range view, then iterate it | O(log n + m) | O(n) | \`m\` is how many keys you actually touch |
| Building from n inserts | O(n log n) | O(n²) | The quadratic case is sorted input |
| Building from a sorted array | O(n) | — | Take the middle as the root, recurse |

Space is O(n) for the nodes and O(h) for any recursion over them. \`TreeMap\`
costs more per entry than \`HashMap\` and its lookups are O(log n) rather than
O(1) — you pay that for ordering, so if you never ask an ordered question, use
the [hash table](#/dsa/hash-tables/notes).

## The mistakes, in the order people make them

1. **Validating against the parent only.** The invariant is about subtrees.
   Carry a window, or check the inorder sequence.
2. **\`Integer.MIN_VALUE\` as an initial bound,** with \`Integer.MIN_VALUE\` in the
   data. Use \`long\` bounds, or a nullable previous node.
3. **Deleting a two-child node by promoting a child.** It breaks the ordering
   below. Copy the inorder successor's value, then delete the successor.
4. **Forgetting to reassign.** \`insert(n.left, key)\` on its own does nothing to
   a \`null\` child. It must be \`n.left = insert(n.left, key)\`.
5. **Collecting every value to answer "the k-th".** Walk with a stack and stop
   at k. Same for "the closest value" — that is a descent, not a scan.
6. **Unboxing a navigation result.** \`int k = map.floorKey(x)\` throws
   \`NullPointerException\` when nothing is below \`x\`. Keep it as \`Integer\` and
   test.
7. **\`firstKey()\` on an empty map.** It throws \`NoSuchElementException\`;
   \`firstEntry()\` returns \`null\`. Pick the one whose failure you want.
8. **Assuming your own BST is balanced.** Sorted input makes it a list. If the
   problem builds a tree from data you do not control, use \`TreeMap\`.
9. **Using \`subMap(...).size()\` in a loop.** It counts by walking, so the loop
   is quadratic in disguise.

## Working one from the sheet

[My Calendar I](problem:my-calendar-i): book half-open intervals \`[start, end)\`,
one at a time, refusing any that overlaps something already booked.

Keeping a list and comparing against all of it is O(n) per booking. Because the
bookings never overlap, a \`TreeMap\` keyed by start time keeps them in order, and
only two neighbours can possibly clash: the last booking that starts at or
before you, and the first that starts after you.

- \`floorKey(start)\` — the booking that begins at or before yours. It clashes if
  it has not finished by the time yours starts: \`end of that > start\`.
- \`ceilingKey(start)\` — the next booking along. It clashes if it begins before
  yours ends: \`that start < end\`.

Two lookups, both O(log n), and nothing else can overlap. That argument — sorted
by start, check only the neighbours — is the whole of
[intervals](#/dsa/intervals/notes).

\`\`\`java Calendar.java @run-bst-ordered-set-calendar
import java.util.TreeMap;

public class Calendar {

    /** Booked intervals [start, end), keyed by start. Never overlapping. */
    static final TreeMap<Integer, Integer> diary = new TreeMap<>();

    static boolean book(int start, int end) {
        Integer before = diary.floorKey(start);
        if (before != null && diary.get(before) > start) return false;   // it runs into us
        Integer after = diary.ceilingKey(start);
        if (after != null && after < end) return false;                  // we run into it
        diary.put(start, end);
        return true;
    }

    public static void main(String[] args) {
        int[][] asked = { { 10, 20 }, { 15, 25 }, { 20, 30 }, { 5, 10 }, { 8, 12 }, { 30, 40 } };
        for (int[] a : asked)
            System.out.println("book [" + a[0] + ", " + a[1] + ")   " + book(a[0], a[1]));
        System.out.println("diary " + diary);
    }
}
\`\`\`

\`\`\`output @run-bst-ordered-set-calendar
book [10, 20)   true
book [15, 25)   false
book [20, 30)   true
book [5, 10)   true
book [8, 12)   false
book [30, 40)   true
diary {5=10, 10=20, 20=30, 30=40}
\`\`\`

\`[15, 25)\` is refused because \`[10, 20)\` is still running. \`[20, 30)\` is
accepted, because the intervals are half-open and 20 is not inside \`[10, 20)\`.
\`[8, 12)\` is refused by the floor check even though its start is free.
[My Calendar II](problem:my-calendar-ii) allows a double booking and refuses a
triple, and the same map holds a running count of overlaps at each boundary.

## How to work through the topic

1. [Search in a Binary Search Tree](problem:search-in-a-binary-search-tree) and
   [Range Sum of BST](problem:range-sum-of-bst). Both are "let the invariant
   prune a subtree". The second must skip branches entirely — a full traversal
   that filters gets the right answer for the wrong reason.
2. [Convert Sorted Array to Binary Search Tree](problem:convert-sorted-array-to-binary-search-tree),
   [Increasing Order Search Tree](problem:increasing-order-search-tree). Sorted
   order in, and sorted order out.
3. [Minimum Absolute Difference in BST](problem:minimum-absolute-difference-in-bst),
   [Find Mode in Binary Search Tree](problem:find-mode-in-binary-search-tree).
   Both are one inorder walk keeping the previous node. Write the walk once and
   reuse it.
4. [Validate Binary Search Tree](problem:validate-binary-search-tree). Do it
   both ways, and try to break each one.
5. [Delete Node in a BST](problem:delete-node-in-a-bst) and
   [Trim a Binary Search Tree](problem:trim-a-binary-search-tree). The three
   delete cases in full, then the same reassignment idiom used to prune.
6. [Kth Smallest Element in a BST](problem:kth-smallest-element-in-a-bst), then
   [Binary Search Tree Iterator](problem:binary-search-tree-iterator). The
   second is the first one paused between calls, and it is where the explicit
   stack earns its place.
7. [My Calendar I](problem:my-calendar-i) and
   [Contains Duplicate III](problem:contains-duplicate-iii). The \`TreeMap\` half.
   The second wants a \`TreeSet\` of the last \`k\` values with
   \`ceiling(a[i] - t)\` — use \`long\` for that subtraction.
8. The hard band: [My Calendar II](problem:my-calendar-ii),
   [Closest Binary Search Tree Value II](problem:closest-binary-search-tree-value-ii),
   [Count of Smaller Numbers After Self](problem:count-of-smaller-numbers-after-self),
   [Range Module](problem:range-module). The third is usually done with a
   [Fenwick tree](#/dsa/fenwick-tree-binary-indexed-tree/notes) instead, and
   comparing the two solutions is worth an evening on its own.
`;export{e as default};