var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The structure

- A node holds a value and a reference to the next one. The last \`next\` is
  \`null\`. The list is its head reference.
- No indices. The k-th node costs O(k). Splicing given the previous node costs
  O(1) — that is the only reason the structure exists.
- \`prev.next = prev.next.next\` unlinks. \`x.next = prev.next; prev.next = x;\`
  inserts, in that order.
- \`==\` compares identity, which is what cycle and intersection questions mean.
- Walk with a local reference, never with \`head\` itself.
- \`java.util.LinkedList\` has an O(n) \`get(i)\`. Interviews mean the \`ListNode\`
  class, and a real deque is \`ArrayDeque\`.

## Reverse

\`\`\`java
ListNode prev = null, cur = head;
while (cur != null) {
    ListNode next = cur.next;   // save before you destroy
    cur.next = prev;
    prev = cur;
    cur = next;
}
return prev;                    // cur is null at the end
\`\`\`

- Save \`next\` first or you lose the rest of the list. That line is the bug.
- Return \`prev\`, not \`cur\`.
- Recursive: reverse the tail, then \`head.next.next = head; head.next = null;\`
  and return the head that came back. O(n) stack — avoid on long inputs.

## Dummy head

![One extra node in front removes every what-if-it-is-the-first-node case](diagrams/linked-list-revision-dummy-head.jpg)

\`\`\`java
ListNode dummy = new ListNode(0);
dummy.next = head;
ListNode prev = dummy;
while (prev.next != null)
    if (prev.next.val == target) prev.next = prev.next.next;
    else prev = prev.next;
return dummy.next;
\`\`\`

- Removes every "what if it is the first node" case, in one extra node.
- Return \`dummy.next\`, never \`head\` — the head may be gone.
- Advance \`prev\` only in the \`else\`, or you skip runs of matches.
- The same node builds a list: keep a \`tail\`, append, return \`dummy.next\`.

## Two speeds

![Where the slow reference stops depends on where the fast one started](diagrams/linked-list-revision-which-middle.jpg)

\`\`\`java
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
\`\`\`

- Condition order matters — \`fast != null\` first, or \`fast.next\` throws.
- \`fast = head\` gives the **second** middle; \`fast = head.next\` gives the first,
  which is the one you want before cutting.
- Add \`if (slow == fast) return true;\` inside and it is cycle detection, O(1)
  space against a \`HashSet\`'s O(n).
- They must meet because the gap shrinks by exactly one per step.

## Cycle start

- On meeting, put one pointer back at \`head\`, leave the other at the meeting
  point, advance both one step. They meet at the start of the cycle.
- Why: slow walked \`a + b\`, fast walked \`2(a + b) = a + b + kL\`, so \`a = kL - b\`
  — \`a\` steps from the meeting point is \`k - 1\` laps plus the way round to the
  start.
- \`a\` = head to cycle start, \`b\` = cycle start to meeting point, \`L\` = cycle
  length.
- The same trick on \`i -> a[i]\` solves Find the Duplicate Number in O(1) space.

## Merge, and the gap of n

\`\`\`java
while (a != null && b != null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; } else { tail.next = b; b = b.next; }
    tail = tail.next;
}
tail.next = (a != null) ? a : b;   // one assignment, not a second loop
\`\`\`

- \`<=\` keeps equal elements in order, which is what makes merge sort stable.
- Nth from the end: start both at the dummy, open a gap of **n + 1**, move
  together, \`back.next = back.next.next\`. The extra one is because you need the
  node before the target.

## Compositions

- Palindrome: middle, reverse the second half, compare.
- Reorder: middle, reverse the second half, weave — drive the weave on the
  second half, which is never the longer one.
- Sort List: middle, cut, sort each half, merge. O(n log n), O(log n) stack.
- Reverse in k-groups: check \`k\` remain, reverse the block, reattach.
- Always **cut** after finding the middle — \`slow.next = null\` — or the halves
  stay joined.

## The bugs

- \`cur.next\` overwritten before \`next\` is saved.
- \`fast.next != null\` tested before \`fast != null\`.
- \`return head\` from a function that has a dummy.
- \`prev\` advanced after a splice.
- Gap of \`n\` rather than \`n + 1\`.
- No guard for \`null\` and for a single node.
- Recursion on 10⁵ nodes: \`StackOverflowError\`.

## Costs

| Move | Time | Space |
|---|---|---|
| Reach node k | O(k) | O(1) |
| Splice given \`prev\` | O(1) | O(1) |
| Reverse, iterative | O(n) | O(1) |
| Find middle, detect cycle | O(n) | O(1) |
| Merge two sorted | O(n + m) | O(1) |
| Merge sort a list | O(n log n) | O(log n) |
| Merge k lists, heap | O(N log k) | O(k) |
`;export{e as default};