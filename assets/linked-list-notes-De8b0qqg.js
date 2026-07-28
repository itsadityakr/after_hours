var e=`An array gives you instant access to any element and charges for it up front:
the boxes are one block of memory, fixed in length, so inserting at the front
means shifting everything along. A chain of nodes makes the opposite bargain.
Each value sits in its own small object that also holds a reference to the next
one, so the chain can be spliced anywhere in constant time — and the price is
that there are no indices at all. To reach the tenth value you walk past nine.

That single trade decides the whole topic. Because there is no \`a[i]\`, every
solution is defined by *what you are still holding a reference to*. Lose your
grip on a node and it is gone; there is no way back and nothing to look it up
in. Most of the bugs here are one assignment happening before another.

The good news is that four moves solve nearly everything: reverse a chain with
three variables, put a fake node in front so the head stops being a special
case, run two references at different speeds, and merge two chains by taking the
smaller head. Reorder, sort, palindrome, k-group, cycle start — all compositions
of those four.

## What a node is

A node is an object with two fields: a value, and a reference to the next node.
The last node's \`next\` is \`null\`, and that \`null\` is how you know you have
reached the end. A list *is* a reference to its first node.

\`\`\`java
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
\`\`\`

That is the exact class the problems hand you, three constructors and all. Two
Java points behind a lot of confusion. **\`next\` holds a reference, not a node**:
\`a.next = b\` makes \`a\` point at whatever object \`b\` names, and duplicates
nothing, so two variables routinely name the same node. And **\`null\` is a legal
value for it**, so reading \`x.next\` when \`x\` is \`null\` throws
\`NullPointerException\` — every loop condition in this topic is really a question
about how far ahead you are about to look.

\`\`\`text
head
 |
 v
[1|·]-->[2|·]-->[3|·]-->[4|/]        "/" means null
\`\`\`

| Operation | Array | Linked list |
|---|---|---|
| Read the k-th element | O(1) | O(k) — you walk |
| Insert or delete **given the node before it** | O(n), everything shifts | O(1), two assignments |
| Insert at the front | O(n) | O(1) |
| Insert at the back | O(1) amortised | O(n), unless you keep a tail |
| Search for a value | O(n) | O(n) |
| Memory per element | the value | the value, a reference, object overhead |

Read the second row again, because it is the only reason this structure exists.
Splicing a node out is \`prev.next = prev.next.next\` — two references moved, no
shifting, no reallocation, and it costs the same on ten elements or ten million.
That is why [LFU Cache](problem:lfu-cache) and every other "move this item to
the front in O(1)" design question is built on a doubly linked list.

The catch is the word *given*. If you have to find the node first, finding it is
O(n) and the O(1) splice is irrelevant.
[Delete Node in a Linked List](problem:delete-node-in-a-linked-list) is a small
joke about exactly that: you are handed the node to delete and no reference to
its predecessor, so you cannot unlink it — you copy the next node's value over
your own and unlink *that* one instead.

## Walking one, and printing it

Take a local reference and move it along until it falls off the end. Use a local
variable, not \`head\` itself; walking \`head\` forward destroys your only reference
to the start, and you will want it again.

\`\`\`java
for (ListNode cur = head; cur != null; cur = cur.next)
    System.out.println(cur.val);
\`\`\`

Because these problems build lists rather than arrays, every program below needs
two helpers: one that makes a list from an \`int[]\` and one that prints it. Write
them once and stop thinking about them.

\`\`\`java Basics.java @run-linked-list-basics
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Basics {

    /** Build a list from an array. Returns the head, or null for an empty array. */
    static ListNode of(int... values) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (int v : values) {
            tail.next = new ListNode(v);
            tail = tail.next;
        }
        return dummy.next;
    }

    /** "1 -> 2 -> 3 -> null", so you can see what actually happened. */
    static String print(ListNode head) {
        StringBuilder sb = new StringBuilder();
        for (ListNode cur = head; cur != null; cur = cur.next) sb.append(cur.val).append(" -> ");
        return sb.append("null").toString();
    }

    /** The three-pointer reversal. */
    static ListNode reverse(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;   // save it first
            cur.next = prev;            // turn the arrow round
            prev = cur;                 // shuffle both forward
            cur = next;
        }
        return prev;                    // cur is null, prev is the new head
    }

    /** The same thing, recursively. */
    static ListNode reverseRecursive(ListNode head) {
        if (head == null || head.next == null) return head;
        ListNode newHead = reverseRecursive(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }

    /** Slow moves one, fast moves two. Of two middles this returns the second. */
    static ListNode middle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    public static void main(String[] args) {
        System.out.println("built      " + print(of(1, 2, 3, 4, 5)));
        System.out.println("reversed   " + print(reverse(of(1, 2, 3, 4, 5))));
        System.out.println("recursive  " + print(reverseRecursive(of(1, 2, 3))));
        System.out.println("one node   " + print(reverse(of(7))));
        System.out.println("empty      " + print(reverse(null)));
        System.out.println("middle of 5  " + middle(of(1, 2, 3, 4, 5)).val);
        System.out.println("middle of 6  " + middle(of(1, 2, 3, 4, 5, 6)).val);
    }
}
\`\`\`

\`\`\`output @run-linked-list-basics
built      1 -> 2 -> 3 -> 4 -> 5 -> null
reversed   5 -> 4 -> 3 -> 2 -> 1 -> null
recursive  3 -> 2 -> 1 -> null
one node   7 -> null
empty      null
middle of 5  3
middle of 6  4
\`\`\`

Note what \`of\` already uses: a throwaway node in front, so the loop never has to
ask whether this is the first one. That is the dummy head, and it is coming.

## Reversing: the three-pointer dance

![Turning the arrow round before saving next destroys the rest of the list](diagrams/linked-list-notes-save-next-first.jpg)

This is the one to be able to write half asleep. You need three references
because turning an arrow round destroys the only way forward.

\`\`\`text
1 -> 2 -> 3 -> null

start        prev = null   cur = 1

step 1       next = 2               save 2; 1.next is about to change
             1.next = null          the arrow now points backwards
             prev = 1   cur = 2     null <- 1        2 -> 3 -> null

step 2       next = 3
             2.next = 1
             prev = 2   cur = 3     null <- 1 <- 2   3 -> null

step 3       next = null
             3.next = 2
             prev = 3   cur = null  null <- 1 <- 2 <- 3

cur is null, so the loop ends and prev is the new head: 3
\`\`\`

Four lines, and the order is the whole thing. \`next = cur.next\` is the only
surviving route to the rest of the list. \`cur.next = prev\` is the actual
reversal. Then \`prev\` and \`cur\` both move forward together. Swap the first two
and \`cur.next\` is already \`prev\` by the time you save it, so you walk backwards
into what you have just reversed and loop for ever. Return \`prev\`, not \`cur\` —
when the loop ends \`cur\` is \`null\` and \`prev\` is the last node visited, which is
the new head.

The recursive version says the same thing differently: reverse everything after
the head, then make the second node point back at the head.

\`\`\`java
if (head == null || head.next == null) return head;   // 0 or 1 nodes: done
ListNode newHead = reverseRecursive(head.next);
head.next.next = head;    // the node after me now points at me
head.next = null;         // and I become the tail
return newHead;           // the new head never changes on the way back up
\`\`\`

\`head.next.next = head\` is worth reading twice. At that moment \`head.next\` is
still the *original* next node, which after the recursive call has become the
tail of the reversed remainder — so appending \`head\` to it is exactly right. It
costs O(n) stack, which is why the iterative form is the default answer to
[Reverse Linked List](problem:reverse-linked-list).

## The dummy head

Every operation that can affect the first node has an awkward case: removing the
head means returning a different head, and inserting before it makes the
caller's reference stale. The cure is one extra node in front of the list — do
the work uniformly, return \`dummy.next\`.

\`\`\`java
ListNode dummy = new ListNode(0);
dummy.next = head;
ListNode prev = dummy;
while (prev.next != null) {
    if (prev.next.val == target) prev.next = prev.next.next;   // splice it out
    else prev = prev.next;
}
return dummy.next;   // not head — head may have been removed
\`\`\`

Without it you write three pieces of code where there should be one: a loop at
the top to strip leading matches, a null check for a list that becomes empty,
then the main loop. [Remove Linked List Elements](problem:remove-linked-list-elements)
with \`head = [7,7,7,7]\` and \`target = 7\` catches every version that skips it.

Two habits go with it. Advance \`prev\` **only in the \`else\` branch** — after a
splice the new \`prev.next\` has not been examined, and skipping it misses runs of
consecutive matches. And return \`dummy.next\` rather than \`head\`, always. The
same node is also how you *build* a list, which is what \`of\` above does and what
[Merge Two Sorted Lists](problem:merge-two-sorted-lists) does: keep a \`tail\`,
append to \`tail.next\`, move \`tail\` along, hand back \`dummy.next\`.

## Two speeds

![The slow reference reaches the middle as the fast one reaches the end](diagrams/linked-list-notes-two-speeds.svg)

Run one reference at one node per step and another at two. Two things fall out.

**The middle.** When the fast one reaches the end the slow one is halfway.

\`\`\`java
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
}
\`\`\`

The condition order is load-bearing: \`fast != null\` must come first, because
\`&&\` stops at the first false and \`fast.next\` would otherwise throw. In this
exact form an even-length list leaves \`slow\` on the **second** of the two
middles, which is what [Middle of the Linked List](problem:middle-of-the-linked-list)
asks for. Start \`fast\` at \`head.next\` instead and you get the first middle,
which is what you want when you are about to cut the list in half.

**A cycle.** If the list loops back on itself the fast reference eventually laps
the slow one and they land on the same node; if it does not, the fast one falls
off the end. Add \`if (slow == fast) return true;\` inside that same loop and you
have [Linked List Cycle](problem:linked-list-cycle) in O(1) space, where the
obvious \`HashSet\` of visited nodes is O(n).

They must meet because, once both are inside the loop, the gap between them
shrinks by exactly one node per step — fast gains one on slow each step, and a
gap that shrinks by one reaches zero. Fast cannot step *over* slow precisely
because the gap changes by one and not by two.

\`slow == fast\` compares references — the same object, not the same value. That
is the point, and it is the same reason
[Intersection of Two Linked Lists](problem:intersection-of-two-linked-lists)
asks where two lists physically join rather than where their values agree.

## Where the cycle starts

[Linked List Cycle II](problem:linked-list-cycle-ii) wants the first node of the
loop, and phase two finds it with no extra memory: **put one reference back at
the head, leave the other at the meeting point, advance both one step at a time.
They meet at the start of the cycle.**

It looks like a trick until you count the steps.

\`\`\`text
        a                 b
head -------> S ---------------> M          a = head to the cycle start
              ^                  |          b = cycle start to the meeting point
              |     L - b        |          L = length of the cycle
              +------------------+

slow walked  a + b
fast walked  2(a + b), and also a + b + kL for some whole number of laps k

    2(a + b) = a + b + kL   ->   a + b = kL   ->   a = kL - b
\`\`\`

So walking \`a\` steps forward from \`M\` is the same as walking \`kL - b\` steps
round the cycle: \`k - 1\` complete laps and then the \`L - b\` steps that carry you
from \`M\` back round to \`S\`. A pointer starting at the head reaches \`S\` in \`a\`
steps by definition. Both arrive at \`S\` together, so the node where they meet is
the start of the cycle.

\`\`\`java Cycle.java @run-linked-list-cycle
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Cycle {

    static ListNode of(int... values) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (int v : values) { tail.next = new ListNode(v); tail = tail.next; }
        return dummy.next;
    }

    /** Point the last node back at position "at", counting from 0. -1 leaves it straight. */
    static ListNode withCycle(int at, int... values) {
        ListNode head = of(values);
        if (at < 0) return head;
        ListNode target = head, tail = head;
        for (int i = 0; i < at; i++) target = target.next;
        while (tail.next != null) tail = tail.next;
        tail.next = target;
        return head;
    }

    /** The node where the cycle begins, or null if the list is straight. */
    static ListNode cycleStart(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {                 // phase two
                ListNode walker = head;
                while (walker != slow) {
                    walker = walker.next;
                    slow = slow.next;
                }
                return walker;
            }
        }
        return null;
    }

    static void report(String label, ListNode head) {
        ListNode start = cycleStart(head);
        System.out.println(label + (start == null ? "no cycle" : "cycle starts at " + start.val));
    }

    public static void main(String[] args) {
        report("straight   ", withCycle(-1, 3, 2, 0, -4));
        report("loop at 1  ", withCycle(1, 3, 2, 0, -4));
        report("loop at 0  ", withCycle(0, 1, 2));
        report("self loop  ", withCycle(0, 9));
        report("single     ", of(5));
        report("empty      ", null);
    }
}
\`\`\`

\`\`\`output @run-linked-list-cycle
straight   no cycle
loop at 1  cycle starts at 2
loop at 0  cycle starts at 1
self loop  cycle starts at 9
single     no cycle
empty      no cycle
\`\`\`

The same argument, applied to an array read as \`i -> a[i]\`, is the O(1)-space
answer to [Find the Duplicate Number](problem:find-the-duplicate-number). The
list is imaginary; the cycle is not.

## Merging, and the gap of n

Two more standard moves, both built on the dummy head.

**Merge two sorted lists.** Take the smaller of the two heads and append it. No
new nodes — you relink the ones you have.

\`\`\`java
ListNode dummy = new ListNode(0), tail = dummy;
while (a != null && b != null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else                { tail.next = b; b = b.next; }
    tail = tail.next;
}
tail.next = (a != null) ? a : b;   // one list is empty; attach the rest of the other
return dummy.next;
\`\`\`

That last line is the part people write as a second loop. There is no need — the
remaining nodes are already linked in order, so one assignment attaches all of
them. Use \`<=\` rather than \`<\` to keep equal elements in their original relative
order, which is what makes a merge sort stable.

**The nth node from the end.** You cannot count backwards, but you can hold two
references a fixed distance apart and move them together: when the front one
falls off the end, the back one is \`n\` from it.

\`\`\`java
ListNode dummy = new ListNode(0);
dummy.next = head;
ListNode front = dummy, back = dummy;
for (int i = 0; i <= n; i++) front = front.next;   // open a gap of n + 1
while (front != null) { front = front.next; back = back.next; }
back.next = back.next.next;                        // back is the node before the target
return dummy.next;
\`\`\`

The gap is \`n + 1\` and not \`n\`, because to unlink a node you need the node
*before* it. Starting both at the dummy is what makes removing the actual head
work without a special case: with \`n\` equal to the length, \`back\` finishes on
the dummy itself. That is
[Remove Nth Node From End of List](problem:remove-nth-node-from-end-of-list) in
one pass, and it is the same fixed-gap idea as
[two pointers](#/dsa/two-pointers/notes) on an array.

![A fixed gap of n plus one, so the trailing reference lands before the target](diagrams/linked-list-notes-gap-of-n.svg)

## Compositions

The medium and hard problems are mostly two or three of the above run in order.
Once you see that, they stop being separate problems.

| Problem | Is |
|---|---|
| [Palindrome Linked List](problem:palindrome-linked-list) | find the middle, reverse the second half, walk both halves together |
| [Reorder List](problem:reorder-list) | find the middle, reverse the second half, weave the two alternately |
| [Sort List](problem:sort-list) | middle, cut, sort each half, merge — merge sort, O(n log n) |
| [Reverse Linked List II](problem:reverse-linked-list-ii) | dummy, walk to \`left - 1\`, reverse that many nodes, reattach both ends |
| [Reverse Nodes in k-Group](problem:reverse-nodes-in-k-group) | check \`k\` nodes remain, reverse the block, loop on the rest |
| [Odd Even Linked List](problem:odd-even-linked-list) | two tails built at once, then join the even chain onto the odd |
| [Partition List](problem:partition-list) | two dummies, append each node to one of them, join |
| [Merge k Sorted Lists](problem:merge-k-sorted-lists) | pairwise merge in rounds, or a heap of the k current heads |
| [Add Two Numbers](problem:add-two-numbers) | one walk, a carry, a dummy for the output |

One habit makes all of these easier: when you split a list, **cut it**. Set the
tail of the first half to \`null\` before you reverse or recurse, or the halves
still share nodes and the merge walks into itself.

For palindrome and reorder there is also a version that pushes every value onto
a [stack](#/dsa/stacks/notes) and pops them to read the list backwards. It is
O(n) space rather than O(1), and it is a fair answer when constant space has not
been asked for — say which one you are doing and why.

## Working one from the sheet

[Reorder List](problem:reorder-list): given \`1 -> 2 -> 3 -> 4 -> 5\`, produce
\`1 -> 5 -> 2 -> 4 -> 3\`. First node, then last, then second, then second-last,
inwards.

The array answer is obvious — put the nodes in an \`ArrayList\` and index from
both ends. In constant space you cannot index, so build it from three moves you
already have.

\`\`\`text
1 -> 2 -> 3 -> 4 -> 5

middle (first of two)   3
cut                     1 -> 2 -> 3        4 -> 5
reverse the tail        1 -> 2 -> 3        5 -> 4
weave                   1 -> 5 -> 2 -> 4 -> 3
\`\`\`

For the cut you want the *first* middle, so \`fast\` starts one ahead. Get that
wrong on an even-length list and the second half comes out longer than the
first, which the weave does not expect.

\`\`\`java Reorder.java @run-linked-list-reorder
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Reorder {

    static ListNode of(int... values) {
        ListNode dummy = new ListNode(0), tail = dummy;
        for (int v : values) { tail.next = new ListNode(v); tail = tail.next; }
        return dummy.next;
    }

    static String print(ListNode head) {
        StringBuilder sb = new StringBuilder();
        for (ListNode cur = head; cur != null; cur = cur.next) sb.append(cur.val).append(" -> ");
        return sb.append("null").toString();
    }

    static ListNode reverse(ListNode head) {
        ListNode prev = null, cur = head;
        while (cur != null) {
            ListNode next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev;
    }

    static void reorder(ListNode head) {
        if (head == null || head.next == null) return;

        ListNode slow = head, fast = head.next;      // one ahead: the FIRST middle
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        ListNode second = reverse(slow.next);
        slow.next = null;                            // cut, or the weave loops

        ListNode first = head;
        while (second != null) {                     // the second half is never longer
            ListNode f = first.next, s = second.next;
            first.next = second;
            second.next = f;
            first = f;
            second = s;
        }
    }

    /** Same two moves, different ending: compare the halves instead of weaving. */
    static boolean isPalindrome(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        for (ListNode back = reverse(slow), front = head; back != null; back = back.next, front = front.next)
            if (front.val != back.val) return false;
        return true;
    }

    public static void main(String[] args) {
        for (int[] values : new int[][] { { 1, 2, 3, 4, 5 }, { 1, 2, 3, 4 }, { 1, 2 }, { 9 } }) {
            ListNode list = of(values);
            reorder(list);
            System.out.println("reorder      " + print(list));
        }
        System.out.println("palindrome   " + isPalindrome(of(1, 2, 2, 1)));
        System.out.println("palindrome   " + isPalindrome(of(1, 2, 3, 2, 1)));
        System.out.println("palindrome   " + isPalindrome(of(1, 2)));
    }
}
\`\`\`

\`\`\`output @run-linked-list-reorder
reorder      1 -> 5 -> 2 -> 4 -> 3 -> null
reorder      1 -> 4 -> 2 -> 3 -> null
reorder      1 -> 2 -> null
reorder      9 -> null
palindrome   true
palindrome   true
palindrome   false
\`\`\`

The weave loop drives on \`second\`, not on \`first\`. After the cut the first half
is the same length or one longer, so the second half running out is what ends
the interleaving cleanly. Drive it on \`first\` and the last step reads a \`null\`.

## What it costs

| Move | Time | Space |
|---|---|---|
| Reach the k-th node | O(k) | O(1) |
| Insert or delete given the previous node | O(1) | O(1) |
| Reverse, iterative | O(n) | O(1) |
| Reverse, recursive | O(n) | O(n) stack |
| Find the middle, or detect a cycle | O(n) | O(1) |
| Detect a cycle with a \`HashSet\` of nodes | O(n) | O(n) |
| Merge two sorted lists | O(n + m) | O(1) |
| Merge sort a list | O(n log n) | O(log n) stack |
| Merge k lists with a heap | O(N log k) | O(k) |

Cycle detection is O(n) and not something worse: slow takes \`a\` steps to enter
the loop, and once inside the gap closes by one per step from a gap smaller than
\`L\`, so at most \`L\` more. Total under \`a + L\`, which is at most \`n\`.

## The mistakes, in the order people make them

1. **Overwriting \`cur.next\` before saving it.** The whole of the reversal bug.
   Save \`next\` on the first line of the loop body, every time.
2. **Returning \`cur\` instead of \`prev\`** from a reversal. \`cur\` is \`null\` when
   the loop ends.
3. **\`fast.next != null && fast != null\`.** The wrong order — \`&&\` runs left to
   right, so the second test never gets the chance to save you.
4. **Walking \`head\` itself**, and losing the list.
5. **Returning \`head\` from a function that has a dummy.** If the head was
   removed or replaced, \`head\` is stale. Return \`dummy.next\`.
6. **Advancing \`prev\` after a splice.** The new \`prev.next\` has not been
   examined, so runs of duplicates get missed.
7. **Forgetting to cut.** After finding the middle, \`slow.next = null\` before
   reversing or recursing, or the halves stay joined and the merge loops.
8. **A gap of \`n\` instead of \`n + 1\`** for the nth from the end. You need the
   node *before* the one you are removing.
9. **No guard for \`null\` or a single node.** Those are the first two tests here,
   not an afterthought.
10. **\`equals\` where you meant \`==\`.** Cycle and intersection questions are
    about node identity, and two distinct nodes can hold equal values.
11. **Recursing on a 10⁵-node list.** \`StackOverflowError\`. The iterative form
    exists for a reason.

## The Java you will reach for

| You want | Write |
|---|---|
| A node | \`class ListNode { int val; ListNode next; }\` |
| The two guards you always need | \`if (head == null) ...\` and \`if (head.next == null) ...\` |
| Walk | \`for (ListNode cur = head; cur != null; cur = cur.next)\` |
| Splice out the node after \`prev\` | \`prev.next = prev.next.next\` |
| Insert \`x\` after \`prev\` | \`x.next = prev.next; prev.next = x;\` — in that order |
| A dummy head | \`ListNode dummy = new ListNode(0); dummy.next = head;\` |
| Return after using a dummy | \`return dummy.next\` |
| Look two ahead safely | \`while (fast != null && fast.next != null)\` |
| Same node, not same value | \`a == b\` |
| Build a printable form | \`StringBuilder\`, appending \`cur.val\` |
| The library's version | \`java.util.LinkedList\`, which is doubly linked |
| A stack or queue of nodes | \`ArrayDeque\`, never \`Stack\` |

\`java.util.LinkedList\` is almost never the right answer in an interview: it
implements \`List\`, so \`get(i)\` exists and is O(n), which quietly turns a loop
quadratic. When a question says "linked list" it means the \`ListNode\` class
above. When you need a real deque, use \`ArrayDeque\` — see
[stacks](#/dsa/stacks/notes).

## How to work through the topic

1. [Reverse Linked List](problem:reverse-linked-list),
   [Middle of the Linked List](problem:middle-of-the-linked-list),
   [Linked List Cycle](problem:linked-list-cycle). The three primitives. Write
   the reversal from memory until it comes out right first time, both
   iteratively and recursively.
2. [Merge Two Sorted Lists](problem:merge-two-sorted-lists),
   [Remove Linked List Elements](problem:remove-linked-list-elements),
   [Remove Duplicates from Sorted List](problem:remove-duplicates-from-sorted-list).
   The dummy head, three ways. Do each one without it first so you can feel what
   it buys.
3. [Palindrome Linked List](problem:palindrome-linked-list),
   [Intersection of Two Linked Lists](problem:intersection-of-two-linked-lists),
   [Convert Binary Number in a Linked List to Integer](problem:convert-binary-number-in-a-linked-list-to-integer).
   Compositions, and the first taste of reference identity. The intersection
   trick — swap to the other list at the end — is worth the time it takes to
   convince yourself of.
4. [Remove Nth Node From End of List](problem:remove-nth-node-from-end-of-list),
   [Add Two Numbers](problem:add-two-numbers),
   [Odd Even Linked List](problem:odd-even-linked-list),
   [Partition List](problem:partition-list). Fixed gaps and several tails. All
   four are one pass and none needs nodes beyond the dummies.
5. [Linked List Cycle II](problem:linked-list-cycle-ii),
   [Reverse Linked List II](problem:reverse-linked-list-ii),
   [Remove Duplicates from Sorted List II](problem:remove-duplicates-from-sorted-list-ii).
   The versions with the awkward bit added. Draw the references before writing;
   this is where a guess falls apart.
6. [Reorder List](problem:reorder-list), [Sort List](problem:sort-list),
   [Copy List with Random Pointer](problem:copy-list-with-random-pointer). Three
   moves stacked. Sort List is merge sort in place — see
   [divide and conquer](#/dsa/divide-and-conquer/notes) — and the copy problem
   has both a map answer and a weave-the-clones-in answer worth knowing.
7. [Merge k Sorted Lists](problem:merge-k-sorted-lists),
   [Reverse Nodes in k-Group](problem:reverse-nodes-in-k-group),
   [LFU Cache](problem:lfu-cache). The hard band: a heap or a pairwise merge,
   the reversal with bookkeeping around it, and a design question that picks a
   list precisely for the O(1) splice in the first table on this page.
`;export{e as default};