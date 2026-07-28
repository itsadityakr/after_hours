var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The structure

- A complete binary tree where every node is ≤ both children. Nothing is said
  about left versus right, or about siblings. The root is the minimum.
- Stored in an array, no pointers: \`parent(i) = (i - 1) / 2\`, \`left(i) = 2i + 1\`,
  \`right(i) = 2i + 2\`.
- **Sift up** on insert: put it at the end, swap upwards while smaller than the
  parent.
- **Sift down** on remove: answer is \`a[0]\`, move the last element into the root,
  swap downwards past the **smaller** child.
- Height is exactly ⌊log₂ n⌋ — the shape rule makes degeneration impossible.

## Build cost

![Why bottom-up heapify is linear: almost every node is near the bottom](diagrams/heaps-revision-build-cost.jpg)

- Offering n elements one at a time is O(n log n).
- Sifting down from \`n/2 - 1\` back to 0 is **O(n)** — half the nodes are leaves
  and cost nothing, and n·(1/4 + 2/8 + 3/16 + …) converges to n.
- \`new PriorityQueue<>(collection)\` gives you the O(n) build. Use it.

## PriorityQueue

![Iterating a PriorityQueue gives heap order, not sorted order](diagrams/heaps-revision-iteration-order.jpg)

- \`new PriorityQueue<>()\` is a **min-heap**. \`poll\` gives the smallest.
- \`new PriorityQueue<>(Comparator.reverseOrder())\` is the max-heap.
- **Iterating it is not sorted.** \`toString\`, for-each and \`stream\` all walk the
  backing array. Only repeated \`poll\` is sorted, and it empties the heap.
- \`remove(Object)\` and \`contains\` are **O(n)** — no index, so it scans.
- \`peek\`/\`poll\` return \`null\` when empty; unboxing that is an NPE.
- No natural order for \`int[]\` — a comparator-less \`PriorityQueue<int[]>\` throws
  \`ClassCastException\` on the *second* offer.
- Not stable. Put the tiebreak in the comparator if the problem cares.

## The size-k shape

\`\`\`java
PriorityQueue<Integer> pq = new PriorityQueue<>();   // min-heap
for (int x : a) {
    pq.offer(x);
    if (pq.size() > k) pq.poll();    // keep only the k largest
}
\`\`\`

- **k largest wants a MIN-heap.** You need cheap access to the worst survivor,
  and the worst of the k largest is the smallest. k smallest wants a max-heap.
- \`pq.peek()\` is the k-th largest, for free, at every moment.
- Furthest points, most frequent, cheapest workers — same shape, heap facing
  whichever way lets you discard.

## The other three uses

- **k-way merge**: one entry per list in the heap, and when you poll one you
  offer its successor. O(N log k), and it never holds more than k.
- **Two-heap median**: \`low\` is a max-heap of the smaller half, \`high\` a min-heap
  of the larger. \`low.offer(x); high.offer(low.poll()); if (high.size() >
  low.size()) low.offer(high.poll());\` Median is \`low.peek()\` when sizes differ,
  the average of the two roots when equal.
- **Greedy "best available right now"**, where the set of available things
  changes each step — task scheduling, connecting sticks, reorganising a string.

## Heap against the alternatives

| | Sort then take k | Heap of size k | Quickselect |
|---|---|---|---|
| Time | O(n log n) | O(n log k) | O(n) avg, O(n²) worst |
| Space | O(n) | O(k) | O(1) |
| Works on a stream | no | yes | no |
| Modifies input | yes | no | yes |

- k near n, or you want the rest sorted too: sort.
- k small, n huge: heap.
- Data arriving one at a time: heap, and nothing else.
- One offline query and you may reorder the array: quickselect.

## The bugs

- Max-heap for the k largest. The direction is the classic error.
- Expecting iteration order to be sorted order.
- \`(x, y) -> x[0] - y[0]\` overflows. \`Integer.compare(x[0], y[0])\`.
- \`remove(Object)\` in a loop makes it O(n²). Use lazy deletion — leave the stale
  entry and skip it when it surfaces.
- Mutating an element already in the heap. Its place was fixed at insert time.
- Offering in a loop when the whole collection is already in hand.

## The API

| Want | Write |
|---|---|
| Min-heap | \`new PriorityQueue<>()\` |
| Max-heap | \`new PriorityQueue<>(Comparator.reverseOrder())\` |
| Pairs by column 0 | \`new PriorityQueue<int[]>((x, y) -> Integer.compare(x[0], y[0]))\` |
| By a field, reversed | \`Comparator.comparingInt(T::cost).reversed()\` |
| Tiebreak | \`Comparator.comparingInt(T::a).thenComparingInt(T::b)\` |
| O(n) build | \`new PriorityQueue<>(list)\` |
| Look, take | \`pq.peek()\`, \`pq.poll()\` — both \`null\` if empty |
| Throw if empty | \`pq.element()\`, \`pq.remove()\` |

## Worth remembering

- A heap knows one thing. If you need the second smallest, a range, or "is x in
  here", you wanted [BST and ordered set](#/dsa/bst-ordered-set/notes).
- If the data is already in order, a plain queue beats a heap. Do not reach for
  one out of habit.
- Sort first, heap on a second key: that combination is most of the hard band —
  see [sorting](#/dsa/sorting/notes).
`;export{e as default};